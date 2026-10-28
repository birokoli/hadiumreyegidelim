// Paylaşım (Share) ekleri (27 Ekim): hangi kampanya için paylaşıldığı ve admin'in geri bildirimi.
// Prisma modeli değişmez; sütunlar yalnızca eklenir (ADD COLUMN IF NOT EXISTS) ve parametreli SQL ile okunur/yazılır.
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;
export function ensurePaylasimSchema() {
  ready ??= (async () => {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Share" ADD COLUMN IF NOT EXISTS "campaignId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Share" ADD COLUMN IF NOT EXISTS "adminNote" TEXT`);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export type PaylasimEk = { campaignId: string | null; adminNote: string | null };

export async function paylasimEkleri(ids: string[]): Promise<Record<string, PaylasimEk>> {
  if (!ids.length) return {};
  await ensurePaylasimSchema();
  const rows = await prisma.$queryRaw<{ id: string; campaignId: string | null; adminNote: string | null }[]>`
    SELECT "id", "campaignId", "adminNote" FROM "Share" WHERE "id" = ANY(${ids})`;
  return Object.fromEntries(rows.map((r) => [r.id, { campaignId: r.campaignId, adminNote: r.adminNote }]));
}

export async function paylasimKampanyaYaz(id: string, campaignId: string | null) {
  await ensurePaylasimSchema();
  await prisma.$executeRaw`UPDATE "Share" SET "campaignId" = ${campaignId} WHERE "id" = ${id}`;
}

export async function paylasimNotYaz(id: string, note: string | null) {
  await ensurePaylasimSchema();
  await prisma.$executeRaw`UPDATE "Share" SET "adminNote" = ${note} WHERE "id" = ${id}`;
}
