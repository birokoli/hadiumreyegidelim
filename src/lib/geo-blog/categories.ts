// Blog kategorileri (6 Ekim, kullanıcı): vize, bireysel umre, ibadet (ihram/tavaf/sa'y), siyer vb.
// Blog motorunun konu kümeleri (clusters.ts) bu kategorilere bağlanır; yeni taslak kendi kategorisine düşer.
export type BlogCategoryDef = { slug: string; name: string; description: string; clusters: string[] };

export const BLOG_CATEGORIES: BlogCategoryDef[] = [
  { slug: "umre-vizesi", name: "Umre Vizesi ve Nusuk", description: "Umre vizesi nasıl alınır, ücreti ne kadar, Nusuk uygulaması ve Ravza randevusu.", clusters: ["vize"] },
  { slug: "bireysel-umre", name: "Bireysel Umre", description: "Tursuz, kendi programınızla umre: gün gün programlar, planlama ve hazırlık.", clusters: ["donem", "hazirlik"] },
  { slug: "umre-fiyatlari", name: "Umre Fiyatları ve Turlar", description: "2026 umre fiyatları, tur ve bireysel umre karşılaştırmaları, bütçe planlama.", clusters: ["fiyat"] },
  { slug: "ibadet-rehberi", name: "İhram, Tavaf ve Sa'y", description: "Umre ibadeti adım adım: ihram, tavaf, sa'y, traş ve ihram yasakları.", clusters: ["ibadet"] },
  { slug: "mekke-medine", name: "Mekke ve Medine", description: "Mescid-i Haram, Mescid-i Nebevi, ziyaret yerleri, müzeler ve alışveriş.", clusters: ["ziyaret"] },
  { slug: "siyer", name: "Siyer ve Tarih", description: "Peygamberimizin hayatı, sahabeler ve Mekke–Medine'deki tarihi mekânlar.", clusters: [] },
  { slug: "otel-ve-ulasim", name: "Otel ve Ulaşım", description: "Mekke ve Medine otelleri, transferler ve Haremeyn hızlı treni.", clusters: ["konaklama", "ulasim"] },
  { slug: "aile-ve-ozel-durumlar", name: "Aile, Bebek ve Özel Durumlar", description: "Bebekle, çocukla, yaşlı ve engelli yakınla umre; özel durumlar.", clusters: ["ozel"] },
];

/** Konu kümesi → kategori slug'ı */
export function categoryForCluster(clusterId: string | null | undefined): string | null {
  if (!clusterId) return null;
  return BLOG_CATEGORIES.find((c) => c.clusters.includes(clusterId))?.slug ?? null;
}

/** Yayındaki yazıların kategorisi (6 Ekim incelemesi; 26 yazı) */
export const POST_CATEGORY: Record<string, string> = {
  "bireysel-umre-vizesi-nasil-alinir": "umre-vizesi",
  "umre-vizesi-ne-kadar-ucret": "umre-vizesi",
  "umre-vizesi-2026-ucreti-kac-tl": "umre-vizesi",
  "2026-bireysel-umre-rehberi-nusuk-vize-surecleri": "umre-vizesi",
  "nusuk-uygulamasi-nasil-kullanilir": "umre-vizesi",
  "14-gunluk-bireysel-umre-2026": "bireysel-umre",
  "10-gunluk-bireysel-umre-programi": "bireysel-umre",
  "7-gunluk-bireysel-umre-programi-2026": "bireysel-umre",
  "bireysel-umre-vize-maliyet-rehberi": "bireysel-umre",
  "2026-hac-sonrasi-bireysel-umre": "bireysel-umre",
  "2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari": "umre-fiyatlari",
  "umre-turlari-2026-hadi-umreye-gidelim": "umre-fiyatlari",
  "ekonomik-umre-hangi-firma-2026": "umre-fiyatlari",
  "umre-turlari-2026": "umre-fiyatlari",
  "2026-umre-fiyatlari-rehberi": "umre-fiyatlari",
  "ihram-yasaklari-nelerdir": "ibadet-rehberi",
  "mescidi-haram-ziyaret-rehberi": "mekke-medine",
  "mekke-muzeleri-ve-kulturel-ziyaret-yerleri": "mekke-medine",
  "zamzam-tower-alisveris-rehberi-tarihi-ve-mekanlar": "mekke-medine",
  "umre-sirasinda-iphone-18-pro-ve-duo-almak": "mekke-medine",
  "uhud-dagi-sehitler-ziyareti": "siyer",
  "mekke-otel-secimi-ve-konum-rehberi": "otel-ve-ulasim",
  "kabeye-yakin-otel-firma-secimi": "otel-ve-ulasim",
  "haremeyn-hizli-tren-rehberi": "otel-ve-ulasim",
  "bebekle-umre-kolay-mi-2026-kurallar-ve-ipuclari": "aile-ve-ozel-durumlar",
  "bebekle-umre-rehberi": "aile-ve-ozel-durumlar",
};

/** Slug'ı listede olmayan yazı için başlıktan tahmin (taslaklar, yeni yazılar) */
export function guessCategory(title: string): string | null {
  const t = title.toLocaleLowerCase("tr-TR");
  if (/vize|nusuk|ravza randevu/.test(t)) return "umre-vizesi";
  if (/ihram|tavaf|sa'y|say |traş|tıraş|telbiye|mikat/.test(t)) return "ibadet-rehberi";
  if (/siyer|peygamber|sahabe|hz\.|uhud|bedir|hendek|hicret/.test(t)) return "siyer";
  if (/bebek|çocuk|yaşlı|engelli|hamile|hanım|kadın/.test(t)) return "aile-ve-ozel-durumlar";
  if (/otel|tren|transfer|ulaşım|havaliman/.test(t)) return "otel-ve-ulasim";
  if (/fiyat|tur|ücret|maliyet|bütçe|firma|ekonomik/.test(t)) return "umre-fiyatlari";
  if (/mescid|kabe|kâbe|medine|mekke|müze|ziyaret|zemzem|alışveriş/.test(t)) return "mekke-medine";
  if (/bireysel|günlük|program/.test(t)) return "bireysel-umre";
  return null;
}
