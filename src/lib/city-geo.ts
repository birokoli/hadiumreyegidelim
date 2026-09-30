// İl merkezlerinin yaklaşık koordinatları ve coğrafi bölgeleri. Şehir sayfalarında mesafe
// (kuş uçuşu) ve en yakın iller bu veriden hesaplanır; değerler yaklaşıktır, sayfada da öyle yazılır.

export type Region = "Marmara" | "Ege" | "Akdeniz" | "İç Anadolu" | "Karadeniz" | "Doğu Anadolu" | "Güneydoğu Anadolu";

export const CITY_GEO: Record<string, { lat: number; lon: number; region: Region }> = {
  // Marmara
  istanbul: { lat: 41.01, lon: 28.98, region: "Marmara" },
  edirne: { lat: 41.68, lon: 26.56, region: "Marmara" },
  kirklareli: { lat: 41.73, lon: 27.22, region: "Marmara" },
  tekirdag: { lat: 40.98, lon: 27.51, region: "Marmara" },
  canakkale: { lat: 40.15, lon: 26.41, region: "Marmara" },
  balikesir: { lat: 39.65, lon: 27.88, region: "Marmara" },
  bursa: { lat: 40.19, lon: 29.06, region: "Marmara" },
  yalova: { lat: 40.65, lon: 29.27, region: "Marmara" },
  kocaeli: { lat: 40.77, lon: 29.92, region: "Marmara" },
  sakarya: { lat: 40.78, lon: 30.4, region: "Marmara" },
  bilecik: { lat: 40.14, lon: 29.98, region: "Marmara" },
  // Ege
  izmir: { lat: 38.42, lon: 27.14, region: "Ege" },
  manisa: { lat: 38.61, lon: 27.43, region: "Ege" },
  aydin: { lat: 37.85, lon: 27.84, region: "Ege" },
  mugla: { lat: 37.21, lon: 28.36, region: "Ege" },
  denizli: { lat: 37.78, lon: 29.09, region: "Ege" },
  usak: { lat: 38.68, lon: 29.41, region: "Ege" },
  kutahya: { lat: 39.42, lon: 29.98, region: "Ege" },
  afyonkarahisar: { lat: 38.76, lon: 30.54, region: "Ege" },
  // Akdeniz
  antalya: { lat: 36.9, lon: 30.7, region: "Akdeniz" },
  isparta: { lat: 37.76, lon: 30.55, region: "Akdeniz" },
  burdur: { lat: 37.72, lon: 30.29, region: "Akdeniz" },
  mersin: { lat: 36.8, lon: 34.63, region: "Akdeniz" },
  adana: { lat: 37.0, lon: 35.32, region: "Akdeniz" },
  osmaniye: { lat: 37.07, lon: 36.25, region: "Akdeniz" },
  hatay: { lat: 36.2, lon: 36.16, region: "Akdeniz" },
  kahramanmaras: { lat: 37.58, lon: 36.93, region: "Akdeniz" },
  // İç Anadolu
  ankara: { lat: 39.93, lon: 32.86, region: "İç Anadolu" },
  konya: { lat: 37.87, lon: 32.48, region: "İç Anadolu" },
  karaman: { lat: 37.18, lon: 33.22, region: "İç Anadolu" },
  aksaray: { lat: 38.37, lon: 34.03, region: "İç Anadolu" },
  nigde: { lat: 37.97, lon: 34.68, region: "İç Anadolu" },
  nevsehir: { lat: 38.62, lon: 34.71, region: "İç Anadolu" },
  kirsehir: { lat: 39.15, lon: 34.16, region: "İç Anadolu" },
  kirikkale: { lat: 39.85, lon: 33.51, region: "İç Anadolu" },
  cankiri: { lat: 40.6, lon: 33.62, region: "İç Anadolu" },
  yozgat: { lat: 39.82, lon: 34.81, region: "İç Anadolu" },
  kayseri: { lat: 38.73, lon: 35.49, region: "İç Anadolu" },
  sivas: { lat: 39.75, lon: 37.02, region: "İç Anadolu" },
  eskisehir: { lat: 39.78, lon: 30.52, region: "İç Anadolu" },
  // Karadeniz
  zonguldak: { lat: 41.45, lon: 31.79, region: "Karadeniz" },
  bartin: { lat: 41.63, lon: 32.34, region: "Karadeniz" },
  karabuk: { lat: 41.2, lon: 32.63, region: "Karadeniz" },
  bolu: { lat: 40.73, lon: 31.61, region: "Karadeniz" },
  duzce: { lat: 40.84, lon: 31.16, region: "Karadeniz" },
  kastamonu: { lat: 41.38, lon: 33.78, region: "Karadeniz" },
  sinop: { lat: 42.03, lon: 35.15, region: "Karadeniz" },
  samsun: { lat: 41.29, lon: 36.33, region: "Karadeniz" },
  amasya: { lat: 40.65, lon: 35.83, region: "Karadeniz" },
  corum: { lat: 40.55, lon: 34.95, region: "Karadeniz" },
  tokat: { lat: 40.31, lon: 36.55, region: "Karadeniz" },
  ordu: { lat: 40.98, lon: 37.88, region: "Karadeniz" },
  giresun: { lat: 40.91, lon: 38.39, region: "Karadeniz" },
  trabzon: { lat: 41.0, lon: 39.72, region: "Karadeniz" },
  rize: { lat: 41.02, lon: 40.52, region: "Karadeniz" },
  artvin: { lat: 41.18, lon: 41.82, region: "Karadeniz" },
  gumushane: { lat: 40.46, lon: 39.48, region: "Karadeniz" },
  bayburt: { lat: 40.26, lon: 40.23, region: "Karadeniz" },
  // Doğu Anadolu
  erzurum: { lat: 39.9, lon: 41.27, region: "Doğu Anadolu" },
  erzincan: { lat: 39.75, lon: 39.49, region: "Doğu Anadolu" },
  kars: { lat: 40.6, lon: 43.1, region: "Doğu Anadolu" },
  ardahan: { lat: 41.11, lon: 42.7, region: "Doğu Anadolu" },
  igdir: { lat: 39.92, lon: 44.04, region: "Doğu Anadolu" },
  agri: { lat: 39.72, lon: 43.05, region: "Doğu Anadolu" },
  van: { lat: 38.49, lon: 43.38, region: "Doğu Anadolu" },
  mus: { lat: 38.74, lon: 41.49, region: "Doğu Anadolu" },
  bitlis: { lat: 38.4, lon: 42.11, region: "Doğu Anadolu" },
  bingol: { lat: 38.88, lon: 40.5, region: "Doğu Anadolu" },
  tunceli: { lat: 39.11, lon: 39.55, region: "Doğu Anadolu" },
  elazig: { lat: 38.67, lon: 39.22, region: "Doğu Anadolu" },
  malatya: { lat: 38.35, lon: 38.31, region: "Doğu Anadolu" },
  hakkari: { lat: 37.57, lon: 43.74, region: "Doğu Anadolu" },
  // Güneydoğu Anadolu
  gaziantep: { lat: 37.07, lon: 37.38, region: "Güneydoğu Anadolu" },
  kilis: { lat: 36.72, lon: 37.12, region: "Güneydoğu Anadolu" },
  adiyaman: { lat: 37.76, lon: 38.28, region: "Güneydoğu Anadolu" },
  sanliurfa: { lat: 37.16, lon: 38.79, region: "Güneydoğu Anadolu" },
  diyarbakir: { lat: 37.91, lon: 40.24, region: "Güneydoğu Anadolu" },
  mardin: { lat: 37.31, lon: 40.74, region: "Güneydoğu Anadolu" },
  batman: { lat: 37.88, lon: 41.13, region: "Güneydoğu Anadolu" },
  siirt: { lat: 37.93, lon: 41.94, region: "Güneydoğu Anadolu" },
  sirnak: { lat: 37.52, lon: 42.46, region: "Güneydoğu Anadolu" },
};

