// Mobil uygulama hatırlatmaları (28 Ekim). Günlük özet değil (kullanıcı istemedi); yalnızca dosya bazında yapılacak iş varsa:
// - teklifin geçerliliği yarın bitiyor
// - onaylanmış dosyada yolculuğa 7 / 3 / 1 gün kaldı (ödeme / uçuş / karşılama eksikse metinde, tutar yazılmaz)
// Ayrı bir Vercel cron'u eklemek dağıtımı durdurdu (28 Ekim); bu yüzden 5 dakikalık publish-scheduled içinden
// Türkiye saatiyle 09:00'dan sonraki ilk çalışmada, günde bir kez (Setting işaretiyle) çalışır.
import { prisma } from "@/lib/prisma";
import { listDosyalar } from "@/lib/satis";
import { genelToplam, gunKaldi, odenen, onaylandiMi } from "@/lib/satis/ortak";
import { bildir, kisaAd } from "./bildir";
import { hosgeldinCalistir } from "@/lib/hosgeldin";

/** Bülten 2 haftada bir elle gönderilir (18 Kasım, kullanıcı seçimi); son paket bülteninin üstünden 14 gün geçtiyse hatırlatır. */
const BULTEN_ARALIK_GUN = 14;
export async function bultenHatirlatma(simdi = new Date()): Promise<number> {
  const [son, hatirlatma] = await Promise.all([
    prisma.$queryRawUnsafe<{ t: Date }[]>(`SELECT MAX("createdAt") AS "t" FROM "UyeGonderim" WHERE "tur" = 'paket'`).then((r) => r[0]?.t ?? null).catch(() => null),
    prisma.setting.findUnique({ where: { key: "BULTEN_HATIRLATMA_SON" } }).catch(() => null),
  ]);
  const gun = (d: Date | string) => (simdi.getTime() - new Date(d).getTime()) / 86_400_000;
  if (son && gun(son) < BULTEN_ARALIK_GUN) return 0;
  if (hatirlatma?.value && gun(hatirlatma.value) < BULTEN_ARALIK_GUN) return 0;
  await bildir("bulten", { baslik: "Bülten zamanı", govde: son ? `Son paket bülteni ${Math.floor(gun(son))} gün önce gitti.` : "Henüz paket bülteni gönderilmedi.", yol: "/pazarlama/bulten" });
  await prisma.setting.upsert({ where: { key: "BULTEN_HATIRLATMA_SON" }, update: { value: simdi.toISOString() }, create: { key: "BULTEN_HATIRLATMA_SON", value: simdi.toISOString() } });
  return 1;
}

export async function hatirlatmalar(): Promise<number> {
  const dosyalar = await listDosyalar();
  let n = 0;
  for (const d of dosyalar) {
    if (d.status === "iptal" || d.status === "tamamlandi") continue;
    const ad = kisaAd(d.data.musteriAdi);
    if (d.status === "teklif" && d.data.gecerlilik && gunKaldi(d.data.gecerlilik) === 1) {
      await bildir("hatirlatma", { baslik: "Teklif yarın sona eriyor", govde: `${ad} · ${d.no}`, yol: `/satis/${d.no}` });
      n++;
    }
    const kalan = gunKaldi(d.data.gidis);
    if (onaylandiMi(d.status) && kalan != null && [7, 3, 1].includes(kalan)) {
      const eksik: string[] = [];
      if (odenen(d.data) + 0.5 < genelToplam(d.data)) eksik.push("ödeme tamamlanmadı");
      if (!d.data.ucusGidis) eksik.push("uçuş bilgisi yok");
      if (!d.data.karsilayanAd) eksik.push("karşılama atanmadı");
      await bildir("hatirlatma", { baslik: `Yolculuğa ${kalan} gün`, govde: `${ad} · ${d.no}${eksik.length ? ` · ${eksik.join(", ")}` : ""}`, yol: `/satis/${d.no}` });
      n++;
    }
  }
  return n;
}

/** Günde bir kez: Türkiye saatiyle 09:00 sonrası, bugün çalışmadıysa */
export async function gunlukHatirlatma(simdi = new Date()) {
  const tr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false }).formatToParts(simdi);
  const p = (t: string) => tr.find((x) => x.type === t)?.value ?? "";
  if (Number(p("hour")) < 9) return null;
  const key = `MOBIL_HATIRLATMA:${p("year")}-${p("month")}-${p("day")}`;
  const ilk = await prisma.setting.create({ data: { key, value: simdi.toISOString() } }).then(() => true).catch(() => false);
  if (!ilk) return null;
  // Her biri ayrı: biri hata verirse diğerleri yine çalışır
  const [dosya, hosgeldin, bulten] = await Promise.all([
    hatirlatmalar().catch((e) => (console.error("[hatirlatma] dosya", e), 0)),
    hosgeldinCalistir(simdi).catch((e) => (console.error("[hatirlatma] hoş geldin serisi", e), 0)),
    bultenHatirlatma(simdi).catch((e) => (console.error("[hatirlatma] bülten", e), 0)),
  ]);
  return { dosya, hosgeldin, bulten };
}
