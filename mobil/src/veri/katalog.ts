// Hizmet kütüphanesi (katalog) tipleri ve etiketleri; web: src/lib/catalog
export type KutuphaneKalem = {
  id: string; category: string; name: string; description: string | null; defaultPricingType: string; defaultCostUsd: number | string;
  defaultVehicleType: string | null; defaultChildPercent: number; defaultExtraBedPrice: number; isActive: boolean; sortOrder: number;
  isPublic: boolean; slug: string | null; city: string | null; imageUrl: string | null; publicDescription: string | null; hotelStars: number | string | null; distanceMeters: number | string | null;
};
export type AyFiyat = { serviceId: string; month: string; variant: string; salePriceUsd: number };
export const KATEGORI = [
  { deger: "hotel", etiket: "Otel" }, { deger: "transfer", etiket: "Transfer" }, { deger: "vize", etiket: "Vize" },
  { deger: "tur", etiket: "Tur" }, { deger: "flight", etiket: "Uçuş" }, { deger: "extra", etiket: "Ekstra" },
];
export const KAT_IKON: Record<string, string> = { hotel: "otel", transfer: "transfer", vize: "vize", tur: "kabe", extra: "paket", flight: "ucak" };
export const FIYAT_TIPI = [{ deger: "per_person", etiket: "Kişi başı" }, { deger: "per_vehicle", etiket: "Araç başı" }, { deger: "per_room", etiket: "Oda / gece" }, { deger: "flat", etiket: "Sabit" }];
export const SEHIR = [{ deger: "", etiket: "—" }, { deger: "mekke", etiket: "Mekke" }, { deger: "medine", etiket: "Medine" }, { deger: "cidde", etiket: "Cidde" }, { deger: "tr", etiket: "Türkiye" }];
/** Otelde kişi bazlı oda fiyatı varyantları (plan.ts DOLULUK_VARYANT); "" tek fiyat */
export const OTEL_VARYANT = [{ deger: "k2", etiket: "2 kişilik oda" }, { deger: "k3", etiket: "3 kişilik oda" }, { deger: "k4", etiket: "4 kişilik oda" }];
const AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
export const ayAdi = (m: string) => `${AY[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
export const ayKisa = (m: string) => `${AY[Number(m.slice(5, 7)) - 1].slice(0, 3)} ${m.slice(2, 4)}`;
