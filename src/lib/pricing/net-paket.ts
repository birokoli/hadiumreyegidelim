// Net fiyatlı paket (20 Ekim, kullanıcı): paket payı yok; fiyat = otel satış fiyatı × gece + transfer satış fiyatı + kişi başı vize,
// üstüne KDV %5 ve kart payı %5 zincirleme. Gece ve kişi sayısına göre fiyat tablosu çıkar; paket sayfası bu tabloyu gösterir.
// Örnek (Safwah, 132 SAR otel, 690 SAR Camry, 115 $ vize): 2 kişi 4 gece kişi başı 306 $.
// Fiyatlar katalogdan gelir (admin → Ürün ve Fiyat); yeni paket NET_PAKETLER'e eklenir.
import type { CatalogItem } from "@/lib/catalog";
import { KART_PAYI, KDV_ORANI } from "@/lib/satis/ortak";
import { parseTransferSlug, type VehicleKey } from "@/lib/catalog/transfers";
import { roomsNeeded, unitPrice } from "@/lib/pricing/plan";

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
  },
};

export const netPaket = (slug: string) => NET_PAKETLER[slug] ?? null;

// Fiyat dolar üzerinden ve ödeme yönteminden bağımsız tek fiyat (kullanıcı, 20 Ekim: "havale yazmasın, her türlü 216 USD"); TL gösterilmez
export type NetFiyat = { gece: number; kisi: number; kisiBasiUsd: number; toplamUsd: number; oda: number };

/** Gece × kişi fiyat tablosu. Otel ya da transfer fiyatı eksikse null. */
export function netFiyatTablosu(p: NetPaket, catalog: CatalogItem[], month: string): NetFiyat[] | null {
  const otel = catalog.find((c) => c.category === "hotel" && c.slug === p.hotelSlug);
  const gecelik = otel ? unitPrice(otel, month) : null;
  if (gecelik == null) return null;
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
    p.kisiler.map((kisi) => {
      const oda = roomsNeeded(kisi);
      const net = gecelik * gece * oda + transfer + p.vizeUsd * kisi;
      const kisiBasi = (net * kdv * kart) / kisi;
      return {
        gece,
        kisi,
        oda,
        kisiBasiUsd: Math.round(kisiBasi),
        toplamUsd: Math.round(kisiBasi) * kisi,
      };
    }),
  );
}
