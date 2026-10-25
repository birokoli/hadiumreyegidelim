// Ramazan 2027 rezervasyonları (25 Ekim). Tablo yalnızca eklenir (CREATE TABLE IF NOT EXISTS), Prisma modeli yok; parametreli SQL.
// Rezervasyon anında yer ayrılır; ödeme RAMAZAN.odemeSaat içinde işaretlenmezse kayıt kendiliğinden boş sayılır (silinmez).
// Aynı bloğun iki kez satılmaması için yazma işlemi danışma kilidiyle (pg_advisory_xact_lock) sıraya girer.
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/catalog";
import { parseTransferSlug } from "@/lib/catalog/transfers";
import { unitPrice } from "@/lib/pricing/plan";
import { BLOK_SAYISI, RAMAZAN, RAMAZAN_PAKETLERI, acikOda, paketTarihleri, ramazanFiyat, ramazanPaketi, uygunOda, type Doluluk } from "./paketler";

let ready: Promise<void> | null = null;
async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "RamazanRezervasyon" (
      "id" TEXT PRIMARY KEY,
      "kod" TEXT NOT NULL,
      "oda" INTEGER NOT NULL,
      "bloklar" TEXT NOT NULL,
      "paket" TEXT NOT NULL,
      "kisi" INTEGER NOT NULL,
      "adSoyad" TEXT NOT NULL,
      "telefon" TEXT NOT NULL,
      "eposta" TEXT,
      "yolcular" TEXT NOT NULL,
      "kisiBasiUsd" DOUBLE PRECISION NOT NULL,
      "toplamUsd" DOUBLE PRECISION NOT NULL,
      "durum" TEXT NOT NULL DEFAULT 'bekliyor',
      "sonOdeme" TIMESTAMP(3) NOT NULL,
      "pazarlamaIzni" BOOLEAN NOT NULL DEFAULT false,
      "not" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "RamazanRezervasyon_kod_key" ON "RamazanRezervasyon"("kod")`,
    `CREATE INDEX IF NOT EXISTS "RamazanRezervasyon_oda_idx" ON "RamazanRezervasyon"("oda")`,
    // Ödeme altyapısı hazırlığı (25 Ekim): yöntem (whatsapp | sağlayıcı adı), sağlayıcı referansı, tahsil edilen tutar, tarih
    `ALTER TABLE "RamazanRezervasyon" ADD COLUMN IF NOT EXISTS "odemeYontemi" TEXT`,
    `ALTER TABLE "RamazanRezervasyon" ADD COLUMN IF NOT EXISTS "odemeRef" TEXT`,
    `ALTER TABLE "RamazanRezervasyon" ADD COLUMN IF NOT EXISTS "odenenUsd" DOUBLE PRECISION`,
    `ALTER TABLE "RamazanRezervasyon" ADD COLUMN IF NOT EXISTS "odemeTarihi" TIMESTAMP(3)`,
  ];
  for (const sql of statements) await prisma.$executeRawUnsafe(sql);
}
export function ensureRamazanSchema() {
  ready ??= migrate().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export type RamazanDurum = "bekliyor" | "odendi" | "iptal";
export type Rezervasyon = {
  id: string; kod: string; oda: number; bloklar: string; paket: string; kisi: number; adSoyad: string; telefon: string; eposta: string | null;
  yolcular: string; kisiBasiUsd: number; toplamUsd: number; durum: RamazanDurum; sonOdeme: Date; pazarlamaIzni: boolean; not: string | null; createdAt: Date;
  odemeYontemi: string | null; odemeRef: string | null; odenenUsd: number | null; odemeTarihi: Date | null;
};

/** Yer tutan kayıt: ödenmiş ya da süresi dolmamış bekleyen */
export const aktif = (r: Pick<Rezervasyon, "durum" | "sonOdeme">, simdi = new Date()) =>
  r.durum === "odendi" || (r.durum === "bekliyor" && new Date(r.sonOdeme) > simdi);

type Sorgu = Pick<typeof prisma, "$queryRaw">;
async function dolulukOku(db: Sorgu): Promise<Doluluk> {
  const rows = await db.$queryRaw<{ oda: number; bloklar: string; durum: RamazanDurum; sonOdeme: Date }[]>`
    SELECT "oda", "bloklar", "durum", "sonOdeme" FROM "RamazanRezervasyon" WHERE "durum" <> 'iptal'`;
  const d: Doluluk = {};
  for (const r of rows) {
    if (!aktif(r)) continue;
    (d[r.oda] ??= []).push(...r.bloklar.split(",").map(Number));
  }
  return d;
}

/** Bir grubun gidiş-dönüş Camry transfer satış fiyatı (katalog, Şubat 2027) */
export async function ramazanTransferUsd(): Promise<number | null> {
  const catalog = await getCatalog();
  let toplam = 0;
  for (const rota of RAMAZAN.transferRotalari) {
    const item = catalog.find((c) => {
      const t = parseTransferSlug(c.slug);
      return t?.route.key === rota && t.vehicle === RAMAZAN.arac;
    });
    const fiyat = item ? unitPrice(item, "2027-02") : null;
    if (fiyat == null) return null;
    toplam += fiyat;
  }
  return Math.round(toplam * 100) / 100;
}

export type Secenek = {
  id: string; tur: number; grup: number | null; ad: string; ramazan: string; giris: string; cikis: string; gece: number;
  musait: boolean; fiyatlar: { kisi: number; kisiBasiUsd: number; toplamUsd: number }[];
};

/** Sayfa için: her paketin tarihleri, şu anki müsaitliği ve 2/3/4 kişi fiyatı (kişisel veri yok) */
export async function ramazanDurumu(): Promise<{ secenekler: Secenek[]; acikOda: { oda: number; dolu: number[] }; transferUsd: number } | null> {
  await ensureRamazanSchema();
  const transferUsd = await ramazanTransferUsd();
  if (transferUsd == null) return null;
  const doluluk = await dolulukOku(prisma);
  const secenekler = RAMAZAN_PAKETLERI.map((p) => ({
    id: p.id, tur: p.tur, grup: p.grup, ad: p.ad, ...paketTarihleri(p),
    musait: uygunOda(doluluk, p) != null,
    fiyatlar: RAMAZAN.kisiler.map((kisi) => ({ kisi, ...ramazanFiyat(p, kisi, transferUsd) })),
  }));
  return { secenekler, acikOda: acikOda(doluluk), transferUsd };
}

const kodUret = () => `RMZ-${randomInt(0, 36 ** 5).toString(36).toUpperCase().padStart(5, "0")}`;

export type YeniRezervasyon = { paketId: string; kisi: number; adSoyad: string; telefon: string; eposta: string | null; yolcular: string[]; pazarlamaIzni: boolean };
export type RezervasyonSonucu =
  | { ok: true; kod: string; oda: number; paket: string; kisi: number; kisiBasiUsd: number; toplamUsd: number; sonOdeme: Date }
  | { ok: false; hata: string };

export async function rezervasyonYap(g: YeniRezervasyon): Promise<RezervasyonSonucu> {
  await ensureRamazanSchema();
  const p = ramazanPaketi(g.paketId);
  if (!p) return { ok: false, hata: "Paket bulunamadı." };
  if (!RAMAZAN.kisiler.includes(g.kisi as 2 | 3 | 4)) return { ok: false, hata: "Oda 2, 3 ya da 4 kişiyle satılır." };
  const transferUsd = await ramazanTransferUsd();
  if (transferUsd == null) return { ok: false, hata: "Fiyat şu an hesaplanamıyor; WhatsApp'tan yazın." };
  const { kisiBasiUsd, toplamUsd } = ramazanFiyat(p, g.kisi, transferUsd);
  const sonOdeme = new Date(Date.now() + RAMAZAN.odemeSaat * 3600 * 1000);

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(482027)`;
    const oda = uygunOda(await dolulukOku(tx), p);
    if (oda == null) return { ok: false as const, hata: "Bu tarihler az önce doldu. Açık kalan tarihlerden birini seçin." };
    const id = `rmz_${Date.now().toString(36)}${randomInt(0, 36 ** 6).toString(36)}`;
    let kod = kodUret();
    for (let i = 0; i < 5; i++) {
      const var_ = await tx.$queryRaw<{ n: number }[]>`SELECT 1 AS n FROM "RamazanRezervasyon" WHERE "kod" = ${kod}`;
      if (!var_.length) break;
      kod = kodUret();
    }
    await tx.$executeRaw`INSERT INTO "RamazanRezervasyon"
      ("id","kod","oda","bloklar","paket","kisi","adSoyad","telefon","eposta","yolcular","kisiBasiUsd","toplamUsd","durum","sonOdeme","pazarlamaIzni")
      VALUES (${id}, ${kod}, ${oda}, ${p.bloklar.join(",")}, ${p.id}, ${g.kisi}, ${g.adSoyad}, ${g.telefon}, ${g.eposta}, ${JSON.stringify(g.yolcular)},
              ${kisiBasiUsd}, ${toplamUsd}, 'bekliyor', ${sonOdeme}, ${g.pazarlamaIzni})`;
    return { ok: true as const, kod, oda, paket: p.ad, kisi: g.kisi, kisiBasiUsd, toplamUsd, sonOdeme };
  });
}

