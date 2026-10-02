// Bireysel umre planı fiyat motoru (Y2). Saf fonksiyonlar: hem sunucuda hem tarayıcıda çalışır.
// Fiyatlar yalnızca katalogdaki aylık SATIŞ fiyatlarından veya basePriceUsd'den gelir (src/lib/catalog).
import type { CatalogItem, PaymentSettings } from "@/lib/catalog";
import { vehicleCapacity } from "@/lib/quotation-calc";


export type PlanInput = {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  mekkeNights: number;
  medineNights: number;
  adults: number;
  children: number; // 2–11 yaş
  infants?: number; // 0–2 yaş: otele bildirilmez, oda ve kişi başı hizmetlere sayılmaz; beşik ücreti alınır
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

const round = (n: number) => Math.round(n);

/** Bir odada en fazla 4 kişi kalır (kullanıcı kuralı, 2 Ekim): 1–4 kişi 1 oda, 5–8 kişi 2 oda… */
export const ROOM_CAPACITY = 4;
export const roomsNeeded = (people: number) => Math.max(1, Math.ceil(people / ROOM_CAPACITY));

/**
 * Birim satış fiyatı. Otelde bu, **1 odanın 1 gecelik** fiyatıdır (giriş 16:00, ertesi gün çıkış 11:00).
 * Sıra: o ayın fiyatı (oda tipi ayrımı yok; eskiden girilmiş 2/3/4 kişilik fiyat varsa en düşüğü) → alıştan hesaplanan basePriceUsd.
 */
export function unitPrice(item: CatalogItem, month: string): number | null {
  const monthPrices = (item.prices ?? []).filter((p) => p.month === month);
  const single = monthPrices.find((p) => p.variant === "");
  if (single) return single.priceUsd;
  if (monthPrices.length) return Math.min(...monthPrices.map((p) => p.priceUsd));
  return item.basePriceUsd ?? null;
}

function lineFor(item: CatalogItem, input: PlanInput, people: number, rooms: number): PlanLine {
  const m = input.checkIn.slice(0, 7);
  // Otel her zaman 1 oda × 1 gece fiyatıdır; kayıttaki fiyatlandırma tipi yanlış girilmiş olsa da (ör. "Sabit") oda × gece hesaplanır
  switch (item.category === "hotel" ? "per_room" : item.pricingType) {
    case "per_room": {
      const nights = item.city === "medine" ? input.medineNights : input.mekkeNights;
      const p = unitPrice(item, m);
      return {
        itemId: item.id,
        label: item.name,
        detail: `${rooms} oda × ${nights} gece`,
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

/** Bebek beşiği kalemi: Hizmet Kütüphanesi'nde adı "beşik" geçen kalem (sitede göster açık). Planlayıcı onu ayrıca listelemez. */
export const isCribItem = (c: Pick<CatalogItem, "name">) => /beşi[kğ]|besi[kg]/i.test(c.name); // "beşik", "beşiği"

export function quotePlan(input: PlanInput, catalog: CatalogItem[]): PlanQuote {
  const people = Math.max(1, input.adults + input.children);
  const rooms = roomsNeeded(people);
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

  // Bebek beşiği: bebek başına, konaklanan her gece (bebek otele bildirilmez, oda hesabına girmez)
  const infants = Math.max(0, input.infants ?? 0);
  const stayNights = Math.max(0, input.mekkeNights) + Math.max(0, input.medineNights);
  if (infants > 0 && stayNights > 0) {
    const crib = catalog.find(isCribItem);
    const p = crib ? unitPrice(crib, input.checkIn.slice(0, 7)) : null;
    lines.push({
      itemId: crib?.id ?? "besik",
      label: crib?.name ?? "Bebek beşiği",
      detail: `${infants} bebek × ${stayNights} gece`,
      totalUsd: p == null ? null : round(p * infants * stayNights),
    });
  }

  // Diğer hizmetler (transfer, tren, tur, ekstra)
  for (const id of input.serviceIds) {
    const item = byId.get(id);
    if (item && item.category !== "vize" && !isCribItem(item)) lines.push(lineFor(item, input, people, rooms));
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
    `4) Kişi & Oda: ${input.adults} yetişkin${input.children ? ` + ${input.children} çocuk` : ""}${input.infants ? ` + ${input.infants} bebek (0–2 yaş, otele bildirilmez; beşik ücreti)` : ""} · ${quote.rooms} oda (odada en fazla 4 kişi)`,
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
