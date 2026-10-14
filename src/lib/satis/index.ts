// Satış masası (14 Ekim, kullanıcı: "sıfırdan, yeni sisteme uygun; eski teklif sistemi hatalı"). Her müşteri için tek kayıt:
// SatisDosyasi (HUG-2026-0001). Talep → teklif (WhatsApp mesajı + onay bağlantısı) → onay → ödeme → vize → yolculuk →
// tamamlandı. Teklif kalemleri onaydan sonra yolculuk planı olur (oteller, tarihler); voucher aynı veriden üretilir.
// Tablo yalnızca eklenir (CREATE TABLE IF NOT EXISTS). Ayrıntılar "data" JSON'unda; belgeler UmreBelge tablosunda.
//
// Ödeme (kullanıcı): genelde tek seferde; bölünmüşse otel + vize + hoca ücretinin yarısı önden, transfer + hoca ücretinin
// diğer yarısı Cidde'de alınır.
import { randomBytes, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ASAMALAR, asamaIndex, asamaLabel, SATIS_TURLERI, type Dosya, type DosyaData, type SatisTuru } from "./ortak";

export * from "./ortak";

// ─── Veritabanı ────────────────────────────────────────────────────────────
let ready: Promise<void> | null = null;
export function ensureSatisSchema() {
  ready ??= (async () => {
    const sql = [
      `CREATE TABLE IF NOT EXISTS "SatisDosyasi" (
        "id" TEXT PRIMARY KEY,
        "no" TEXT NOT NULL UNIQUE,
        "token" TEXT NOT NULL UNIQUE,
        "userId" TEXT,
        "sorumluId" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "status" TEXT NOT NULL DEFAULT 'talep',
        "data" TEXT NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS "SatisDosyasi_userId_idx" ON "SatisDosyasi"("userId")`,
      `CREATE INDEX IF NOT EXISTS "SatisDosyasi_email_idx" ON "SatisDosyasi"("email")`,
      `CREATE TABLE IF NOT EXISTS "UmreBelge" (
        "id" TEXT PRIMARY KEY,
        "dosyaId" TEXT NOT NULL,
        "ad" TEXT NOT NULL,
        "tur" TEXT NOT NULL DEFAULT 'diger',
        "mime" TEXT NOT NULL,
        "boyut" INTEGER NOT NULL,
        "icerik" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS "UmreBelge_dosyaId_idx" ON "UmreBelge"("dosyaId")`,
    ];
    for (const s of sql) await prisma.$executeRawUnsafe(s);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

type Row = Omit<Dosya, "data"> & { data: string };
const COLS = `"id","no","token","userId","sorumluId","email","phone","status","data","createdAt","updatedAt"`;
const bos = (): DosyaData => ({ musteriAdi: "", yetiskin: 1, cocuk: 0, bebek: 0, kalemler: [], odemePlani: "tek", odemeler: [], asamaTarihleri: {}, gecmis: [] });
const parse = (r: Row): Dosya => ({ ...r, status: r.status as Dosya["status"], data: { ...bos(), ...(JSON.parse(r.data || "{}") as Partial<DosyaData>) } });
export const yeniId = (p: string) => `${p}_${Date.now().toString(36)}${randomInt(0, 1e9).toString(36)}`;

export async function listDosyalar(): Promise<Dosya[]> {
  await ensureSatisSchema();
  return (await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "SatisDosyasi" ORDER BY "updatedAt" DESC LIMIT 1000`)).map(parse);
}
export async function getDosya(by: "id" | "no" | "token", value: string): Promise<Dosya | null> {
  await ensureSatisSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "SatisDosyasi" WHERE "${by}" = $1`, value);
  return rows[0] ? parse(rows[0]) : null;
}

/**
 * Dosya numarası (15 Ekim, kullanıcı): HUG + yıl (2) + ay (2) + satış türü (2) + o ay o türdeki müşteri sırası (2, 99'dan sonra 3).
 * Örnek: HUG26100105 = 2026 Ekim, bireysel umre, ayın 5. bireysel umre müşterisi. Ay İstanbul saatine göre.
 * Eski biçimli dosyalar (HUG-2026-0001) olduğu gibi kalır.
 */
async function yeniNo(tur: SatisTuru): Promise<string> {
  const t = new Date(Date.now() + 3 * 3600e3).toISOString();
  const onek = `HUG${t.slice(2, 4)}${t.slice(5, 7)}${tur}`;
  const rows = await prisma.$queryRawUnsafe<{ m: number | null }[]>(
    `SELECT MAX(CAST(SUBSTRING("no" FROM ${onek.length + 1}) AS INTEGER))::int AS m FROM "SatisDosyasi" WHERE "no" LIKE $1 AND SUBSTRING("no" FROM ${onek.length + 1}) ~ '^[0-9]+$'`,
    `${onek}%`,
  );
  return `${onek}${String((rows[0]?.m ?? 0) + 1).padStart(2, "0")}`;
}

export async function createDosya(input: { musteriAdi: string; phone?: string | null; email?: string | null; yetiskin?: number; cocuk?: number; gidis?: string; donus?: string; talepNotu?: string; sorumluId?: string | null; satisTuru?: SatisTuru; kim: string }): Promise<Dosya> {
  await ensureSatisSchema();
  const satisTuru: SatisTuru = input.satisTuru && input.satisTuru in SATIS_TURLERI ? input.satisTuru : "01";
  const no = await yeniNo(satisTuru);
  const simdi = new Date().toISOString();
  const data: DosyaData = {
    ...bos(),
    musteriAdi: input.musteriAdi,
    satisTuru,
    yetiskin: input.yetiskin ?? 1,
    cocuk: input.cocuk ?? 0,
    gidis: input.gidis,
    donus: input.donus,
    talepNotu: input.talepNotu,
    asamaTarihleri: { talep: simdi },
    gecmis: [{ id: yeniId("g"), t: simdi, kim: input.kim, metin: "Dosya açıldı" }],
  };
  const id = yeniId("sd");
  await prisma.$executeRawUnsafe(
    `INSERT INTO "SatisDosyasi" ("id","no","token","sorumluId","email","phone","status","data") VALUES ($1,$2,$3,$4,$5,$6,'talep',$7)`,
    id, no, randomBytes(18).toString("base64url"), input.sorumluId ?? null, input.email?.trim().toLowerCase() || null, input.phone?.trim() || null, JSON.stringify(data),
  );
  return (await getDosya("id", id))!;
}

/** Dosyayı günceller; aşama değişince tarihini ve geçmiş kaydını yazar, geri alınırsa sonraki aşama tarihlerini siler. */
export async function saveDosya(
  id: string,
  patch: { status?: Dosya["status"]; email?: string | null; phone?: string | null; userId?: string | null; sorumluId?: string | null; data?: Partial<DosyaData> },
  kim: string,
  not?: string,
): Promise<{ onceki: Dosya["status"]; dosya: Dosya }> {
  const d = await getDosya("id", id);
  if (!d) throw new Error("Dosya bulunamadı");
  const data: DosyaData = { ...d.data, ...(patch.data ?? {}) };
  const status = patch.status ?? d.status;
  const simdi = new Date().toISOString();
  const gecmis = [...d.data.gecmis];
  if (status !== d.status) {
    const tarihler = { ...d.data.asamaTarihleri };
    if (status !== "iptal") {
      tarihler[status] = simdi;
      for (const a of ASAMALAR) if (asamaIndex(a.key) > asamaIndex(status)) delete tarihler[a.key];
    }
    data.asamaTarihleri = tarihler;
    gecmis.push({ id: yeniId("g"), t: simdi, kim, metin: `Aşama: ${asamaLabel(status)}` });
  }
  if (not) gecmis.push({ id: yeniId("g"), t: simdi, kim, metin: not });
  data.gecmis = gecmis.slice(-200);
  await prisma.$executeRawUnsafe(
    `UPDATE "SatisDosyasi" SET "status"=$2,"data"=$3,"email"=$4,"phone"=$5,"userId"=$6,"sorumluId"=$7,"updatedAt"=NOW() WHERE "id"=$1`,
    id, status, JSON.stringify(data),
    patch.email !== undefined ? patch.email?.trim().toLowerCase() || null : d.email,
    patch.phone !== undefined ? patch.phone?.trim() || null : d.phone,
    patch.userId !== undefined ? patch.userId : d.userId,
    patch.sorumluId !== undefined ? patch.sorumluId : d.sorumluId,
  );
  return { onceki: d.status, dosya: (await getDosya("id", id))! };
}

// ─── Üye ───────────────────────────────────────────────────────────────────
/** Üyenin dosyaları: açıkça bağlı olanlar + (e-postası doğrulanmışsa) aynı e-postalı dosyalar. */
export async function dosyalarOfMember(m: { id: string; email: string }, emailVerified: boolean): Promise<Dosya[]> {
  await ensureSatisSchema();
  const rows = emailVerified
    ? await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "SatisDosyasi" WHERE ("userId" = $1 OR lower("email") = lower($2)) AND "status" <> 'iptal' ORDER BY "createdAt" DESC`, m.id, m.email)
    : await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "SatisDosyasi" WHERE "userId" = $1 AND "status" <> 'iptal' ORDER BY "createdAt" DESC`, m.id);
  return rows.map(parse);
}
export const memberCanSee = (d: Dosya, m: { id: string; email: string }, emailVerified: boolean) =>
  d.userId === m.id || (emailVerified && !!d.email && d.email.toLowerCase() === m.email.toLowerCase());

// ─── Belgeler ──────────────────────────────────────────────────────────────
export type Belge = { id: string; dosyaId: string; ad: string; tur: string; mime: string; boyut: number; createdAt: Date };
export const BELGE_TURLERI: Record<string, string> = { vize: "Vize", otel: "Otel belgesi", tren: "Tren bileti", ucak: "Uçak bileti", diger: "Diğer" };
export async function listBelgeler(dosyaId: string): Promise<Belge[]> {
  await ensureSatisSchema();
  return prisma.$queryRaw<Belge[]>`SELECT "id","dosyaId","ad","tur","mime","boyut","createdAt" FROM "UmreBelge" WHERE "dosyaId" = ${dosyaId} ORDER BY "createdAt"`;
}
export async function addBelge(dosyaId: string, b: { ad: string; tur: string; mime: string; base64: string }) {
  await ensureSatisSchema();
  await prisma.$executeRaw`INSERT INTO "UmreBelge" ("id","dosyaId","ad","tur","mime","boyut","icerik") VALUES (${yeniId("ub")}, ${dosyaId}, ${b.ad}, ${b.tur}, ${b.mime}, ${Math.floor((b.base64.length * 3) / 4)}, ${b.base64})`;
}
export async function getBelge(id: string) {
  await ensureSatisSchema();
  const rows = await prisma.$queryRaw<(Belge & { icerik: string })[]>`SELECT * FROM "UmreBelge" WHERE "id" = ${id}`;
  return rows[0] ?? null;
}
export async function deleteBelge(id: string) {
  await ensureSatisSchema();
  await prisma.$executeRaw`DELETE FROM "UmreBelge" WHERE "id" = ${id}`;
}