// ── Admin ──
export async function rezervasyonlar(): Promise<Rezervasyon[]> {
  await ensureRamazanSchema();
  return prisma.$queryRaw<Rezervasyon[]>`SELECT * FROM "RamazanRezervasyon" ORDER BY "oda" ASC, "createdAt" ASC`;
}

/** Durum değişikliği. Süresi dolmuş bekleyen kayıt "ödendi" yapılırken blokları hâlâ boşsa yeniden yer tutar; doluysa reddedilir.
 * odeme: ödeme bilgisi (admin'den elle: yöntem "whatsapp"; sağlayıcı bildiriminden: sağlayıcı adı, referans ve tutar). */
export async function durumDegistir(
  id: string, durum: RamazanDurum, not?: string | null,
  odeme?: { yontem: string; ref?: string | null; tutarUsd?: number | null },
): Promise<{ ok: boolean; hata?: string }> {
  await ensureRamazanSchema();
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(482027)`;
    const [r] = await tx.$queryRaw<Rezervasyon[]>`SELECT * FROM "RamazanRezervasyon" WHERE "id" = ${id}`;
    if (!r) return { ok: false, hata: "Kayıt bulunamadı." };
    if (durum === "odendi" && r.durum === "odendi") return { ok: true }; // aynı bildirim iki kez gelirse
    if (durum === "odendi" && !aktif(r)) {
      const d = await dolulukOku(tx);
      const bloklar = r.bloklar.split(",").map(Number);
      if ((d[r.oda] ?? []).some((b) => bloklar.includes(b))) return { ok: false, hata: "Süresi dolan bu kaydın yeri başka bir rezervasyona geçmiş." };
    }
    await tx.$executeRaw`UPDATE "RamazanRezervasyon" SET "durum" = ${durum}, "not" = COALESCE(${not ?? null}, "not"), "updatedAt" = NOW() WHERE "id" = ${id}`;
    if (durum === "odendi") {
      await tx.$executeRaw`UPDATE "RamazanRezervasyon" SET "odemeYontemi" = ${odeme?.yontem ?? "whatsapp"}, "odemeRef" = ${odeme?.ref ?? null},
        "odenenUsd" = ${odeme?.tutarUsd ?? r.toplamUsd}, "odemeTarihi" = NOW() WHERE "id" = ${id}`;
    }
    return { ok: true };
  });
}

/** Admin özeti: her odanın blok durumu ve oda bazında gelir/maliyet */
export async function odaOzeti() {
  const liste = await rezervasyonlar();
  const simdi = new Date();
  const odalar = new Map<number, { blok: { no: number; kod: string | null; durum: "bos" | "bekliyor" | "odendi" }[]; gelirUsd: number }>();
  for (const r of liste) {
    if (!aktif(r, simdi)) continue;
    const o = odalar.get(r.oda) ?? { blok: Array.from({ length: BLOK_SAYISI }, (_, i) => ({ no: i + 1, kod: null, durum: "bos" as const })), gelirUsd: 0 };
    for (const b of r.bloklar.split(",").map(Number)) o.blok[b - 1] = { no: b, kod: r.kod, durum: r.durum === "odendi" ? "odendi" : "bekliyor" };
    o.gelirUsd += r.toplamUsd;
    odalar.set(r.oda, o);
  }
  return [...odalar.entries()].sort((a, b) => a[0] - b[0]).map(([oda, o]) => ({ oda, ...o, dolu: o.blok.every((b) => b.durum !== "bos") }));
}

/** Ödeme sağlayıcısından gelen başarılı ödeme: koda göre kaydı bulur, tutar tutuyorsa "ödendi" yapar (tekrar gelirse etkisiz). */
export async function odemeBildiriminiIsle(b: { kod: string; ref: string; tutarUsd: number; yontem: string }): Promise<{ ok: boolean; hata?: string }> {
  await ensureRamazanSchema();
  const [r] = await prisma.$queryRaw<Rezervasyon[]>`SELECT * FROM "RamazanRezervasyon" WHERE "kod" = ${b.kod}`;
  if (!r) return { ok: false, hata: "Rezervasyon bulunamadı." };
  if (r.durum === "iptal") return { ok: false, hata: "İptal edilmiş rezervasyon." };
  if (b.tutarUsd + 0.01 < r.toplamUsd) return { ok: false, hata: "Ödenen tutar eksik." };
  return durumDegistir(r.id, "odendi", null, { yontem: b.yontem, ref: b.ref, tutarUsd: b.tutarUsd });
}
