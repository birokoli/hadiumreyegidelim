// Umre dosyası (13 Ekim, kullanıcı: "adam bizden umre aldı; hangi otel, kim karşılayacak, hangi tarihler").
// Kabul edilen fiyat teklifi (Quotation) bir umre dosyasına dönüşür; satışı yapan kişi admin'de doldurur, müşteri profilinde
// görür. Tablolar yalnızca eklenir (CREATE TABLE IF NOT EXISTS), Prisma modeli yok. Dosyanın ayrıntıları "data" JSON'unda.
//
// Güvenlik: müşteriye bağlama ya açıkça (admin "üyeye bağla", dosya.userId) ya da e-postası kodla doğrulanmış üyenin
// e-postasıyla olur. Telefon doğrulanamadığı için telefonla otomatik bağlama yok; admin'e öneri olarak gösterilir.
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const ASAMALAR = [
  { key: "teklif", label: "Teklif" },
  { key: "onaylandi", label: "Onaylandı" },
  { key: "odeme", label: "Ödeme" },
  { key: "vize_basvuru", label: "Vize başvurusu" },
  { key: "vize_cikti", label: "Vize çıktı" },
  { key: "yolculuk", label: "Yolculuk" },
  { key: "tamamlandi", label: "Tamamlandı" },
] as const;
export type AsamaKey = (typeof ASAMALAR)[number]["key"];
export const asamaIndex = (k: string) => Math.max(0, ASAMALAR.findIndex((a) => a.key === k));
export const asamaLabel = (k: string) => ASAMALAR.find((a) => a.key === k)?.label ?? k;

export type OtelBilgi = { slug?: string; ad: string; giris?: string; cikis?: string; onayNo?: string; oda?: string };
export type DosyaData = {
  musteriAdi: string;
  yetiskin: number;
  cocuk: number;
  gidis?: string; // YYYY-MM-DD
  donus?: string;
  onceSehir?: "mekke" | "medine";
  ucusGidis?: string; // müşteri ya da satış girer: "TK 98 · 14 Kas 09:40 → 13:05"
  ucusDonus?: string;
  mekke?: OtelBilgi;
  medine?: OtelBilgi;
  karsilamaYeri?: string;
  karsilayanAd?: string;
  karsilayanTel?: string;
  tren?: string;
  donusTransfer?: string;
  toplamUsd?: number;
  odenenUsd?: number;
  sonOdeme?: string;
  not?: string;
  asamaTarihleri?: Partial<Record<AsamaKey, string>>; // aşamaya geçiş tarihi (ISO)
};

export type Dosya = {
  id: string;
  no: string;
  quotationId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  status: AsamaKey;
  data: DosyaData;
  createdAt: Date;
  updatedAt: Date;
};
export type Belge = { id: string; dosyaId: string; ad: string; tur: string; mime: string; boyut: number; createdAt: Date };

export const BELGE_TURLERI: Record<string, string> = { vize: "Vize", otel: "Otel belgesi", tren: "Tren bileti", ucak: "Uçak bileti", diger: "Diğer" };

