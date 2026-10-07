// Otel rehberi verisi (7 Ekim, kullanıcı onayıyla DataForSEO harcaması): G18'de Antigravity'nin yazdığı otel metinleri
// kalıp ve kaynaksız çıktı (reddedildi). Bilgi artık Google'ın otel kaydından gelir (DataForSEO Google Hotels):
// yıldız, konum, mahalle, olanaklar, otelin kendi tanıtımı. Metni Claude yalnızca bu veriden yazar; kullanıcı onaylamadan
// sayfa yayınlanmaz. Kayıtlar Setting tablosunda: "HOTEL_G:<slug>" (Google verisi), "HOTEL_C:<slug>" (metin + onay).
// Bu anahtarlar site ayarları önbelleğine girmez (site-settings.ts PRIVATE_PREFIXES).
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dfsPost } from "@/lib/seo/dataforseo";
import { callClaude, extractJson } from "@/lib/geo-blog/claude";
import paximum from "@/content/hotels/paximum-mekke.json";

export const HOTEL_GUIDE_TAG = "hotel-guide";
const KAABA = { lat: 21.4225, lon: 39.8262 };
const SA = 2682; // DataForSEO location_code: Saudi Arabia

export type GoogleHotel = {
  identifier: string;
  title: string;
  stars: number | null;
  lat: number | null;
  lon: number | null;
  address: string | null;
  neighborhood: string | null;
  neighborhoodText: string | null;
  about: string | null;
  checkIn: string | null;
  checkOut: string | null;
  amenities: string[];
  website: string | null;
  rating: number | null;
  votes: number | null;
  mentions: string[];
  fetchedAt: string;
  matchScore: number;
};

export type HotelContent = { description: string; faq: { q: string; a: string }[]; note: string | null; approved: boolean; writtenAt: string };

export const slugify = (n: string) =>
  n.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const PAXIMUM_NAMES: string[] = (paximum as { names: string[] }).names;

export function kaabaMeters(lat: number, lon: number) {
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(lat - KAABA.lat);
  const dLon = r(lon - KAABA.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(KAABA.lat)) * Math.cos(r(lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371000 * Math.asin(Math.sqrt(x)));
}

// Mahalle merkezleri (OSM Nominatim, 7 Ekim); Google mahalle adı eşleşmezse en yakın merkez
const CENTROIDS: { key: string; lat: number; lon: number; re: RegExp }[] = [
  { key: "ajyad", lat: 21.4179, lon: 39.8292, re: /ajyad|ecyad|أجياد/i },
  { key: "cebel-omer", lat: 21.4197, lon: 39.8217, re: /jabal omar|jarham|جبل عمر/i },
  { key: "cerval", lat: 21.4278, lon: 39.8142, re: /jarwal|جرول/i },
  { key: "mescid-i-cin", lat: 21.4335, lon: 39.829, re: /jinn mosque|masjid al.?jinn|sulaymaniyah|al hujun|al ma.?abda/i },
  { key: "mahbes", lat: 21.423, lon: 39.8471, re: /mahbas|rawabi/i },
  { key: "misfele", lat: 21.405, lon: 39.8223, re: /misfalah|المسفلة/i },
  { key: "nuzha", lat: 21.4363, lon: 39.7957, re: /nuzha|nozha|النزهة/i },
  { key: "aziziye", lat: 21.4, lon: 39.8626, re: /aziziy|العزيزية/i },
];
export const TARGET_DISTRICTS = new Set(["ajyad", "cebel-omer", "cerval", "mescid-i-cin", "mahbes", "nuzha", "misfele"]);

export function classifyDistrict(lat: number, lon: number, neighborhood?: string | null) {
  if (neighborhood) for (const c of CENTROIDS) if (c.re.test(neighborhood)) return c.key;
  if (kaabaMeters(lat, lon) > 6000) return "diger";
  let best = CENTROIDS[0];
  let bestD = Infinity;
  for (const c of CENTROIDS) {
    const d = Math.hypot((lat - c.lat) * 111, (lon - c.lon) * 103.5);
    if (d < bestD) [best, bestD] = [c, d];
  }
  return best.key;
}

// ── Okuma ─────────────────────────────────────────────────────────────
async function readAll() {
  const rows = await prisma.setting.findMany({ where: { OR: [{ key: { startsWith: "HOTEL_G:" } }, { key: { startsWith: "HOTEL_C:" } }] } });
  const google: Record<string, GoogleHotel> = {};
  const content: Record<string, HotelContent> = {};
  for (const r of rows) {
    try {
      if (r.key.startsWith("HOTEL_G:")) google[r.key.slice(8)] = JSON.parse(r.value);
      else content[r.key.slice(8)] = JSON.parse(r.value);
    } catch {
      /* bozuk kayıt atlanır */
    }
  }
  return { google, content };
}
const readCached = unstable_cache(readAll, ["hotel-guide-v1"], { tags: [HOTEL_GUIDE_TAG], revalidate: 3600 });

export async function hotelGuideData(fresh = false) {
  try {
    return fresh ? await readAll() : await readCached();
  } catch {
    return { google: {}, content: {} } as Awaited<ReturnType<typeof readAll>>;
  }
}

async function save(key: string, value: unknown) {
  const v = JSON.stringify(value);
  await prisma.setting.upsert({ where: { key }, update: { value: v }, create: { key, value: v } });
}

// ── Google verisi ─────────────────────────────────────────────────────
const STOP = new Set(["hotel", "hotels", "makkah", "mecca", "by", "the", "al", "and", "suites", "residence", "residences", "&", "-"]);
const tokens = (s: string) => new Set(s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)));
function similarity(a: string, b: string) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(A.size, B.size);
}

