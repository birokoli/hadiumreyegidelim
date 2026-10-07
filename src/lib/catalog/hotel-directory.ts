// Otel rehberi (7 Ekim, kullanıcı): Mekke'deki otellerin hepsi satılıyor; bir kısmı anlaşmalı (katalogda, fiyatlı),
// geri kalanı MBD'nin Paximum hesabından alınıyor. Paximum fiyatları değişken ve herkese açık gösterilmez; bu oteller
// fiyatsız sayfayla ve "fiyatını sorun" (WhatsApp) düğmesiyle yayınlanır. Veri: src/content/hotels/mekke-rehber.json
// (konum OSM, içerik G18 + Claude kontrolü). Açıklaması olmayan otel canlıda yayınlanmaz (ince içerik); yerelde görünür.
import data from "@/content/hotels/mekke-rehber.json";

export type DirectoryHotel = {
  slug: string;
  name: string;
  city: "mekke" | "medine";
  district: string;
  lat: number;
  lon: number;
  kaabaMeters: number | null;
  stars: number | null;
  description: string | null;
  roomTypes: string[];
  meals: string[];
  shuttle: "var" | "yok" | null;
  walkMinutes: number | null;
  faq?: { q: string; a: string }[];
  sources: { text: string; source: string }[];
};

export const DISTRICTS: Record<string, string> = {
  ajyad: "Ajyad",
  "cebel-omer": "Cebel Ömer",
  cerval: "Cerval",
  "mescid-i-cin": "Mescid-i Cin",
  mahbes: "Mahbes",
  nuzha: "Nüzha",
  misfele: "Misfele",
};

const ALL = (data as { hotels: DirectoryHotel[] }).hotels;

/** Yayınlanabilir oteller: canlıda yalnızca açıklaması olanlar */
export function directoryHotels(): DirectoryHotel[] {
  return process.env.NODE_ENV === "production" ? ALL.filter((h) => h.description) : ALL;
}

export function findDirectoryHotel(slug: string) {
  return directoryHotels().find((h) => h.slug === slug) ?? null;
}

/** Kâbe'ye kuş uçuşu mesafe metni */
export function kaabaText(m: number | null) {
  if (m == null) return null;
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`;
}

function haversine(a: DirectoryHotel, b: DirectoryHotel) {
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(x));
}

/** Aynı rehberdeki en yakın oteller */
export function nearbyHotels(h: DirectoryHotel, n = 4) {
  return directoryHotels()
    .filter((o) => o.slug !== h.slug)
    .map((o) => ({ o, d: haversine(h, o) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.o);
}
