// Mobil uygulama hatırlatmaları (28 Ekim). Günlük özet değil (kullanıcı istemedi); yalnızca dosya bazında yapılacak iş varsa:
// - teklifin geçerliliği yarın bitiyor
// - onaylanmış dosyada yolculuğa 7 / 3 / 1 gün kaldı (ödeme / uçuş / karşılama eksikse metinde, tutar yazılmaz)
// Ayrı bir Vercel cron'u eklemek dağıtımı durdurdu (28 Ekim); bu yüzden 5 dakikalık publish-scheduled içinden
// Türkiye saatiyle 09:00'dan sonraki ilk çalışmada, günde bir kez (Setting işaretiyle) çalışır.
import { prisma } from "@/lib/prisma";
import { listDosyalar } from "@/lib/satis";
import { genelToplam, gunKaldi, odenen, onaylandiMi } from "@/lib/satis/ortak";
import { bildir, kisaAd } from "./bildir";

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
  return ilk ? hatirlatmalar() : null;
}
