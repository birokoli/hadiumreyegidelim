// Otel rehberi (7 Ekim, kullanıcı): Mekke'deki otellerin hepsi satılıyor; bir kısmı anlaşmalı (katalogda, fiyatlı),
// geri kalanı MBD'nin Paximum hesabından alınıyor. Paximum fiyatları değişken ve herkese açık gösterilmez; bu oteller
// fiyatsız sayfayla ve "fiyatını sorun" (WhatsApp) düğmesiyle yayınlanır.
// Liste: src/content/hotels/paximum-mekke.json. Konum: OSM (mekke-rehber.json) ya da Google otel kaydı. Bilgi ve metin:
// src/lib/hotels/google-data.ts (Google otel verisi + yalnızca bu veriden yazılmış metin). Canlıda yalnızca hedef
// bölgelerdeki ve metni admin'de onaylanmış oteller yayınlanır; yerelde hepsi görünür.
import base from "@/content/hotels/mekke-rehber.json";
import { PAXIMUM_NAMES, TARGET_DISTRICTS, classifyDistrict, hotelGuideData, kaabaMeters, slugify } from "@/lib/hotels/google-data";

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
  checkIn?: string | null;
  checkOut?: string | null;
  faq?: { q: string; a: string }[];
  published: boolean;
};

export const DISTRICTS: Record<string, string> = {
  ajyad: "Ajyad",
  "cebel-omer": "Cebel Ömer",
  cerval: "Cerval",
  "mescid-i-cin": "Mescid-i Cin",
  mahbes: "Mahbes",
  nuzha: "Nüzha",
  misfele: "Misfele",
  aziziye: "Aziziye",
  utaybiye: "Utaybiye",
  diger: "Mekke",
};

// Katalogda (anlaşmalı, fiyatlı) sayfası olan oteller rehberde ikinci kez açılmaz
const IN_CATALOG = new Set([
  "Pullman ZamZam Makkah",
  "Fairmont Makkah Clock Royal Tower",
  "Holiday Inn Makkah Al Aziziah",
  "Mahd Al Resala 3 Hotel",
  "Al Safwah Hotel Third Tower 3",
  "Rotana Jabal Omar - Makkah",
]);

type BaseRow = { slug: string; district: string; lat: number; lon: number };
const BASE = new Map((base as { hotels: BaseRow[] }).hotels.map((h) => [h.slug, h]));

/** Rehberdeki oteller. Canlıda yalnızca yayınlananlar; `all` ile (admin, yerel) hepsi. */
export async function directoryHotels({ all = process.env.NODE_ENV !== "production" } = {}): Promise<DirectoryHotel[]> {
  const { google, content, overrides } = await hotelGuideData();
  const out: DirectoryHotel[] = [];
  for (const name of PAXIMUM_NAMES) {
    if (IN_CATALOG.has(name)) continue;
    const slug = slugify(name);
    const b = BASE.get(slug);
    const g = google[slug]?.identifier ? google[slug] : undefined;
    const lat = b?.lat ?? g?.lat;
    const lon = b?.lon ?? g?.lon;
    if (lat == null || lon == null) continue;
    const district = overrides[slug]?.district ?? b?.district ?? classifyDistrict(lat, lon, g?.neighborhood, `${name} ${g?.title ?? ""}`);
    const c = content[slug];
    const published = !!c?.approved && TARGET_DISTRICTS.has(district);
    if (!published && !all) continue;
    out.push({
      slug,
      name,
      city: "mekke",
      district,
      lat,
      lon,
      kaabaMeters: kaabaMeters(lat, lon),
      stars: g?.stars ?? null,
      description: c?.description ?? null,
      roomTypes: [],
      meals: [],
      shuttle: null,
      walkMinutes: null,
      checkIn: g?.checkIn ?? null,
      checkOut: g?.checkOut ?? null,
      faq: c?.faq ?? [],
      published,
    });
  }
  return out;
}

export async function findDirectoryHotel(slug: string) {
  return (await directoryHotels()).find((h) => h.slug === slug) ?? null;
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

/** Rehberdeki en yakın oteller */
export async function nearbyHotels(h: DirectoryHotel, n = 4) {
  return (await directoryHotels())
    .filter((o) => o.slug !== h.slug)
    .map((o) => ({ o, d: haversine(h, o) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.o);
}