type SearchItem = { hotel_identifier?: string; title?: string; stars?: number; location?: { latitude?: number; longitude?: number } };
type InfoItem = {
  title?: string;
  stars?: number;
  address?: string;
  about?: {
    description?: string;
    check_in_time?: { hour?: number; minute?: number } | null;
    check_out_time?: { hour?: number; minute?: number } | null;
    url?: string | null;
    amenities?: { items?: { amenity_label?: string; amenity?: string; is_available?: boolean }[] }[] | null;
  } | null;
  location?: { latitude?: number; longitude?: number; neighborhood?: string | null; neighborhood_description?: string | null } | null;
  reviews?: { value?: number; votes_count?: number; mentions?: { title?: string }[] | null } | null;
};
const hhmm = (t?: { hour?: number; minute?: number } | null) => (t?.hour == null ? null : `${String(t.hour).padStart(2, "0")}:${String(t.minute ?? 0).padStart(2, "0")}`);

/** Bir otelin Google kaydını bulur ve ayrıntısını çeker. Eşleşme zayıfsa kaydetmez. */
export async function fetchGoogleHotel(name: string): Promise<{ slug: string; ok: boolean; reason?: string; cost: number }> {
  const slug = slugify(name);
  let cost = 0;
  const s = await dfsPost<{ items?: SearchItem[] }>("/v3/business_data/google/hotel_searches/live", [
    { keyword: `${name} Mecca`, location_code: SA, language_code: "en", currency: "USD" },
  ]);
  cost += s.cost;
  const candidates = (s.result?.items ?? [])
    .filter((i) => i.hotel_identifier && i.title)
    .map((i) => ({ i, score: similarity(name, i.title!), d: i.location?.latitude ? kaabaMeters(i.location.latitude, i.location.longitude!) : null }))
    .filter((c) => c.d == null || c.d < 12000)
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 0.5) return { slug, ok: false, reason: `Google'da eşleşen otel bulunamadı${best ? ` (en yakın: ${best.i.title})` : ""}`, cost };

  let info: InfoItem | null = null;
  for (const language_code of ["tr", "en"]) {
    try {
      const r = await dfsPost<InfoItem & { items?: InfoItem[] }>("/v3/business_data/google/hotel_info/live/advanced", [
        { hotel_identifier: best.i.hotel_identifier, location_code: SA, language_code, currency: "USD" },
      ]);
      cost += r.cost;
      info = r.result?.items?.[0] ?? r.result ?? null;
      if (info?.title) break;
    } catch {
      /* dil desteklenmiyorsa İngilizce dene */
    }
  }
  const lat = info?.location?.latitude ?? best.i.location?.latitude ?? null;
  const lon = info?.location?.longitude ?? best.i.location?.longitude ?? null;
  const amenities = (info?.about?.amenities ?? []).flatMap((g) => g.items ?? []).filter((a) => a.is_available !== false).map((a) => a.amenity_label || a.amenity || "").filter(Boolean);
  const g: GoogleHotel = {
    identifier: best.i.hotel_identifier!,
    title: info?.title ?? best.i.title!,
    stars: info?.stars ?? best.i.stars ?? null,
    lat,
    lon,
    address: info?.address ?? null,
    neighborhood: info?.location?.neighborhood ?? null,
    neighborhoodText: info?.location?.neighborhood_description ?? null,
    about: info?.about?.description ?? null,
    checkIn: hhmm(info?.about?.check_in_time),
    checkOut: hhmm(info?.about?.check_out_time),
    amenities: [...new Set(amenities)].slice(0, 40),
    website: info?.about?.url ?? null,
    rating: info?.reviews?.value ?? null,
    votes: info?.reviews?.votes_count ?? null,
    mentions: (info?.reviews?.mentions ?? []).map((m) => m.title ?? "").filter(Boolean).slice(0, 10),
    fetchedAt: new Date().toISOString(),
    matchScore: Math.round(best.score * 100) / 100,
  };
  await save(`HOTEL_G:${slug}`, g);
  return { slug, ok: true, cost };
}

