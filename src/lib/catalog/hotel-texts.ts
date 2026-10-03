// Otel sayfası uzun açıklamaları (3 Ekim): admin → Hizmet Kütüphanesi → otel → "Otel sayfası açıklaması".
// Setting'te { [otelId]: metin } olarak tutulur (şema değişikliği yok). Kayıt yoksa G13 kaynaklı ilk metin kullanılır.
import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CatalogItem } from "@/lib/catalog";
import SEED from "@/lib/content-fixes/otel-aciklamalari.json";

const KEY = "HOTEL_LONG_DESCRIPTIONS";
const TAG = "hotel-texts";

const read = unstable_cache(
  async () => {
    const row = await prisma.setting.findUnique({ where: { key: KEY } }).catch(() => null);
    try {
      return row ? (JSON.parse(row.value) as Record<string, string>) : {};
    } catch {
      return {};
    }
  },
  ["hotel-texts-v1"],
  { tags: [TAG], revalidate: 3600 },
);

// İlk metinler: anahtar slug ya da (eski yerel) kayıt kimliği; bulunamazsa adla eşleşir
const SEED_MAP = SEED as Record<string, { name: string; description: string }>;
const norm = (x: string) => x.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && w !== "hotel" && w !== "the");
export function seedText(h: Pick<CatalogItem, "id" | "slug" | "name">): string | null {
  const direct = SEED_MAP[h.slug ?? ""] ?? SEED_MAP[h.id];
  if (direct) return direct.description;
  const want = norm(h.name);
  const hit = Object.values(SEED_MAP).find((v) => {
    const have = new Set(norm(`${v.name} ${v.description.split(",")[0]}`));
    return want.length > 0 && want.every((w) => have.has(w));
  });
  return hit?.description ?? null;
}

/** Otel sayfasında gösterilecek uzun açıklama: admin kaydı (boş bırakıldıysa gösterilmez), yoksa ilk metin */
export async function hotelLongText(h: Pick<CatalogItem, "id" | "slug" | "name">): Promise<string | null> {
  const saved = await read().catch(() => ({}) as Record<string, string>);
  if (h.id in saved) return saved[h.id].trim() || null;
  return seedText(h);
}

export async function getHotelLongTextForAdmin(h: { id: string; slug: string | null; name: string }) {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const saved = row ? (JSON.parse(row.value) as Record<string, string>) : {};
  return h.id in saved ? saved[h.id] : seedText(h) ?? "";
}

export async function setHotelLongText(id: string, text: string) {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const saved = row ? (JSON.parse(row.value) as Record<string, string>) : {};
  saved[id] = text.trim();
  const value = JSON.stringify(saved);
  await prisma.setting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
  revalidateTag(TAG, { expire: 0 });
}
