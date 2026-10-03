// InfluencerProspect tablosu (yalnızca ekleme; idempotent). Kullanıcı onayı: 3 Ekim 2026.
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;

async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "InfluencerProspect" (
      "id" TEXT PRIMARY KEY,
      "platform" TEXT NOT NULL,
      "handle" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "name" TEXT,
      "bio" TEXT,
      "followers" INTEGER,
      "mediaCount" INTEGER,
      "avgViews" INTEGER,
      "avgLikes" INTEGER,
      "avgComments" INTEGER,
      "engagementRate" DOUBLE PRECISION,
      "lastPostAt" TIMESTAMP(3),
      "postsLast30" INTEGER,
      "audienceTR" DOUBLE PRECISION,
      "fitScore" INTEGER,
      "fitReasons" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "religiousAudience" BOOLEAN,
      "stage" TEXT NOT NULL DEFAULT 'bulundu',
      "source" TEXT NOT NULL DEFAULT 'manuel',
      "note" TEXT,
      "metricsAt" TIMESTAMP(3),
      "metricsError" TEXT,
      "invitedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "InfluencerProspect_platform_handle_key" ON "InfluencerProspect"("platform", "handle")`,
    `CREATE INDEX IF NOT EXISTS "InfluencerProspect_stage_idx" ON "InfluencerProspect"("stage")`,
  ];
  for (const sql of statements) await prisma.$executeRawUnsafe(sql);
}

/** InfluencerProspect'e dokunan her yerden önce çağrılır */
export function ensureProspectSchema() {
  ready ??= migrate().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}
