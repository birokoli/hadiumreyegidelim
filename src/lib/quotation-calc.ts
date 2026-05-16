// ─── Araç kapasiteleri ────────────────────────────────────────
export const VEHICLE_TYPES = [
  { value: 'sedan',   label: 'Sedan',   capacity: 4  },
  { value: 'minivan', label: 'Minivan', capacity: 8  },
  { value: 'gmc',     label: 'GMC',     capacity: 6  },
  { value: 'midibus', label: 'Midibüs', capacity: 16 },
  { value: 'bus',     label: 'Otobüs',  capacity: 45 },
] as const;

export type VehicleTypeValue = typeof VEHICLE_TYPES[number]['value'];

export function vehicleCapacity(type: string): number {
  return VEHICLE_TYPES.find(v => v.value === type)?.capacity ?? 4;
}

// ─── Fiyatlandırma tipleri ────────────────────────────────────
export type PricingType = 'per_person' | 'per_vehicle' | 'per_room' | 'flat';

export interface QuotationItemCalc {
  pricingType:       PricingType;
  unitCostUsd:       number;   // birim alış fiyatı
  quantity:          number;   // araç adedi / oda sayısı / adet
  childPricePercent: number;   // 0–100, sadece per_person
  vehicleType:       string;   // sadece per_vehicle
  extraBedCount:     number;   // sadece per_room
  extraBedPriceUsd:  number;   // sadece per_room
}

export interface TripContext {
  adultsCount:   number;
  childrenCount: number;
  margin:        number;  // yüzde, örn 18
}

/**
 * Ham alış maliyeti hesapla (margin dahil değil).
 */
export function calcRawCost(item: QuotationItemCalc, ctx: TripContext): number {
  const { adultsCount, childrenCount } = ctx;

  switch (item.pricingType) {
    case 'per_person': {
      const effectivePax = adultsCount + childrenCount * (item.childPricePercent / 100);
      return round2(item.unitCostUsd * effectivePax);
    }
    case 'per_vehicle': {
      return round2(item.unitCostUsd * item.quantity);
    }
    case 'per_room': {
      return round2(
        item.unitCostUsd * item.quantity +
        item.extraBedPriceUsd * item.extraBedCount,
      );
    }
    case 'flat': {
      return round2(item.unitCostUsd * item.quantity);
    }
    default:
      return 0;
  }
}

/**
 * Satış fiyatı = rawCost × (1 + margin/100)
 */
export function calcSaleTotal(item: QuotationItemCalc, ctx: TripContext): number {
  const raw = calcRawCost(item, ctx);
  return round2(raw * (1 + ctx.margin / 100));
}

/**
 * PDF'te gösterilecek detay metni (kar payı yok, sadece müşteriye).
 */
export function formatItemDetail(item: QuotationItemCalc, ctx: TripContext): string {
  const { adultsCount, childrenCount } = ctx;
  switch (item.pricingType) {
    case 'per_person': {
      const childLabel = item.childPricePercent > 0
        ? `${childrenCount} çocuk × %${item.childPricePercent}`
        : `${childrenCount} çocuk`;
      return childrenCount > 0
        ? `${adultsCount} yetişkin + ${childLabel}`
        : `${adultsCount} yetişkin`;
    }
    case 'per_vehicle': {
      const vt = VEHICLE_TYPES.find(v => v.value === item.vehicleType);
      return vt
        ? `${item.quantity} × ${vt.label} (${vt.capacity} kişilik)`
        : `${item.quantity} araç`;
    }
    case 'per_room': {
      const parts = [`${item.quantity} oda`];
      if (item.extraBedCount > 0) parts.push(`${item.extraBedCount} ek yatak`);
      return parts.join(' + ');
    }
    case 'flat':
      return item.quantity > 1 ? `${item.quantity} adet` : '';
    default:
      return '';
  }
}

/**
 * Araç kapasite uyarısı. Sorun yoksa null döner.
 */
export function vehicleCapacityWarning(
  item: QuotationItemCalc,
  ctx: TripContext,
): string | null {
  if (item.pricingType !== 'per_vehicle') return null;
  const total = ctx.adultsCount + ctx.childrenCount;
  const cap = vehicleCapacity(item.vehicleType) * item.quantity;
  if (total <= cap) return null;

  const vt = VEHICLE_TYPES.find(v => v.value === item.vehicleType);
  const suggestions = VEHICLE_TYPES
    .filter(v => v.capacity * item.quantity >= total)
    .map(v => v.label);

  return `${total} kişi için ${vt?.label ?? 'araç'} kapasitesi (${cap}) yetmiyor. ` +
    (suggestions.length ? `Öneri: ${suggestions[0]}` : 'Araç adedini artırın.');
}

/**
 * Oda kapasite uyarısı. Sorun yoksa null döner.
 */
export function roomCapacityWarning(
  item: QuotationItemCalc,
  ctx: TripContext,
): string | null {
  if (item.pricingType !== 'per_room') return null;
  const total = ctx.adultsCount + ctx.childrenCount;
  const cap = item.quantity * 2 + item.extraBedCount;
  if (total <= cap) return null;
  return `${item.quantity} oda + ${item.extraBedCount} ek yatak = ${cap} kapasitesi, ` +
    `${total} kişi sığmıyor. Oda veya ek yatak ekleyin.`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
