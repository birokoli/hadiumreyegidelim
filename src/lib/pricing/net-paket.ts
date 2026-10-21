// Net fiyatlı paket (20 Ekim, kullanıcı): paket payı yok; fiyat = otel satış fiyatı × gece + transfer satış fiyatı + kişi başı vize,
// üstüne KDV %5 ve kart payı %5 zincirleme. Gece ve kişi sayısına göre fiyat tablosu çıkar; paket sayfası bu tabloyu gösterir.
// Örnek (Safwah, 132 SAR otel, 690 SAR Camry, 115 $ vize): 2 kişi 4 gece kişi başı 306 $.
// Fiyatlar katalogdan gelir (admin → Ürün ve Fiyat); yeni paket NET_PAKETLER'e eklenir.
import type { CatalogItem } from "@/lib/catalog";
import { KART_PAYI, KDV_ORANI } from "@/lib/satis/ortak";
import { parseTransferSlug, type VehicleKey } from "@/lib/catalog/transfers";
import { hotelNightCost, roomsNeeded, unitPrice } from "@/lib/pricing/plan";
import { monthsFrom } from "@/lib/catalog";

export type NetPaket = {
  hotelSlug: string;
  city: "mekke" | "medine";
  geceler: number[];
  kisiler: number[];
  vizeUsd: number;
  rotalar: string[];
  arac: VehicleKey;
  /** Kart payı dahil fiyatın gösterildiği varsayılan seçim (vitrin) */
  vitrin: { gece: number; kisi: number };
  /** Fiyatın alındığı ay (ör. "2026-11"); yoksa önümüzdeki 4 ayın fiyatı olan ilki */
  ay?: string;
  /** Yemek durumu metni ("yemek dahil", "kahvaltı ve akşam yemeği dahil"); null = yalnızca oda */
  yemek: string | null;
  /** Otel kutusunda kısa not (ör. "Harem'e ücretsiz servis") */
  otelNotu: string;
};

export const NET_PAKETLER: Record<string, NetPaket> = {
  "10-gunluk-bireysel-umre-mekke-safwah-al-talayie": {
    hotelSlug: "safwah-al-talayie",
    city: "mekke",
    geceler: [4, 6, 8, 9],
    kisiler: [2, 3, 4],
    vizeUsd: 115,
    rotalar: ["cidde-hav-mekke", "mekke-cidde-hav", "mekke-ziyaret"],
    arac: "camry",
    vitrin: { gece: 4, kisi: 4 },
    yemek: "yemek dahil",
    otelNotu: "Harem'e ücretsiz servis",
  },
  // 21 Ekim (kullanıcı): Kasım; otel alış 100 SAR, satış 120 SAR, yalnızca oda. Camry B2B 240 + 180 + 180 SAR + %15 = 690 SAR
  "10-gunluk-bireysel-umre-mekke-mehd-al-resaleh-3": {
    hotelSlug: "mehd-al-resaleh-3",
    city: "mekke",
    geceler: [4, 6, 8, 9],
    kisiler: [2, 3, 4],
    vizeUsd: 115,
    rotalar: ["cidde-hav-mekke", "mekke-cidde-hav", "mekke-ziyaret"],
    arac: "camry",
    vitrin: { gece: 4, kisi: 4 },
    ay: "2026-11",
    yemek: null,
    otelNotu: "Harem'e yürüme mesafesi (yaklaşık 15 dakika)",
  },
  // 21 Ekim (kullanıcı): Kasım hafta sonu fiyatı; 2/3/4 kişilik oda fiyatı ayrı (katalog k2/k3/k4), yarım pansiyon
  "10-gunluk-bireysel-umre-mekke-address-jabal-omar": {
    hotelSlug: "address-jabal-omar-makkah",
    city: "mekke",
    geceler: [4, 6, 8, 9],
    kisiler: [2, 3, 4],
    vizeUsd: 115,
    rotalar: ["cidde-hav-mekke", "mekke-cidde-hav", "mekke-ziyaret"],
    arac: "camry",
    vitrin: { gece: 4, kisi: 4 },
    ay: "2026-11",
    yemek: "kahvaltı ve akşam yemeği dahil",
    otelNotu: "Harem'in yanında, Cebel Ömer'de 5 yıldızlı otel",
  },
};

export const netPaket = (slug: string) => NET_PAKETLER[slug] ?? null;

// Fiyat dolar üzerinden ve ödeme yönteminden bağımsız tek fiyat (kullanıcı, 20 Ekim: "havale yazmasın, her türlü 216 USD"); TL gösterilmez
export type NetFiyat = { gece: number; kisi: number; kisiBasiUsd: number; toplamUsd: number; oda: number };

/** ",99" fiyatlama (kullanıcı, 21 Ekim): tam dolara yuvarlanan fiyattan 1 cent eksik; 216 $ → 215,99 $ */
export const dokuzDoksanDokuz = (usd: number) => Math.round((Math.round(usd) - 0.01) * 100) / 100;

/** Gece × kişi fiyat tablosu. Otel ya da transfer fiyatı eksikse null. */
export function netFiyatTablosu(p: NetPaket, catalog: CatalogItem[], month: string): NetFiyat[] | null {
  const otel = catalog.find((c) => c.category === "hotel" && c.slug === p.hotelSlug);
  if (!otel) return null;
  let transfer = 0;
  for (const rota of p.rotalar) {
    const item = catalog.find((c) => {
      const t = parseTransferSlug(c.slug);
      return t?.route.key === rota && t.vehicle === p.arac;
    });
    const fiyat = item ? unitPrice(item, month) : null;
    if (fiyat == null) return null;
    transfer += fiyat;
  }
  const kdv = 1 + KDV_ORANI;
  const kart = 1 + KART_PAYI;
  return p.geceler.flatMap((gece) =>
    p.kisiler.flatMap((kisi) => {
      const oda = roomsNeeded(kisi);
      // Gecelik oda bedeli kişi sayısına göre (2/3/4 kişilik oda fiyatı varsa onu, yoksa oda fiyatını alır)
      const gecelik = hotelNightCost(otel, month, kisi);
      if (gecelik == null) return [];
      const net = gecelik * gece + transfer + p.vizeUsd * kisi;
      const kisiBasi = (net * kdv * kart) / kisi;
      return [{
        gece,
        kisi,
        oda,
        kisiBasiUsd: dokuzDoksanDokuz(kisiBasi),
        toplamUsd: Math.round(dokuzDoksanDokuz(kisiBasi) * kisi * 100) / 100,
      }];
    }),
  );
}

/** Paketin fiyat tablosu ve ayı: sabit ay verilmişse o ay, yoksa önümüzdeki 4 ayda tablosu tam çıkan ilk ay */
export function netPaketTablosu(p: NetPaket, catalog: CatalogItem[]): { tablo: NetFiyat[]; ay: string } | null {
  const tam = (t: NetFiyat[] | null) => t && t.length === p.geceler.length * p.kisiler.length;
  for (const ay of p.ay ? [p.ay] : monthsFrom(undefined, 4)) {
    const tablo = netFiyatTablosu(p, catalog, ay);
    if (tam(tablo)) return { tablo: tablo!, ay };
  }
  return null;
}