const JEDDAH = { lat: 21.54, lon: 39.17 };
const MEDINA = { lat: 24.47, lon: 39.61 };

/** İki nokta arası kuş uçuşu mesafe (km, Haversine) */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Direkt uçuş için kaba süre tahmini: ~800 km/sa seyir + ~30 dk kalkış/iniş (dakika) */
export function estimateFlightMinutes(km: number) {
  return Math.round((km / 800) * 60 + 30);
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round((min % 60) / 5) * 5;
  return m ? `${h} saat ${m} dakika` : `${h} saat`;
}

export function cityTravelFacts(slug: string) {
  const g = CITY_GEO[slug];
  if (!g) return null;
  const toJeddah = distanceKm(g, JEDDAH);
  const toMedina = distanceKm(g, MEDINA);
  return {
    region: g.region,
    toJeddah,
    toMedina,
    jeddahFlight: formatDuration(estimateFlightMinutes(toJeddah)),
    medinaFlight: formatDuration(estimateFlightMinutes(toMedina)),
  };
}

/** En yakın n il (kuş uçuşu) */
export function nearestCities(slug: string, n = 4) {
  const g = CITY_GEO[slug];
  if (!g) return [];
  return Object.entries(CITY_GEO)
    .filter(([s]) => s !== slug)
    .map(([s, c]) => ({ slug: s, km: distanceKm(g, c) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}
