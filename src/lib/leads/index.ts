// Müşteri havuzu (12 Ekim, kullanıcı): ücretsiz materyal (ör. Tavaf El Kitabı) karşılığında bırakılan iletişim bilgileri.
// Gelen Kutusu'ndan (ContactRequest: gerçek talepler) ayrı tutulur. Tablo yalnızca eklenir (CREATE TABLE / ADD COLUMN IF NOT
// EXISTS), Prisma modeli yok; sorgular parametreli SQL ile. KVKK: aydınlatma onayı zorunlu, ticari ileti izni ayrı ve isteğe bağlı.
// 13 Ekim: e-posta doğrulama (6 haneli kod, 15 dk) ve reklam kaynağı (utm) eklendi.
import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;
async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "MarketingLead" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT,
      "phone" TEXT,
      "source" TEXT NOT NULL,
      "kvkkAccepted" BOOLEAN NOT NULL DEFAULT false,
      "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
      "consentText" TEXT,
      "referrer" TEXT,
      "status" TEXT NOT NULL DEFAULT 'new',
      "note" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS "MarketingLead_source_idx" ON "MarketingLead"("source")`,
    `CREATE INDEX IF NOT EXISTS "MarketingLead_createdAt_idx" ON "MarketingLead"("createdAt")`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3)`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "codeHash" TEXT`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "codeExpires" TIMESTAMP(3)`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "codeAttempts" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "codeSends" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "utm" TEXT`,
    `CREATE INDEX IF NOT EXISTS "MarketingLead_email_idx" ON "MarketingLead"("email")`,
  ];
  for (const sql of statements) await prisma.$executeRawUnsafe(sql);
}
export function ensureLeadSchema() {
  ready ??= migrate().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  kvkkAccepted: boolean;
  marketingConsent: boolean;
  consentText: string | null;
  referrer: string | null;
  utm: string | null;
  emailVerified: boolean;
  verifiedAt: Date | null;
  status: string;
  note: string | null;
  createdAt: Date;
};

export const LEAD_SOURCES: Record<string, string> = { "tavaf-kitapcigi": "Tavaf El Kitabı", "say-kitapcigi": "Sa'y El Kitabı", uyelik: "Üyelik" };
/** Kaynağın verdiği dosya ve e-postadaki görseller (kapak, ikon, kapanış duası). */
export const LEAD_FILES: Record<string, { url: string; page: string; cover: string; icon: string; dua: string }> = {
  "tavaf-kitapcigi": { url: "/indir/tavaf-el-kitabi-2026.pdf", page: "/tavaf-kitapcigi", cover: "/indir/tavaf-el-kitabi-kapak.png", icon: "tavaf", dua: "Tavafta bizleri de dualarınızdan eksik etmeyin." },
  "say-kitapcigi": { url: "/indir/say-el-kitabi-2026.pdf", page: "/say-kitapcigi", cover: "/indir/say-el-kitabi-kapak.png", icon: "say", dua: "Sa'yde bizleri de dualarınızdan eksik etmeyin." },
};

export const KVKK_TEXT = "Kişisel verilerimin KVKK Aydınlatma Metni kapsamında işlenmesine ilişkin bilgilendirmeyi okudum.";
export const MARKETING_TEXT = "Umre programları ve bilgilendirmeler için e-posta, SMS ve WhatsApp ile benimle iletişime geçilmesine izin veriyorum.";

const COLUMNS = `"id","name","email","phone","source","kvkkAccepted","marketingConsent","consentText","referrer","utm","emailVerified","verifiedAt","status","note","createdAt"`;
const id = () => `ml_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
const hashCode = (leadId: string, code: string) => createHash("sha256").update(`${leadId}:${code}`).digest("hex");

export const CODE_TTL_MS = 15 * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;
export const MAX_CODE_SENDS = 3;

type NewLead = { name: string; email: string | null; phone: string | null; source: string; marketingConsent: boolean; referrer: string | null; utm: string | null };

export async function createLead(input: NewLead): Promise<string> {
  await ensureLeadSchema();
  const leadId = id();
  const consentText = `${KVKK_TEXT}${input.marketingConsent ? ` | ${MARKETING_TEXT}` : ""}`;
  await prisma.$executeRaw`INSERT INTO "MarketingLead" ("id","name","email","phone","source","kvkkAccepted","marketingConsent","consentText","referrer","utm")
    VALUES (${leadId}, ${input.name}, ${input.email}, ${input.phone}, ${input.source}, true, ${input.marketingConsent}, ${consentText}, ${input.referrer}, ${input.utm})`;
  return leadId;
}

/** Aynı kaynakta aynı e-postayla bırakılmış en son kayıt (tekrar indirmede yeni satır açılmasın). */
export async function findLeadByEmail(email: string, source: string): Promise<(Lead & { codeSends: number }) | null> {
  await ensureLeadSchema();
  const rows = await prisma.$queryRawUnsafe<(Lead & { codeSends: number })[]>(
    `SELECT ${COLUMNS},"codeSends" FROM "MarketingLead" WHERE "email" = $1 AND "source" = $2 ORDER BY "createdAt" DESC LIMIT 1`,
    email,
    source,
  );
  return rows[0] ?? null;
}

