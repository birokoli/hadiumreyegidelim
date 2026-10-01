// Bireysel umre planı fiyat motoru (Y2). Saf fonksiyonlar: hem sunucuda hem tarayıcıda çalışır.
// Fiyatlar yalnızca katalogdaki aylık SATIŞ fiyatlarından gelir (src/lib/catalog). Kurallar fiyat teklifi
// motoruyla (quotation-calc.ts) aynı: kişi başı, araç başı (kapasiteye göre araç sayısı), oda başı, sabit.
import type { CatalogItem, PaymentSettings } from "@/lib/catalog";
import { vehicleCapacity } from "@/lib/quotation-calc";

export type RoomType = "2" | "3" | "4";

export type PlanInput = {
  month: string; // YYYY-MM
  mekkeNights: number;
  medineNights: number;
  adults: number;
  children: number; // 2–11 yaş; kişi başı kalemlerde yetişkin gibi sayılır, teklifte netleşir
  roomType: RoomType;
  mekkeHotelId: string | null; // null = "bana önerin"
  medineHotelId: string | null;
  flight: { mode: "biz" | "kendim"; itemId: string | null }; // itemId: kalkış şehrinin tahmini uçuş kalemi
  serviceIds: string[]; // transfer, tren, vize, tur, ekstra
};

export type PlanLine = {
  itemId: string;
  label: string;
  detail: string;
  totalUsd: number | null; // null = o ay fiyatı yok (teklifte bildirilir)
};

export type PlanQuote = {
  lines: PlanLine[];
  pending: string[]; // fiyatı teklifte verilecek kalemler (öneri istenen otel dahil)
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

function unitPrice(item: CatalogItem, month: string, variant = ""): number | null {
  const exact = item.prices.find((p) => p.month === month && p.variant === variant);
  if (exact) return exact.priceUsd;
  // Tek fiyatlı kalemde variant boş; oda fiyatı girilmemiş tiplerde null
  return variant ? null : item.prices.find((p) => p.month === month)?.priceUsd ?? null;
}

function lineFor(item: CatalogItem, input: PlanInput, people: number, rooms: number): PlanLine {
  const m = input.month;
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

  for (const [city, id, nights] of [["Mekke", input.mekkeHotelId, input.mekkeNights], ["Medine", input.medineHotelId, input.medineNights]] as const) {
    if (nights <= 0) continue;
    const hotel = id ? byId.get(id) : undefined;
    if (hotel) lines.push(lineFor(hotel, input, people, rooms));
    else pending.push(`${city} oteli (${nights} gece): size uygun seçenekler önerilecek`);
  }

  if (input.flight.mode === "biz") {
    const f = input.flight.itemId ? byId.get(input.flight.itemId) : undefined;
    if (f) lines.push({ ...lineFor(f, input, people, rooms), label: `${f.name} (tahmini)` });
    else pending.push("Uçuş: kalkış şehrinize göre bildirilecek");
  }

  for (const id of input.serviceIds) {
    const item = byId.get(id);
    if (item) lines.push(lineFor(item, input, people, rooms));
  }

  for (const l of lines) if (l.totalUsd == null) pending.push(`${l.label}: bu ay için fiyat teklifte bildirilecek`);
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
export function planToText(input: PlanInput, quote: PlanQuote, monthText: string, payment?: PaymentSettings): string {
  const out = [
    "Merhaba, bireysel umre planım:",
    `1) Dönem: ${monthText}`,
    `2) Mekke ${input.mekkeNights} gece + Medine ${input.medineNights} gece`,
    `3) Kişi: ${input.adults} yetişkin${input.children ? ` + ${input.children} çocuk` : ""} · ${quote.rooms} oda (${input.roomType} kişilik)`,
    `4) Uçuş: ${input.flight.mode === "biz" ? "sizin ayarlamanızı istiyorum" : "kendim alacağım"}`,
    "5) Seçimler:",
    ...quote.lines.map((l) => `   - ${l.label} · ${l.detail} · ${l.totalUsd != null ? `${l.totalUsd} USD` : "fiyat teklifte"}`),
    ...quote.pending.filter((p) => !quote.lines.some((l) => p.startsWith(`${l.label}:`))).map((p) => `   - ${p}`),
    `6) Planlayıcı tahmini: ${quote.totalUsd} USD (kişi başı ${quote.perPersonUsd} USD)${quote.complete ? "" : ", eksik kalemler teklifte eklenecek"}`,
    ...(payment && quote.totalUsd > 0 ? ["7) Ödeme:", ...paymentOptions(quote.totalUsd, payment).map((r) => `   - ${r.label}: ${r.usd} USD${r.tryAmount ? ` (≈ ${r.tryAmount.toLocaleString("tr-TR")} TL)` : ""}`)] : []),
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
