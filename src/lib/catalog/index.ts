// Sitede gösterilen kendi fiyat kataloğumuz (Y1). Kaynak: admin → Hizmet Kütüphanesi + aylık satış fiyatları.
// Kurallar: yalnızca isPublic + isActive kalemler; maliyet (defaultCostUsd) hiçbir zaman seçilmez.
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureCatalogSchema } from "./schema";

export const CATALOG_TAG = "catalog";

export type CatalogCategory = "vize" | "hotel" | "transfer" | "tur" | "flight" | "extra";
export type PricingType = "per_person" | "per_vehicle" | "per_room" | "flat";

export type CatalogPrice = { month: string; variant: string; priceUsd: number };
export type CatalogItem = {
  id: string;
  slug: string | null;
  category: CatalogCategory;
  name: string;
  description: string | null;
  city: string | null;
  imageUrl: string | null;
  hotelStars: number | null;
  distanceMeters: number | null;
  pricingType: PricingType;
  vehicleType: string | null;
  prices: CatalogPrice[];
};

/** "2026-10" (Türkiye saatiyle bu ay) */
export function currentMonth(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).slice(0, 7);
}

/** Bu aydan başlayarak n ay: ["2026-10", "2026-11", …] */
export function monthsFrom(start = currentMonth(), n = 12) {
  const [y, m] = start.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 + i, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

const MONTH_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
/** "2026-11" → "Kasım 2026" */
export const monthLabel = (ym: string) => `${MONTH_TR[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

async function queryCatalog(): Promise<CatalogItem[]> {
  await ensureCatalogSchema();
  const months = monthsFrom(currentMonth(), 13);
  const rows = await prisma.serviceLibrary.findMany({
    where: { isPublic: true, isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true, slug: true, category: true, name: true, publicDescription: true, city: true, imageUrl: true,
      hotelStars: true, distanceMeters: true, defaultPricingType: true, defaultVehicleType: true,
      prices: { where: { month: { in: months } }, select: { month: true, variant: true, salePriceUsd: true }, orderBy: [{ month: "asc" }, { variant: "asc" }] },
    },
  });
  // Nusuk randevusu sitede satılmaz (kullanıcı kararı, 2 Ekim): yanlışlıkla "Sitede göster" işaretlense de gösterilmez
  return rows.filter((r) => !/nusuk/i.test(r.name)).map((r) => ({
    id: r.id,
    slug: r.slug,
    category: r.category as CatalogCategory,
    name: r.name,
    description: r.publicDescription,
    city: r.city,
    imageUrl: r.imageUrl,
    hotelStars: r.hotelStars,
    distanceMeters: r.distanceMeters,
    pricingType: r.defaultPricingType as PricingType,
    vehicleType: r.defaultVehicleType,
    prices: r.prices.map((p) => ({ month: p.month, variant: p.variant, priceUsd: p.salePriceUsd })),
  }));
}

const readCatalog = unstable_cache(queryCatalog, ["catalog-v1"], { tags: [CATALOG_TAG], revalidate: 3600 });

/** Herkese açık katalog; veritabanı hatasında boş liste (sayfa yine açılır) */
export async function getCatalog(): Promise<CatalogItem[]> {
  try {
    return await readCatalog();
  } catch (e) {
    console.error("[catalog] okunamadı", e);
    return [];
  }
}

/** Bir kalemin o ayki en düşük fiyatı (oda tipleri arasında); fiyat yoksa null */
export function priceFor(item: CatalogItem, month: string, variant?: string): number | null {
  const list = item.prices.filter((p) => p.month === month && (variant === undefined || p.variant === variant));
  return list.length ? Math.min(...list.map((p) => p.priceUsd)) : null;
}

/** Bu aydan itibaren fiyatı olan ilk ay ve en düşük fiyat ("… USD'den") */
export function fromPrice(item: CatalogItem): { month: string; priceUsd: number } | null {
  for (const m of monthsFrom(currentMonth(), 13)) {
    const p = priceFor(item, m);
    if (p != null) return { month: m, priceUsd: p };
  }
  return null;
}

/** Admin'de fiyat ya da kalem değişince sitedeki katalog beklemeden tazelenir */
export function revalidateCatalog() {
  try {
    revalidateTag(CATALOG_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  } catch {
    /* tazeleme kaydı engellemez */
  }
}

// ─── Ödeme seçenekleri ve kur (admin → Aylık Satış Fiyatları → Ödeme ve kur) ───

export type PaymentSettings = { usdTry: number | null; rateDate: string | null; ibanPercent: number; cardPercent: number };

export const PAYMENT_KEYS = { usdTry: "PRICING_USD_TRY", rateDate: "PRICING_RATE_DATE", ibanPercent: "PRICING_IBAN_PERCENT", cardPercent: "PRICING_CARD_PERCENT" } as const;

/** Site ayarlarından ödeme farkları ve dolar kuru. Varsayılan: IBAN +%20, kart +%26 (fiyat motoruyla aynı). */
export function paymentSettingsFrom(settings: Record<string, string | undefined>): PaymentSettings {
  const num = (v: string | undefined, d: number | null) => (v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    usdTry: num(settings[PAYMENT_KEYS.usdTry], null),
    rateDate: settings[PAYMENT_KEYS.rateDate] || null,
    ibanPercent: num(settings[PAYMENT_KEYS.ibanPercent], 20) ?? 20,
    cardPercent: num(settings[PAYMENT_KEYS.cardPercent], 26) ?? 26,
  };
}
