// Katalog tabloları için veritabanı güncellemesi (yalnızca ekleme; idempotent).
// Proje `prisma db push` kullanmıyor; tablolar ilk kullanımda bu fonksiyonla oluşturulur
// (WhatsApp AI tablolarıyla aynı yöntem). Kullanıcı onayı: 2 Ekim 2026.
import { prisma } from "@/lib/prisma";

let ready: Promise<void> | null = null;

async function migrate() {
  const statements = [
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "slug" TEXT`,
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "city" TEXT`,
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`,
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "publicDescription" TEXT`,
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "hotelStars" INTEGER`,
    `ALTER TABLE "ServiceLibrary" ADD COLUMN IF NOT EXISTS "distanceMeters" INTEGER`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "ServiceLibrary_slug_key" ON "ServiceLibrary"("slug")`,
    `CREATE TABLE IF NOT EXISTS "ServicePrice" (
      "id" TEXT PRIMARY KEY,
      "serviceId" TEXT NOT NULL REFERENCES "ServiceLibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "month" TEXT NOT NULL,
      "variant" TEXT NOT NULL DEFAULT '',
      "salePriceUsd" DOUBLE PRECISION NOT NULL,
      "note" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "ServicePrice_serviceId_month_variant_key" ON "ServicePrice"("serviceId", "month", "variant")`,
    `CREATE INDEX IF NOT EXISTS "ServicePrice_month_idx" ON "ServicePrice"("month")`,
  ];
  for (const sql of statements) await prisma.$executeRawUnsafe(sql);
}

/** ServiceLibrary / ServicePrice'a dokunan her yerden önce çağrılır */
export function ensureCatalogSchema() {
  ready ??= migrate().catch((e) => {
    ready = null; // bir sonraki istekte yeniden dene
    throw e;
  });
  return ready;
}
