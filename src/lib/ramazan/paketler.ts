// Ramazan 2027 umresi (25 Ekim, kullanıcı): Safwah Al Talayie, 4 kişilik oda, 30 gece. Oda alışı 5000 SAR, oda satışı 7700 SAR.
// Odanın ayı 5'er gecelik 6 bloğa bölünür; 30 / 15 (2 grup) / 10 (3 grup) / 5 (6 grup) Ramazan paketleri bu blokları doldurur.
// Fiyat her geceye eşit bölünür (oda gecesi 7700 / 30 SAR); oda 2, 3 ya da 4 kişiyle satılır. Kişi başı fiyat:
// (oda payı + Cidde ↔ Mekke Camry transfer + kişi başı vize) × KDV × kart payı / kişi, ",99" (net paketlerle aynı kural).
// Bu dosya istemci tarafında da kullanılır (sunucuya özgü içe aktarma yok).

export const RAMAZAN = {
  otelSlug: "safwah-al-talayie",
  otelAdi: "Safwah Al Talayie",
  odaAlisSar: 5000,
  odaSatisSar: 7700,
  gece: 30,
  blokGece: 5,
  kapasite: 4,
  kisiler: [2, 3, 4] as const,
  vizeUsd: 120,
  sar: 3.75,
  /** Otelle anlaşılan 30 gece: ilk teravih akşamı giriş, bayram sabahı çıkış (Diyanet: 1. oruç 8 Şubat, bayram 9 Mart 2027) */
  giris: "2027-02-07",
  /** Ödenmeyen rezervasyon bu süre sonunda serbest kalır */
  odemeSaat: 24,
  transferRotalari: ["cidde-hav-mekke", "mekke-cidde-hav"],
  arac: "camry" as const,
  yemek: "sahur ve iftar dahil",
};

export const BLOK_SAYISI = RAMAZAN.gece / RAMAZAN.blokGece; // 6

export type RamazanPaket = { id: string; tur: 30 | 15 | 10 | 5; grup: number | null; bloklar: number[]; ad: string };

const grup = (tur: 30 | 15 | 10 | 5, g: number | null, bloklar: number[]): RamazanPaket => ({
  id: g ? `${tur}-${g}` : `${tur}`,
  tur,
  grup: g,
  bloklar,
  ad: g ? `${tur} Ramazan · ${g}. grup` : `${tur} Ramazan`,
});

export const RAMAZAN_PAKETLERI: RamazanPaket[] = [
  grup(30, null, [1, 2, 3, 4, 5, 6]),
  grup(15, 1, [1, 2, 3]), grup(15, 2, [4, 5, 6]),
  grup(10, 1, [1, 2]), grup(10, 2, [3, 4]), grup(10, 3, [5, 6]),
  ...[1, 2, 3, 4, 5, 6].map((b) => grup(5, b, [b])),
];

export const ramazanPaketi = (id: string) => RAMAZAN_PAKETLERI.find((p) => p.id === id) ?? null;

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const gunEkle = (iso: string, gun: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + gun);
  return d;
};
const tarih = (d: Date) => `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]}`;

/** Paketin Ramazan günleri ve takvim tarihleri (giriş–çıkış) */
export function paketTarihleri(p: RamazanPaket) {
  const ilk = p.bloklar[0], son = p.bloklar[p.bloklar.length - 1];
  const basGun = (ilk - 1) * RAMAZAN.blokGece; // girişten kaç gün sonra
  const bitGun = son * RAMAZAN.blokGece;
  return {
    ramazan: `${basGun + 1}–${bitGun} Ramazan`,
    giris: tarih(gunEkle(RAMAZAN.giris, basGun)),
    cikis: tarih(gunEkle(RAMAZAN.giris, bitGun)),
    gece: bitGun - basGun,
  };
}

/** ",99" (net paketlerle aynı): tam dolara yuvarlanan fiyattan 1 cent eksik */
const dokuzDoksanDokuz = (usd: number) => Math.round((Math.round(usd) - 0.01) * 100) / 100;

/** KDV %5 ve kart payı %5 (src/lib/satis/ortak.ts ile aynı oranlar) */
export const KDV_KART = 1.05 * 1.05;

/** Kişi başı fiyat. transferUsd: bir grubun gidiş-dönüş Camry satış fiyatı (katalogdan). */
export function ramazanFiyat(p: RamazanPaket, kisi: number, transferUsd: number) {
  const gece = p.bloklar.length * RAMAZAN.blokGece;
  const odaUsd = (RAMAZAN.odaSatisSar / RAMAZAN.gece) * gece / RAMAZAN.sar;
  const net = odaUsd + transferUsd + RAMAZAN.vizeUsd * kisi;
  const kisiBasi = dokuzDoksanDokuz((net * KDV_KART) / kisi);
  return { kisiBasiUsd: kisiBasi, toplamUsd: Math.round(kisiBasi * kisi * 100) / 100 };
}

export type Doluluk = Record<number, number[]>; // oda no → dolu bloklar

/**
 * Tek oda kuralı: önce satın alınmış (rezervasyonu olan) odalardaki boşluklar satılır; yeni oda yalnızca açık odaların hepsi
 * tamamen dolduğunda açılır. Paket uygun bir odaya sığmıyorsa satılamaz (null).
 */
export function uygunOda(doluluk: Doluluk, p: RamazanPaket): number | null {
  const odalar = Object.keys(doluluk).map(Number).filter((o) => doluluk[o].length > 0).sort((a, b) => a - b);
  for (const o of odalar) {
    if (p.bloklar.every((b) => !doluluk[o].includes(b))) return o;
  }
  const hepsiDolu = odalar.every((o) => doluluk[o].length >= BLOK_SAYISI);
  return hepsiDolu ? (odalar.length ? Math.max(...odalar) + 1 : 1) : null;
}

/** Açık (son) odanın blok durumu: satışta görünen oda */
export function acikOda(doluluk: Doluluk) {
  const odalar = Object.keys(doluluk).map(Number).filter((o) => doluluk[o].length > 0).sort((a, b) => a - b);
  const bosluklu = odalar.find((o) => doluluk[o].length < BLOK_SAYISI);
  if (bosluklu != null) return { oda: bosluklu, dolu: doluluk[bosluklu] };
  return { oda: odalar.length ? Math.max(...odalar) + 1 : 1, dolu: [] as number[] };
}