/** Henüz Google verisi olmayan otellerden en fazla `limit` tanesini çeker */
export async function fetchGoogleBatch(limit = 8) {
  const { google } = await hotelGuideData(true);
  const todo = PAXIMUM_NAMES.filter((n) => !google[slugify(n)]).slice(0, limit);
  const results: { slug: string; ok: boolean; reason?: string }[] = [];
  let cost = 0;
  for (const n of todo) {
    try {
      const r = await fetchGoogleHotel(n);
      cost += r.cost;
      results.push({ slug: r.slug, ok: r.ok, reason: r.reason });
      if (!r.ok) await save(`HOTEL_G:${r.slug}`, { identifier: "", title: "", failed: r.reason, fetchedAt: new Date().toISOString() });
    } catch (e) {
      results.push({ slug: slugify(n), ok: false, reason: e instanceof Error ? e.message : String(e) });
    }
  }
  revalidateTag(HOTEL_GUIDE_TAG, { expire: 0 });
  return { results, cost: Math.round(cost * 10000) / 10000, remaining: PAXIMUM_NAMES.filter((n) => !google[slugify(n)]).length - todo.length };
}

// ── Metin ─────────────────────────────────────────────────────────────
const SYSTEM = `Hadi Umreye Gidelim (bireysel umre organizasyonu) sitesindeki otel sayfası için Türkçe metin yazıyorsun. YALNIZCA sana verilen Google otel verisini kullan. Veride olmayan hiçbir bilgiyi yazma: oda tipi, yemek, servis, yürüme süresi, manzara, olanak veride yoksa hiç anma. Fiyat, puan ve yorum sayısı yazma (değişiyor).

description (110–170 kelime):
- İlk cümle tek başına alıntılanabilir tanım: "[Otel adı], Mekke'nin [bölge] bölgesinde, Kâbe'ye kuş uçuşu yaklaşık [mesafe] uzaklıkta[, N yıldızlı] bir oteldir." Yürüme süresi yazma (veride yok).
- Otel adı metinde en az 2 kez geçsin; bir kez Türkçe arama biçimiyle de an: "[Ad] (… Otel Mekke)".
- Sonra veride olan somut bilgiler: otelin kendi tanıtımından öne çıkanlar, giriş-çıkış saatleri, umreciler için işe yarar olanaklar (ör. restoran, Wi-Fi, aile odası, engelli erişimi), mahalle bilgisi.
- Sade, somut, kurumsal. Yasak: lüks, VIP, eşsiz, garanti, 7/24, kesintisiz, "Harem'e sıfır", "en iyi", "ideal", "konforlu", "huzurlu", "unutulmaz", satış dili, ünlem.

faq (3–5 soru-cevap), sadece verinin cevaplayabildiği sorular. Örnek: "[Otel] Kâbe'ye ne kadar uzak?", "[Otel] hangi bölgede?", "[Otel]'de giriş saati kaç?", "[Otel]'de restoran var mı?", "[Otel] kaç yıldızlı?". Cevabın ilk cümlesi doğrudan (sayı / evet-hayır), en fazla 2 cümle.

note: veride çelişki ya da eksik varsa (ör. yıldız yok, tanıtım İngilizce/boş, otel adı Paximum adından farklı) kısa not; yoksa null.

Yalnızca JSON döndür: {"description":"...","faq":[{"q":"...","a":"..."}],"note":null}`;

export async function writeHotelContent(slug: string, district: string, displayName: string) {
  const { google } = await hotelGuideData(true);
  const g = google[slug];
  if (!g?.identifier) throw new Error("Bu otelin Google verisi yok.");
  const dist = g.lat != null && g.lon != null ? kaabaMeters(g.lat, g.lon) : null;
  const facts = {
    otelAdi: displayName,
    googleAdi: g.title,
    bolge: district,
    kabeyeKusUcusu: dist == null ? null : dist < 1000 ? `${Math.round(dist / 10) * 10} metre` : `${(dist / 1000).toFixed(1).replace(".", ",")} km`,
    yildiz: g.stars,
    adres: g.address,
    mahalle: g.neighborhood,
    mahalleAciklamasi: g.neighborhoodText,
    otelTanitimi: g.about,
    girisSaati: g.checkIn,
    cikisSaati: g.checkOut,
    olanaklar: g.amenities,
    misafirlerinOneCikardiklari: g.mentions,
  };
  const { text } = await callClaude({ feature: "other", effort: "medium", maxTokens: 4000, system: SYSTEM, prompt: JSON.stringify(facts, null, 1) });
  const j = extractJson<{ description?: string; faq?: { q: string; a: string }[]; note?: string | null }>(text);
  if (!j?.description) throw new Error("Metin üretilemedi.");
  const c: HotelContent = { description: j.description.trim(), faq: (j.faq ?? []).filter((f) => f?.q && f?.a).slice(0, 5), note: j.note ?? null, approved: false, writtenAt: new Date().toISOString() };
  await save(`HOTEL_C:${slug}`, c);
  revalidateTag(HOTEL_GUIDE_TAG, { expire: 0 });
  return c;
}

export async function setApproved(slug: string, approved: boolean, edits?: { description?: string }) {
  const { content } = await hotelGuideData(true);
  const c = content[slug];
  if (!c) throw new Error("Önce metin yazılmalı.");
  await save(`HOTEL_C:${slug}`, { ...c, ...(edits?.description ? { description: edits.description.trim() } : {}), approved });
  revalidateTag(HOTEL_GUIDE_TAG, { expire: 0 });
}