let ready: Promise<void> | null = null;
export function ensureUmreSchema() {
  ready ??= (async () => {
    const sql = [
      `CREATE TABLE IF NOT EXISTS "UmreDosyasi" (
        "id" TEXT PRIMARY KEY,
        "no" TEXT NOT NULL UNIQUE,
        "quotationId" TEXT NOT NULL UNIQUE,
        "userId" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "status" TEXT NOT NULL DEFAULT 'onaylandi',
        "data" TEXT NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS "UmreDosyasi_userId_idx" ON "UmreDosyasi"("userId")`,
      `CREATE INDEX IF NOT EXISTS "UmreDosyasi_email_idx" ON "UmreDosyasi"("email")`,
      // Belgeler veritabanında saklanır (herkese açık depolama yok; vize gibi kişisel belgeler yalnızca sahibine iner)
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
      // Teklifin üyeye açıkça bağlanması (admin bağlar ya da müşteri talep eder)
      `CREATE TABLE IF NOT EXISTS "UyeTeklif" (
        "userId" TEXT NOT NULL,
        "quotationId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("userId","quotationId")
      )`,
    ];
    for (const s of sql) await prisma.$executeRawUnsafe(s);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

type Row = Omit<Dosya, "data"> & { data: string };
const parse = (r: Row): Dosya => ({ ...r, status: r.status as AsamaKey, data: JSON.parse(r.data || "{}") as DosyaData });
const COLS = `"id","no","quotationId","userId","email","phone","status","data","createdAt","updatedAt"`;

export const phoneDigits = (p: string | null | undefined) => {
  const d = String(p ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : null;
};

async function nextNo(): Promise<string> {
  const yil = new Date().getFullYear();
  const rows = await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT COUNT(*)::int AS n FROM "UmreDosyasi" WHERE "no" LIKE $1`, `HUG-${yil}-%`);
  return `HUG-${yil}-${String((rows[0]?.n ?? 0) + 1).padStart(4, "0")}`;
}

export async function getDosyaByQuotation(quotationId: string): Promise<Dosya | null> {
  await ensureUmreSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" WHERE "quotationId" = $1`, quotationId);
  return rows[0] ? parse(rows[0]) : null;
}

export async function getDosyaByNo(no: string): Promise<Dosya | null> {
  await ensureUmreSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" WHERE "no" = $1`, no);
  return rows[0] ? parse(rows[0]) : null;
}

export async function listDosyalar(): Promise<Dosya[]> {
  await ensureUmreSchema();
  return (await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" ORDER BY "updatedAt" DESC LIMIT 500`)).map(parse);
}

/** Kabul edilmiş tekliften dosya açar (varsa olanı döndürür); müşteri bilgileri tekliften gelir. */
export async function openDosya(quotationId: string): Promise<Dosya> {
  await ensureUmreSchema();
  const var_ = await getDosyaByQuotation(quotationId);
  if (var_) return var_;
  const q = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!q) throw new Error("Teklif bulunamadı");
  const data: DosyaData = {
    musteriAdi: q.customerName,
    yetiskin: q.adultsCount,
    cocuk: q.childrenCount,
    asamaTarihleri: { teklif: q.createdAt.toISOString(), onaylandi: new Date().toISOString() },
  };
  const id = `ud_${Date.now().toString(36)}${randomInt(0, 1e9).toString(36)}`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO "UmreDosyasi" ("id","no","quotationId","email","phone","status","data") VALUES ($1,$2,$3,$4,$5,'onaylandi',$6)`,
    id, await nextNo(), quotationId, q.customerEmail?.trim().toLowerCase() || null, q.customerPhone || null, JSON.stringify(data),
  );
  return (await getDosyaByQuotation(quotationId))!;
}

/** Dosyayı günceller; aşama değiştiyse geçiş tarihini yazar. Önceki aşamayı döndürür (bildirim için). */
export async function saveDosya(id: string, patch: { status?: AsamaKey; email?: string | null; phone?: string | null; userId?: string | null; data?: Partial<DosyaData> }): Promise<{ onceki: AsamaKey; dosya: Dosya }> {
  await ensureUmreSchema();
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" WHERE "id" = $1`, id);
  if (!rows[0]) throw new Error("Dosya bulunamadı");
  const d = parse(rows[0]);
  const data: DosyaData = { ...d.data, ...(patch.data ?? {}) };
  const status = patch.status ?? d.status;
  const tarihler: Partial<Record<AsamaKey, string>> = { ...(d.data.asamaTarihleri ?? {}), ...(patch.data?.asamaTarihleri ?? {}) };
  if (status !== d.status && !patch.data?.asamaTarihleri?.[status]) tarihler[status] = new Date().toISOString();
  // Aşama geri alındıysa sonraki aşamaların tarihleri silinir
  for (const a of ASAMALAR) if (asamaIndex(a.key) > asamaIndex(status)) delete tarihler[a.key];
  data.asamaTarihleri = tarihler;
  await prisma.$executeRawUnsafe(
    `UPDATE "UmreDosyasi" SET "status"=$2, "data"=$3, "email"=$4, "phone"=$5, "userId"=$6, "updatedAt"=NOW() WHERE "id"=$1`,
    id, status, JSON.stringify(data),
    patch.email !== undefined ? patch.email?.trim().toLowerCase() || null : d.email,
    patch.phone !== undefined ? patch.phone || null : d.phone,
    patch.userId !== undefined ? patch.userId : d.userId,
  );
  const rows2 = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" WHERE "id" = $1`, id);
  return { onceki: d.status, dosya: parse(rows2[0]) };
}

/** Üyenin dosyaları: açıkça bağlı olanlar + (e-postası doğrulanmışsa) aynı e-postalı dosyalar. */
export async function dosyalarOfMember(m: { id: string; email: string }, emailVerified: boolean): Promise<Dosya[]> {
  await ensureUmreSchema();
  const rows = emailVerified
    ? await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" WHERE "userId" = $1 OR lower("email") = lower($2) ORDER BY "createdAt" DESC`, m.id, m.email)
    : await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "UmreDosyasi" WHERE "userId" = $1 ORDER BY "createdAt" DESC`, m.id);
  return rows.map(parse);
}

export async function memberCanSeeDosya(d: Dosya, m: { id: string; email: string }, emailVerified: boolean) {
  return d.userId === m.id || (emailVerified && !!d.email && d.email.toLowerCase() === m.email.toLowerCase());
}

/** Üyenin teklifleri: açıkça bağlı + dosyası üyeye bağlı olan + (doğrulanmış e-postayla) teklifteki e-posta. */
export async function tekliflerOfMember(m: { id: string; email: string }, emailVerified: boolean) {
  await ensureUmreSchema();
  const dosyalar = await dosyalarOfMember(m, emailVerified);
  const bagli = await prisma.$queryRaw<{ quotationId: string }[]>`SELECT "quotationId" FROM "UyeTeklif" WHERE "userId" = ${m.id}`;
  const ids = [...new Set([...bagli.map((b) => b.quotationId), ...dosyalar.map((d) => d.quotationId)])];
  return prisma.quotation.findMany({
    where: { OR: [{ id: { in: ids } }, ...(emailVerified ? [{ customerEmail: { equals: m.email, mode: "insensitive" as const } }] : [])] },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { saleTotalUsd: true } } },
  });
}

export async function linkTeklif(userId: string, quotationId: string) {
  await ensureUmreSchema();
  await prisma.$executeRaw`INSERT INTO "UyeTeklif" ("userId","quotationId") VALUES (${userId}, ${quotationId}) ON CONFLICT DO NOTHING`;
}

export async function memberCanSeeTeklif(quotationId: string, m: { id: string; email: string }, emailVerified: boolean) {
  const list = await tekliflerOfMember(m, emailVerified);
  return list.some((q) => q.id === quotationId);
}

// ─── Belgeler ──────────────────────────────────────────────────────────────
export async function listBelgeler(dosyaId: string): Promise<Belge[]> {
  await ensureUmreSchema();
  return prisma.$queryRaw<Belge[]>`SELECT "id","dosyaId","ad","tur","mime","boyut","createdAt" FROM "UmreBelge" WHERE "dosyaId" = ${dosyaId} ORDER BY "createdAt"`;
}

export async function addBelge(dosyaId: string, b: { ad: string; tur: string; mime: string; base64: string }) {
  await ensureUmreSchema();
  const boyut = Math.floor((b.base64.length * 3) / 4);
  const id = `ub_${Date.now().toString(36)}${randomInt(0, 1e9).toString(36)}`;
  await prisma.$executeRaw`INSERT INTO "UmreBelge" ("id","dosyaId","ad","tur","mime","boyut","icerik") VALUES (${id}, ${dosyaId}, ${b.ad}, ${b.tur}, ${b.mime}, ${boyut}, ${b.base64})`;
  return id;
}

export async function getBelge(id: string) {
  await ensureUmreSchema();
  const rows = await prisma.$queryRaw<(Belge & { icerik: string })[]>`SELECT * FROM "UmreBelge" WHERE "id" = ${id}`;
  return rows[0] ?? null;
}

export async function deleteBelge(id: string) {
  await ensureUmreSchema();
  await prisma.$executeRaw`DELETE FROM "UmreBelge" WHERE "id" = ${id}`;
}

// ─── Profil kampanyaları (admin'den elle) ──────────────────────────────────
export type ProfilKampanya = { id: string; baslik: string; aciklama: string; link: string; hat?: string; aktif: boolean };
export async function profilKampanyalari(): Promise<ProfilKampanya[]> {
  const s = await prisma.setting.findUnique({ where: { key: "PROFIL_KAMPANYALAR" } }).catch(() => null);
  try {
    return (JSON.parse(s?.value ?? "[]") as ProfilKampanya[]).filter((k) => k && k.baslik);
  } catch {
    return [];
  }
}
export async function saveProfilKampanyalari(list: ProfilKampanya[]) {
  const value = JSON.stringify(list.slice(0, 12));
  await prisma.setting.upsert({ where: { key: "PROFIL_KAMPANYALAR" }, update: { value }, create: { key: "PROFIL_KAMPANYALAR", value } });
}

/** Gün sayacı (Türkiye saatine göre bugünden gidiş tarihine). */
export function gunKaldi(gidis?: string): number | null {
  if (!gidis) return null;
  const bugun = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date()));
  const g = new Date(gidis);
  if (Number.isNaN(g.getTime())) return null;
  return Math.round((g.getTime() - bugun.getTime()) / 86_400_000);
}

export const trTarih = (iso?: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) =>
  iso ? new Date(iso).toLocaleDateString("tr-TR", { timeZone: "UTC", ...opts }) : "";
