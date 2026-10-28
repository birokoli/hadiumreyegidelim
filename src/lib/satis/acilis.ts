// Teklif bağlantısının açılma kaydı (21 Ekim, kullanıcı: "müşterinin teklifi açıp açmadığını görmemiz gerekli").
// Müşteri /t/<token> sayfasını her açtığında bir satır yazılır. Sayılmayanlar: WhatsApp/Telegram vb. bağlantı önizlemesi için
// sayfayı çeken botlar, admin'in "Teklif sayfası" düğmesi (?onizleme=1) ve admin oturumu açık tarayıcılar.
// Dosya verisine (data.gecmis) yazılmaz: admin dosyayı kaydederken elindeki geçmişle üzerine yazabiliyor; ayrı tablo güvenli.
import { createHash } from "node:crypto";
import { bildirArkada, kisaAd } from "@/lib/mobil/bildir";
import { getDosya } from "./index";
import { prisma } from "@/lib/prisma";

export type TeklifAcilis = { id: string; at: string; cihaz: string };
export type AcilisOzet = { sayi: number; ilk: string | null; son: string | null };

let ready: Promise<void> | null = null;
function ensure() {
  ready ??= (async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TeklifAcilis" (
      "id" TEXT PRIMARY KEY,
      "dosyaId" TEXT NOT NULL,
      "tur" TEXT NOT NULL DEFAULT 'teklif',
      "cihaz" TEXT,
      "ipHash" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TeklifAcilis_dosya_idx" ON "TeklifAcilis"("dosyaId","createdAt")`);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

// Bağlantı önizlemesi çeken uygulamalar ve botlar
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|telegram|slack|discord|skype|viber|line\/|preview|embed|curl|wget|python|axios|node-fetch|go-http|headless|lighthouse|pingdom|uptime/i;

/** Cihazı kısaca: "iPhone · Safari", "Android · Chrome", "Windows · Edge" */
function cihazOf(ua: string): string {
  const os = /iphone/i.test(ua) ? "iPhone" : /ipad/i.test(ua) ? "iPad" : /android/i.test(ua) ? "Android" : /windows/i.test(ua) ? "Windows" : /mac os x/i.test(ua) ? "Mac" : /linux/i.test(ua) ? "Linux" : "Bilinmeyen cihaz";
  const tarayici = /instagram/i.test(ua) ? "Instagram" : /fban|fbav/i.test(ua) ? "Facebook" : /edg\//i.test(ua) ? "Edge" : /samsungbrowser/i.test(ua) ? "Samsung" : /opr\/|opera/i.test(ua) ? "Opera" : /crios|chrome\//i.test(ua) ? "Chrome" : /fxios|firefox/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : "";
  return tarayici ? `${os} · ${tarayici}` : os;
}

/** Açılışı kaydeder; bot, önizleme ya da admin ise kaydetmez. Hata sayfayı etkilemez. */
export async function acilisKaydet(dosyaId: string, o: { ua: string; ip: string | null; admin: boolean; onizleme: boolean }) {
  if (o.admin || o.onizleme || !o.ua || BOT.test(o.ua)) return;
  try {
    await ensure();
    const ipHash = o.ip ? createHash("sha256").update(`teklif:${o.ip}`).digest("hex").slice(0, 16) : null;
    // Aynı kişi sayfayı yenilediğinde (2 dakika içinde, aynı IP) tek açılış sayılır
    const yakin = ipHash
      ? await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT COUNT(*)::int AS "n" FROM "TeklifAcilis" WHERE "dosyaId" = $1 AND "ipHash" = $2 AND "createdAt" > NOW() - INTERVAL '2 minutes'`, dosyaId, ipHash)
      : [{ n: 0 }];
    if (yakin[0]?.n) return;
    // Mobil bildirim: dosyanın o günkü ilk açılışında (her yenilemede değil)
    const bugun = await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT COUNT(*)::int AS "n" FROM "TeklifAcilis" WHERE "dosyaId" = $1 AND "createdAt" > NOW() - INTERVAL '20 hours'`, dosyaId);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "TeklifAcilis" ("id","dosyaId","tur","cihaz","ipHash") VALUES ($1,$2,'teklif',$3,$4)`,
      `ta_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, dosyaId, cihazOf(o.ua), ipHash,
    );
    if (!bugun[0]?.n) {
      const d = await getDosya("id", dosyaId).catch(() => null);
      if (d) bildirArkada("teklif", { baslik: "Teklif açıldı", govde: `${kisaAd(d.data.musteriAdi)} teklifine baktı · ${d.no}`, yol: `/satis/${d.no}` });
    }
  } catch (e) {
    console.error("[teklif-acilis]", e);
  }
}

export async function acilislar(dosyaId: string): Promise<TeklifAcilis[]> {
  await ensure();
  const r = await prisma.$queryRawUnsafe<{ id: string; at: Date; cihaz: string | null }[]>(
    `SELECT "id", "createdAt" AS "at", "cihaz" FROM "TeklifAcilis" WHERE "dosyaId" = $1 ORDER BY "createdAt" DESC LIMIT 100`, dosyaId,
  );
  return r.map((x) => ({ id: x.id, at: new Date(x.at).toISOString(), cihaz: x.cihaz ?? "" }));
}

/** Satış masası listesi için: dosya başına açılma sayısı, ilk ve son açılış */
export async function acilisOzetleri(): Promise<Record<string, AcilisOzet>> {
  await ensure();
  const r = await prisma.$queryRawUnsafe<{ d: string; n: number; ilk: Date; son: Date }[]>(
    `SELECT "dosyaId" AS "d", COUNT(*)::int AS "n", MIN("createdAt") AS "ilk", MAX("createdAt") AS "son" FROM "TeklifAcilis" GROUP BY "dosyaId"`,
  );
  return Object.fromEntries(r.map((x) => [x.d, { sayi: x.n, ilk: new Date(x.ilk).toISOString(), son: new Date(x.son).toISOString() }]));
}
