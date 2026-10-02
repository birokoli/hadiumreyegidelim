// Transfer: araç × rota fiyat listesi (transfer firması, 2 Ekim 2026). Fiyatlar doğrudan SATIŞ fiyatıdır (USD, araç başı).
// Admin → Hizmet Kütüphanesi → "Transfer listesini yükle" bu tablodan katalog kalemleri üretir
// (slug: tr-<rota>-<araç>). Fiyat değişince bu dosya güncellenip düğmeye yeniden basılır.

export type VehicleKey = "camry" | "gmc" | "staria" | "hiace" | "coaster" | "bus";

export const TRANSFER_VEHICLES: { key: VehicleKey; label: string; capacity: number; note: string }[] = [
  { key: "camry", label: "Toyota Camry", capacity: 4, note: "Sedan · 4 yolcu" },
  { key: "gmc", label: "GMC Yukon", capacity: 8, note: "Geniş SUV · 8 yolcuya kadar" },
  { key: "staria", label: "Hyundai Staria", capacity: 8, note: "Minivan · 8 yolcuya kadar" },
  { key: "hiace", label: "Toyota HiAce", capacity: 12, note: "Minibüs · 12 yolcuya kadar" },
  { key: "coaster", label: "Toyota Coaster", capacity: 25, note: "Midibüs · 25 yolcuya kadar" },
  { key: "bus", label: "Otobüs", capacity: 45, note: "45 yolcuya kadar" },
];

export const vehicleByKey = (k: string | null | undefined) => TRANSFER_VEHICLES.find((v) => v.key === k);

/** Müşteriyi araç seçeneğine boğmamak için kişi sayısına göre en fazla iki öneri (kullanıcı kuralı, 2 Ekim) */
export function suggestedVehicles(people: number): VehicleKey[] {
  if (people <= 4) return ["camry", "gmc"];
  if (people <= 8) return ["gmc", "staria"];
  if (people <= 12) return ["hiace"];
  if (people <= 25) return ["coaster"];
  return ["bus"];
}

/** kind: "transfer" ulaşım adımında, "tur" şehir turu adımında gösterilir */
export type TransferRoute = { key: string; label: string; kind: "transfer" | "tur"; note?: string; prices: Partial<Record<VehicleKey, number>> };

export const TRANSFER_ROUTES: TransferRoute[] = [
  { key: "cidde-hav-mekke", label: "Cidde Havalimanı → Mekke oteli", kind: "transfer", prices: { camry: 73.6, staria: 85.87, hiace: 107.33, coaster: 153.33, bus: 245.33, gmc: 113.47 } },
  { key: "cidde-hav-medine", label: "Cidde Havalimanı → Medine oteli", kind: "transfer", prices: { camry: 116.53, staria: 153.33, hiace: 184, coaster: 306.67, bus: 368, gmc: 291.33 } },
  { key: "mekke-cidde-hav", label: "Mekke oteli → Cidde Havalimanı", kind: "transfer", prices: { camry: 55.2, staria: 70.53, hiace: 92, coaster: 147.2, bus: 230, gmc: 107.33 } },
  { key: "mekke-medine", label: "Mekke ↔ Medine (ya da Medine → Cidde)", kind: "transfer", note: "Tek yön", prices: { camry: 116.53, staria: 147.2, hiace: 177.87, coaster: 300.53, bus: 352.67, gmc: 291.33 } },
  { key: "mekke-medine-bedir", label: "Mekke ↔ Medine, Bedir üzerinden", kind: "transfer", note: "Tek yön, Bedir ziyaretiyle", prices: { camry: 138, staria: 174.8, hiace: 205.47, coaster: 352.67, bus: 414, gmc: 352.67 } },
  { key: "tren-istasyonu-otel", label: "Haremeyn tren istasyonu ↔ otel", kind: "transfer", note: "Tek yön; istasyon → Medine Havalimanı dahil", prices: { camry: 30.67, staria: 39.87, hiace: 55.2, coaster: 92, bus: 107.33, gmc: 107.33 } },
  { key: "medine-hav-otel", label: "Medine Havalimanı → Medine oteli / tren istasyonu", kind: "transfer", prices: { camry: 46, staria: 55.2, hiace: 85.87, coaster: 138, bus: 168.67, gmc: 107.33 } },
  { key: "medine-otel-hav", label: "Medine oteli → Medine Havalimanı", kind: "transfer", prices: { camry: 36.8, staria: 39.87, hiace: 61.33, coaster: 122.67, bus: 153.33, gmc: 92 } },
  { key: "riyad-mekke-medine", label: "Riyad → Mekke / Medine", kind: "transfer", prices: { camry: 291.33, staria: 368, hiace: 429.33, coaster: 1226.67, bus: 1686.67 } },
  { key: "mekke-ziyaret", label: "Mekke şehir turu (ziyaret yerleri)", kind: "tur", prices: { camry: 55.2, staria: 82.8, hiace: 92, coaster: 131.87, bus: 153.33, gmc: 153.33 } },
  { key: "medine-ziyaret", label: "Medine şehir turu (ziyaret yerleri)", kind: "tur", prices: { camry: 55.2, staria: 82.8, hiace: 92, coaster: 131.87, bus: 153.33, gmc: 153.33 } },
  { key: "taif-5", label: "Taif turu (5 saat)", kind: "tur", prices: { camry: 107.33, staria: 138, hiace: 168.67, coaster: 276, bus: 337.33, gmc: 306.67 } },
  { key: "taif-8", label: "Taif turu (8 saat)", kind: "tur", prices: { camry: 153.33, staria: 184, hiace: 230, coaster: 337.33, bus: 398.67, gmc: 368 } },
  { key: "tenim-umre", label: "Ten'im (Mescid-i Âişe) umresi için araç", kind: "tur", prices: { camry: 39.87, staria: 49.07, hiace: 61.33, coaster: 92, bus: 122.67, gmc: 122.67 } },
  { key: "hudeybiye-umre", label: "Hudeybiye umresi için araç", kind: "tur", prices: { camry: 46, staria: 55.2, hiace: 70.53, coaster: 107.33, bus: 138, gmc: 138 } },
  { key: "cirane-umre", label: "Ci'rane umresi için araç", kind: "tur", prices: { camry: 46, staria: 55.2, hiace: 70.53, coaster: 107.33, bus: 138, gmc: 138 } },
];

export const TRANSFER_SLUG_PREFIX = "tr-";
export const transferSlug = (route: string, vehicle: VehicleKey) => `${TRANSFER_SLUG_PREFIX}${route}--${vehicle}`;

/** "tr-cidde-hav-mekke--camry" → { route, vehicle } (rota tablosunda yoksa null) */
export function parseTransferSlug(slug: string | null | undefined): { route: TransferRoute; vehicle: VehicleKey } | null {
  if (!slug?.startsWith(TRANSFER_SLUG_PREFIX)) return null;
  const [r, v] = slug.slice(TRANSFER_SLUG_PREFIX.length).split("--");
  const route = TRANSFER_ROUTES.find((x) => x.key === r);
  const vehicle = vehicleByKey(v);
  return route && vehicle ? { route, vehicle: vehicle.key } : null;
}

/** Araç görselleri admin'den yüklenir (Setting), sitede araç kartında gösterilir */
export const VEHICLE_IMAGES_SETTING_KEY = "TRANSFER_VEHICLE_IMAGES";
export function parseVehicleImages(value?: string | null): Partial<Record<VehicleKey, string>> {
  try {
    return value ? (JSON.parse(value) as Partial<Record<VehicleKey, string>>) : {};
  } catch {
    return {};
  }
}
