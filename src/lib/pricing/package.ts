// Paket fiyatı (3 Ekim, kullanıcı): sabit fiyat yerine "… $'dan başlayan"; müşteri oteli seçer, fiyat kişi başı hesaplanır.
// Paket = otel (gece × oda) + kişi sayısına göre önerilen araçla transfer/tur rotaları; toplam × (1 + paket payı) ÷ kişi.
import type { CatalogItem } from "@/lib/catalog";
import { roomsNeeded, unitPrice } from "@/lib/pricing/plan";
import { parseTransferSlug, suggestedVehicles, vehicleByKey } from "@/lib/catalog/transfers";

export type PackagePreset = { nights: number; city: "mekke" | "medine"; routes: string[]; hotelSlug?: string };

/** Paket slug'ına göre hazır plan. Yeni paket şablonu buraya eklenir. */
export function packagePreset(slug: string): PackagePreset | null {
  if (!slug.startsWith("10-gunluk-bireysel-umre-mekke")) return null;
  const hotel: Record<string, string> = {
    "10-gunluk-bireysel-umre-mekke-mehd-al-resaleh": "mehd-al-resaleh-1-2",
    "10-gunluk-bireysel-umre-mekke-mehd-al-resaleh-3": "mehd-al-resaleh-3",
    "10-gunluk-bireysel-umre-mekke-holiday-inn": "holiday-inn-makkah-al-aziziah",
  };
  return { nights: 9, city: "mekke", routes: ["cidde-hav-mekke", "mekke-cidde-hav", "mekke-ziyaret"], hotelSlug: hotel[slug] };
}

export type PackageQuote = { perPersonUsd: number; totalUsd: number; rooms: number; vehicleLabel: string; vehicles: number } | null;

/** Kişi başı paket fiyatı (tam dolara yukarı yuvarlanır). Fiyatı eksik kalem varsa null. */
export function quotePackage(preset: PackagePreset, hotel: CatalogItem, catalog: CatalogItem[], people: number, month: string, packagePercent: number): PackageQuote {
  const p = Math.max(1, people);
  const nightly = unitPrice(hotel, month);
  if (nightly == null) return null;
  const rooms = roomsNeeded(p);
  const vehicleKey = suggestedVehicles(p)[0];
  const vehicle = vehicleByKey(vehicleKey);
  if (!vehicle) return null;
  const vehicles = Math.ceil(p / vehicle.capacity);
  let transport = 0;
  for (const route of preset.routes) {
    const item = catalog.find((c) => {
      const t = parseTransferSlug(c.slug);
      return t?.route.key === route && t.vehicle === vehicleKey;
    });
    const price = item ? unitPrice(item, month) : null;
    if (price == null) return null;
    transport += price * vehicles;
  }
  const base = nightly * preset.nights * rooms + transport;
  const total = base * (1 + packagePercent / 100);
  return { perPersonUsd: Math.ceil(total / p), totalUsd: Math.ceil(total), rooms, vehicleLabel: vehicle.label, vehicles };
}

/** Paket için seçilebilir oteller (aynı şehir, fiyatı olan) ve en düşük kişi başı fiyat (2 kişi) */
export function packageHotels(preset: PackagePreset, catalog: CatalogItem[], month: string, packagePercent: number, people = 2) {
  return catalog
    .filter((c) => c.category === "hotel" && c.city?.toLowerCase() === preset.city)
    .map((h) => ({ hotel: h, quote: quotePackage(preset, h, catalog, people, month, packagePercent) }))
    .filter((x) => x.quote)
    .sort((a, b) => a.quote!.perPersonUsd - b.quote!.perPersonUsd);
}