export async function getLead(leadId: string): Promise<(Lead & { codeSends: number }) | null> {
  await ensureLeadSchema();
  const rows = await prisma.$queryRawUnsafe<(Lead & { codeSends: number })[]>(`SELECT ${COLUMNS},"codeSends" FROM "MarketingLead" WHERE "id" = $1`, leadId);
  return rows[0] ?? null;
}

/** Var olan doğrulanmamış kaydı yeni form bilgileriyle günceller (ad, telefon, izin). */
export async function refreshLead(leadId: string, input: NewLead) {
  await ensureLeadSchema();
  const consentText = `${KVKK_TEXT}${input.marketingConsent ? ` | ${MARKETING_TEXT}` : ""}`;
  await prisma.$executeRaw`UPDATE "MarketingLead" SET "name" = ${input.name}, "phone" = COALESCE(${input.phone}, "phone"),
    "marketingConsent" = ("marketingConsent" OR ${input.marketingConsent}), "consentText" = ${consentText}, "utm" = COALESCE("utm", ${input.utm}) WHERE "id" = ${leadId}`;
}

/** Yeni 6 haneli kod üretir, özetini kaydeder; kodun kendisini döndürür (e-postayla gönderilir). */
export async function issueCode(leadId: string): Promise<string> {
  await ensureLeadSchema();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expires = new Date(Date.now() + CODE_TTL_MS);
  await prisma.$executeRaw`UPDATE "MarketingLead" SET "codeHash" = ${hashCode(leadId, code)}, "codeExpires" = ${expires}, "codeAttempts" = 0, "codeSends" = "codeSends" + 1 WHERE "id" = ${leadId}`;
  return code;
}

export type VerifyResult = "ok" | "wrong" | "expired" | "locked" | "missing";

export async function verifyCode(leadId: string, code: string): Promise<VerifyResult> {
  await ensureLeadSchema();
  const rows = await prisma.$queryRaw<{ codeHash: string | null; codeExpires: Date | null; codeAttempts: number; emailVerified: boolean }[]>`
    SELECT "codeHash","codeExpires","codeAttempts","emailVerified" FROM "MarketingLead" WHERE "id" = ${leadId}`;
  const r = rows[0];
  if (!r) return "missing";
  if (r.emailVerified) return "ok";
  if (!r.codeHash || !r.codeExpires) return "missing";
  if (r.codeAttempts >= MAX_CODE_ATTEMPTS) return "locked";
  if (new Date(r.codeExpires).getTime() < Date.now()) return "expired";
  if (hashCode(leadId, code) !== r.codeHash) {
    await prisma.$executeRaw`UPDATE "MarketingLead" SET "codeAttempts" = "codeAttempts" + 1 WHERE "id" = ${leadId}`;
    return "wrong";
  }
  await prisma.$executeRaw`UPDATE "MarketingLead" SET "emailVerified" = true, "verifiedAt" = NOW(), "codeHash" = NULL, "codeExpires" = NULL WHERE "id" = ${leadId}`;
  return "ok";
}

export async function listLeads(source?: string): Promise<Lead[]> {
  await ensureLeadSchema();
  return source
    ? prisma.$queryRawUnsafe<Lead[]>(`SELECT ${COLUMNS} FROM "MarketingLead" WHERE "source" = $1 ORDER BY "createdAt" DESC LIMIT 5000`, source)
    : prisma.$queryRawUnsafe<Lead[]>(`SELECT ${COLUMNS} FROM "MarketingLead" ORDER BY "createdAt" DESC LIMIT 5000`);
}

export async function setLeadStatus(leadId: string, status: string, note?: string | null) {
  await ensureLeadSchema();
  await prisma.$executeRaw`UPDATE "MarketingLead" SET "status" = ${status}, "note" = COALESCE(${note ?? null}, "note") WHERE "id" = ${leadId}`;
}

/** Kaydı kalıcı olarak siler (test kayıtları, KVKK silme talepleri). */
export async function deleteLead(leadId: string) {
  await ensureLeadSchema();
  await prisma.$executeRaw`DELETE FROM "MarketingLead" WHERE "id" = ${leadId}`;
}

export async function leadCounts(): Promise<{ total: number; fresh: number }> {
  await ensureLeadSchema();
  const [row] = await prisma.$queryRaw<{ total: bigint; fresh: bigint }[]>`SELECT COUNT(*) AS "total", COUNT(*) FILTER (WHERE "status" = 'new') AS "fresh" FROM "MarketingLead"`;
  return { total: Number(row?.total ?? 0), fresh: Number(row?.fresh ?? 0) };
}
