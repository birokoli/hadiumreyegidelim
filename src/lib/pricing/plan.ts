// Bireysel umre planı fiyat motoru (Y2). Saf fonksiyonlar: hem sunucuda hem tarayıcıda çalışır.
// Fiyatlar yalnızca katalogdaki aylık SATIŞ fiyatlarından veya basePriceUsd'den gelir (src/lib/catalog).
import type { CatalogItem, PaymentSettings } from "@/lib/catalog";
import { vehicleCapacity } from "@/lib/quotation-calc";

export type RoomType = "2" | "3" | "4";

export type PlanInput = {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  mekkeNights: number;
  medineNights: number;
  adults: number;
  children: number; // 2–11 yaş
  roomType: RoomType;
  mekkeHotelId: string | null;
  medineHotelId: string | null;
  visa: "biz" | "kendim";
  serviceIds: string[]; // transfer, tren, tur, ekstra
};

export type PlanLine = {
  itemId: string;
  label: string;
  detail: string;
  totalUsd: number | null; // null = o ay fiyatı yok (teklifte bildirilir)
};

export type PlanQuote = {
  lines: PlanLine[];
  pending: string[]; // fiyatı teklifte verilecek kalemler
  totalUsd: number; // fiyatı bilinen kalemlerin toplamı
  perPersonUsd: number;
  people: number;
  rooms: number;
  complete: boolean; // bütün kalemlerin fiyatı biliniyor mu
};

const ROOM_CAP: Record<RoomType, number> = { "2": 2, "3": 3, "4": 4 };
const round = (n: number) => Math.round(n);

/** Kişi sayısına göre gereken oda sayısı (seçilen oda tipinde) */
export const roomsNeeded = (people: number, roomType: RoomType) => Math.max(1, Math.ceil(people / ROOM_CAP[roomType]));

export function unitPrice(item: CatalogItem, month: string, variant = ""): number | null {
  const exact = item.prices?.find((p) => p.month === month && p.variant === variant);
  if (exact) return exact.priceUsd;
  const monthPrice = variant ? null : item.prices?.find((p) => p.month === month)?.priceUsd ?? null;
  if (monthPrice != null) return monthPrice;
  return item.basePriceUsd ?? null;
}

function lineFor(item: CatalogItem, input: PlanInput, people: number, rooms: number): PlanLine {
  const m = input.checkIn.slice(0, 7);
  switch (item.pricingType) {
    case "per_room": {
      const nights = item.city === "medine" ? input.medineNights : input.mekkeNights;
      const p = unitPrice(item, m, input.roomType);
      return {
        itemId: item.id,
        label: item.name,
        detail: `${rooms} oda (${input.roomType} kişilik) × ${nights} gece`,
        totalUsd: p == null || nights <= 0 ? (nights <= 0 ? 0 : null) : round(p * rooms * nights),
      };
    }
    case "per_vehicle": {
      const vehicles = Math.max(1, Math.ceil(people / vehicleCapacity(item.vehicleType ?? "sedan")));
      const p = unitPrice(item, m);
      return { itemId: item.id, label: item.name, detail: `${vehicles} araç`, totalUsd: p == null ? null : round(p * vehicles) };
    }
    case "per_person": {
      const p = unitPrice(item, m);
      return { itemId: item.id, label: item.name, detail: `${people} kişi`, totalUsd: p == null ? null : round(p * people) };
    }
    default: {
      const p = unitPrice(item, m);
      return { itemId: item.id, label: item.name, detail: "1 adet", totalUsd: p == null ? null : round(p) };
    }
  }
}

