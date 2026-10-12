// Müşteri havuzu (12 Ekim, kullanıcı): ücretsiz materyal (ör. Tavaf El Kitabı) karşılığında bırakılan iletişim bilgileri.
// Gelen Kutusu'ndan (ContactRequest: gerçek talepler) ayrı tutulur. Tablo yalnızca eklenir (CREATE TABLE IF NOT EXISTS),
// Prisma modeli yok; sorgular parametreli SQL ile. KVKK: aydınlatma onayı zorunlu, ticari ileti izni ayrı ve isteğe bağlı.
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
  status: string;
  note: string | null;
  createdAt: Date;
};

export const LEAD_SOURCES: Record<string, string> = { "tavaf-kitapcigi": "Tavaf El Kitabı" };

export const KVKK_TEXT = "Kişisel verilerimin KVKK Aydınlatma Metni kapsamında işlenmesine ilişkin bilgilendirmeyi okudum.";
export const MARKETING_TEXT = "Umre programları ve bilgilendirmeler için e-posta, SMS ve WhatsApp ile benimle iletişime geçilmesine izin veriyorum.";

const id = () => `ml_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export async function createLead(input: { name: string; email: string | null; phone: string | null; source: string; marketingConsent: boolean; referrer: string | null }) {
  await ensureLeadSchema();
  const consentText = `${KVKK_TEXT}${input.marketingConsent ? ` | ${MARKETING_TEXT}` : ""}`;
  await prisma.$executeRaw`INSERT INTO "MarketingLead" ("id","name","email","phone","source","kvkkAccepted","marketingConsent","consentText","referrer")
    VALUES (${id()}, ${input.name}, ${input.email}, ${input.phone}, ${input.source}, true, ${input.marketingConsent}, ${consentText}, ${input.referrer})`;
}

export async function listLeads(source?: string): Promise<Lead[]> {
  await ensureLeadSchema();
  return source
    ? prisma.$queryRaw<Lead[]>`SELECT * FROM "MarketingLead" WHERE "source" = ${source} ORDER BY "createdAt" DESC LIMIT 5000`
    : prisma.$queryRaw<Lead[]>`SELECT * FROM "MarketingLead" ORDER BY "createdAt" DESC LIMIT 5000`;
}

export async function setLeadStatus(leadId: string, status: string, note?: string | null) {
  await ensureLeadSchema();
  await prisma.$executeRaw`UPDATE "MarketingLead" SET "status" = ${status}, "note" = COALESCE(${note ?? null}, "note") WHERE "id" = ${leadId}`;
}
