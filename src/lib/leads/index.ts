// Müşteri havuzu (12 Ekim, kullanıcı): ücretsiz materyal (ör. Tavaf El Kitabı) karşılığında bırakılan iletişim bilgileri.
// Gelen Kutusu'ndan (ContactRequest: gerçek talepler) ayrı tutulur. Tablo yalnızca eklenir (CREATE TABLE / ADD COLUMN IF NOT
// EXISTS), Prisma modeli yok; sorgular parametreli SQL ile. KVKK: aydınlatma onayı zorunlu, ticari ileti izni ayrı ve isteğe bağlı.
// 13 Ekim: e-posta doğrulama (6 haneli kod, 15 dk) ve reklam kaynağı (utm) eklendi.
// 14 Ekim: e-posta teslim durumu (Resend olayları: teslim edildi / geri döndü / şikâyet) ve tekrar eden kayıt grupları.
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
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "lastEmailId" TEXT`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "emailStatus" TEXT`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "emailStatusAt" TIMESTAMP(3)`,
    `ALTER TABLE "MarketingLead" ADD COLUMN IF NOT EXISTS "emailStatusNote" TEXT`,
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
  /** Resend'in son bildirdiği teslim durumu: delivered | bounced | complained | delayed | null (henüz olay yok). */
  emailStatus: EmailStatus | null;
  emailStatusAt: Date | null;
  emailStatusNote: string | null;
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

export type EmailStatus = "delivered" | "bounced" | "complained" | "delayed";

const COLUMNS = `"id","name","email","phone","source","kvkkAccepted","marketingConsent","consentText","referrer","utm","emailVerified","verifiedAt","emailStatus","emailStatusAt","emailStatusNote","status","note","createdAt"`;
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

/** Aynı kişi: e-posta (küçük harf) ya da telefonun son 10 hanesi ortak olan kayıtlar tek grupta toplanır. */
export type LeadWithDup = Lead & { dupCount: number; dupFirstId: string; dupIndex: number };

const phoneKey = (p: string | null) => {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : null;
};

export function groupDuplicates(leads: Lead[]): LeadWithDup[] {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    parent.set(x, r);
    return r;
  };
  const owner = new Map<string, string>();
  for (const l of leads) parent.set(l.id, l.id);
  for (const l of leads) {
    for (const k of [l.email ? `e:${l.email.toLowerCase()}` : null, phoneKey(l.phone) ? `p:${phoneKey(l.phone)}` : null]) {
      if (!k) continue;
      const o = owner.get(k);
      if (o) parent.set(find(l.id), find(o));
      else owner.set(k, l.id);
    }
  }
  const groups = new Map<string, Lead[]>();
  for (const l of leads) {
    const g = find(l.id);
    groups.set(g, [...(groups.get(g) ?? []), l]);
  }
  const meta = new Map<string, { count: number; first: string; index: number }>();
  for (const g of groups.values()) {
    const sorted = [...g].sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
    sorted.forEach((l, i) => meta.set(l.id, { count: g.length, first: sorted[0].id, index: i + 1 }));
  }
  return leads.map((l) => {
    const m = meta.get(l.id)!;
    return { ...l, dupCount: m.count, dupFirstId: m.first, dupIndex: m.index };
  });
}

export async function listLeads(source?: string): Promise<LeadWithDup[]> {
  await ensureLeadSchema();
  const leads = source
    ? await prisma.$queryRawUnsafe<Lead[]>(`SELECT ${COLUMNS} FROM "MarketingLead" WHERE "source" = $1 ORDER BY "createdAt" DESC LIMIT 5000`, source)
    : await prisma.$queryRawUnsafe<Lead[]>(`SELECT ${COLUMNS} FROM "MarketingLead" ORDER BY "createdAt" DESC LIMIT 5000`);
  return groupDuplicates(leads);
}

/** Resend'in döndürdüğü e-posta kimliği; gelen olayı kayda bağlamak için. */
export async function recordEmailSent(leadId: string, emailId: string | null) {
  if (!emailId) return;
  await ensureLeadSchema();
  await prisma.$executeRaw`UPDATE "MarketingLead" SET "lastEmailId" = ${emailId} WHERE "id" = ${leadId}`;
}

/**
 * Resend olayını işler: aynı adresi taşıyan bütün kayıtlar güncellenir (adres geri döndüyse hepsinde geçersizdir).
 * "delayed" geçici bir durumdur; kesinleşmiş bir sonucun (teslim, geri dönüş, şikâyet) üzerine yazılmaz.
 */
export async function markEmailEvent(address: string, status: EmailStatus, note: string | null): Promise<number> {
  await ensureLeadSchema();
  const addr = address.trim().toLowerCase();
  if (!addr) return 0;
  if (status === "delayed") {
    return prisma.$executeRaw`UPDATE "MarketingLead" SET "emailStatus" = 'delayed', "emailStatusAt" = NOW(), "emailStatusNote" = ${note}
      WHERE LOWER("email") = ${addr} AND ("emailStatus" IS NULL OR "emailStatus" = 'delayed')`;
  }
  return prisma.$executeRaw`UPDATE "MarketingLead" SET "emailStatus" = ${status}, "emailStatusAt" = NOW(), "emailStatusNote" = ${note}
    WHERE LOWER("email") = ${addr}`;
}

/** Bu adrese daha önce gönderilen e-posta kalıcı olarak geri döndü mü (form yeni kod göndermeden önce bakar). */
export async function isEmailBounced(address: string): Promise<boolean> {
  await ensureLeadSchema();
  const rows = await prisma.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*) AS "n" FROM "MarketingLead" WHERE LOWER("email") = ${address.trim().toLowerCase()} AND "emailStatus" = 'bounced'`;
  return Number(rows[0]?.n ?? 0) > 0;
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