export function quotePlan(input: PlanInput, catalog: CatalogItem[]): PlanQuote {
  const people = Math.max(1, input.adults + input.children);
  const rooms = roomsNeeded(people, input.roomType);
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const lines: PlanLine[] = [];
  const pending: string[] = [];

  // Oteller
  for (const [city, id, nights] of [["Mekke", input.mekkeHotelId, input.mekkeNights], ["Medine", input.medineHotelId, input.medineNights]] as const) {
    if (nights <= 0) continue;
    const hotel = id ? byId.get(id) : undefined;
    if (hotel) lines.push(lineFor(hotel, input, people, rooms));
    else pending.push(`${city} oteli (${nights} gece): otel seçilmedi`);
  }

  // Vize
  if (input.visa === "biz") {
    const vizeItem = catalog.find((c) => c.category === "vize");
    if (vizeItem) {
      lines.push(lineFor(vizeItem, input, people, rooms));
    } else {
      lines.push({
        itemId: "vize-default",
        label: "Umre vizesi",
        detail: `${people} kişi`,
        totalUsd: 140 * people,
      });
    }
  }

  // Diğer hizmetler (transfer, tren, tur, ekstra)
  for (const id of input.serviceIds) {
    const item = byId.get(id);
    if (item && item.category !== "vize") lines.push(lineFor(item, input, people, rooms));
  }

  for (const l of lines) if (l.totalUsd == null) pending.push(`${l.label}: bu dönem için fiyat teklifte bildirilecek`);
  const totalUsd = lines.reduce((s, l) => s + (l.totalUsd ?? 0), 0);
  return {
    lines,
    pending,
    totalUsd,
    perPersonUsd: round(totalUsd / people),
    people,
    rooms,
    complete: pending.length === 0,
  };
}

/** WhatsApp ve talep kaydı için numaralı düz metin */
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
/** "2026-11-01" → "1 Kasım 2026" */
const trDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS_TR[m - 1]} ${y}` : ymd;
};

export function planToText(input: PlanInput, quote: PlanQuote, catalog: CatalogItem[], payment?: PaymentSettings): string {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const mekkeHotel = input.mekkeHotelId ? byId.get(input.mekkeHotelId) : null;
  const medineHotel = input.medineHotelId ? byId.get(input.medineHotelId) : null;
  const totalNights = input.mekkeNights + input.medineNights;

  const out = [
    "Merhaba, bireysel umre planım:",
    `1) Tarih: ${trDate(input.checkIn)} – ${trDate(input.checkOut)} (${totalNights} gece)`,
    `2) Mekke: ${input.mekkeNights} gece${mekkeHotel ? ` · ${mekkeHotel.name}` : " (otel seçilmedi)"}`,
    `3) Medine: ${input.medineNights} gece${medineHotel ? ` · ${medineHotel.name}` : " (otel seçilmedi)"}`,
    `4) Kişi & Oda: ${input.adults} yetişkin${input.children ? ` + ${input.children} çocuk` : ""} · ${quote.rooms} oda (${input.roomType} kişilik)`,
    `5) Vize: ${input.visa === "biz" ? "Vizemi siz alın (vize hizmeti istiyorum)" : "Vizem var / kendim alacağım"}`,
    "6) Seçimler & Detaylar:",
    ...quote.lines.map((l) => `   - ${l.label} · ${l.detail} · ${l.totalUsd != null ? `${l.totalUsd} USD` : "fiyat teklifte"}`),
    ...quote.pending.filter((p) => !quote.lines.some((l) => p.startsWith(`${l.label}:`))).map((p) => `   - ${p}`),
    `7) Planlayıcı tahmini: ${quote.totalUsd} USD (kişi başı ${quote.perPersonUsd} USD)${quote.complete ? "" : ", eksik kalemler teklifte eklenecek"}`,
    ...(payment && quote.totalUsd > 0 ? ["8) Ödeme seçenekleri:", ...paymentOptions(quote.totalUsd, payment).map((r) => `   - ${r.label}: ${r.usd} USD${r.tryAmount ? ` (≈ ${r.tryAmount.toLocaleString("tr-TR")} TL)` : ""}`)] : []),
  ];
  return out.join("\n");
}

export type PaymentRow = { key: "nakit" | "iban" | "kart"; label: string; usd: number; tryAmount: number | null };

/** Nakit esas; IBAN ve kart farkı fiyat motoruyla aynı (varsayılan +%20, +%26). Kur varsa ≈ TL. */
export function paymentOptions(totalUsd: number, p: PaymentSettings): PaymentRow[] {
  const rows: [PaymentRow["key"], string, number][] = [
    ["nakit", "Nakit / peşin", 0],
    ["iban", `IBAN / havale (+%${p.ibanPercent})`, p.ibanPercent],
    ["kart", `Kredi kartı (+%${p.cardPercent})`, p.cardPercent],
  ];
  return rows.map(([key, label, pct]) => {
    const usd = Math.round(totalUsd * (1 + pct / 100));
    return { key, label, usd, tryAmount: p.usdTry ? Math.round(usd * p.usdTry) : null };
  });
}
