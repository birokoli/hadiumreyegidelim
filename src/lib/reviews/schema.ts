// Review tablosu (yalnızca ekleme; idempotent). Kullanıcı onayı: 4 Ekim 2026.
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;

async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "Review" (
      "id" TEXT PRIMARY KEY,
      "token" TEXT,
      "customerName" TEXT NOT NULL,
      "displayName" TEXT,
      "city" TEXT,
      "umreMonth" TEXT,
      "rating" INTEGER,
      "text" TEXT,
      "photoUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'invited',
      "source" TEXT NOT NULL DEFAULT 'link',
      "reply" TEXT,
      "consent" BOOLEAN NOT NULL DEFAULT false,
      "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "submittedAt" TIMESTAMP(3),
      "approvedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Review_token_key" ON "Review"("token")`,
    `CREATE INDEX IF NOT EXISTS "Review_status_idx" ON "Review"("status")`,
  ];
  for (const sql of statements) await prisma.$executeRawUnsafe(sql);
}

export function ensureReviewSchema() {
  ready ??= migrate().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}
