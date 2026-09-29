import { prisma } from "@/lib/prisma";

// SEO Merkezi verisi Setting tablosunda JSON olarak tutulur (SEO_* anahtarları).
// Böylece canlı veritabanında şema değişikliği gerekmez. Veri büyürse
// ayrı Prisma modellerine taşımak için tek değişecek yer burası.

export const SEO_KEYS = {
  audit: "SEO_AUDIT_LATEST",
  auditHistory: "SEO_AUDIT_HISTORY",
  auditFixed: "SEO_AUDIT_FIXED",
  tracked: "SEO_TRACKED_KEYWORDS",
  competitors: "SEO_COMPETITORS",
} as const;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } }).catch(() => null);
  if (!row?.value) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown) {
  const json = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: json },
    update: { value: json },
  });
}
