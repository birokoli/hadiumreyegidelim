// Blog konu kümeleri ve satış sayfalarına ayrılmış baş aramalar (docs/BLOG-MOTORU.md, 3 Ekim 2026).
// Küme sözlüğü ve tohum konular genişletilebilir; kümesi bulunamayan aday yazılmaz.

export type Cluster = { id: string; label: string; match: RegExp; seeds: string[] };

export const CLUSTERS: Cluster[] = [
  { id: "vize", label: "Vize", match: /vize|e-vize|pasaport|giriş şart|biyometri/i, seeds: ["umre vizesi için pasaport kaç ay geçerli olmalı", "umre vizesi reddedilirse ne yapılır", "çocuklar için umre vizesi hangi belgelerle alınır"] },
  { id: "fiyat", label: "Fiyat ve bütçe", match: /fiyat|ücret|maliyet|bütçe|kaç tl|kaç dolar|para|harcama|ekonomik/i, seeds: ["umrede günlük harcama ne kadar olur", "mekke ve medinede döviz mi kart mı kullanmalı", "umre bütçesi nasıl planlanır"] },
  { id: "konaklama", label: "Konaklama", match: /otel|konaklama|oda|harem'e yakın|kabeye yakın|kâbe'ye yakın|yürüme mesafe/i, seeds: ["mekkede otel seçerken hangi kapıya yakınlık önemli", "medinede otel konumu nasıl seçilir", "umrede otel giriş çıkış saatleri"] },
  { id: "ulasim", label: "Ulaşım", match: /tren|haremeyn|transfer|araç|havalimanı|cidde|ulaşım|otobüs|taksi/i, seeds: ["haremeyn treni ekonomi ile business farkı", "cidde havalimanından mekkeye nasıl gidilir", "medine havalimanından otele ulaşım"] },
  { id: "ibadet", label: "İbadet rehberi", match: /ihram|tavaf|sa'y|say |mikat|tıraş|niyet|telbiye|dua|namaz|ibadet|umre nasıl yapılır|farz|vacip|sünnet/i, seeds: ["ihram yasakları nelerdir", "tavaf sırasında okunacak dualar", "umrede kadınlar için ihram kuralları"] },
  { id: "ziyaret", label: "Mekke ve Medine ziyaret", match: /ziyaret|uhud|kuba|kıbleteyn|cennetül baki|ravza|müze|cebel|hira|sevr|arafat|mina|taif|gezilecek/i, seeds: ["ravza ziyareti randevusu nasıl alınır", "medinede ziyaret edilecek tarihi mescitler", "taif gezisi ne kadar sürer"] },
  { id: "ozel", label: "Özel durumlar", match: /bebek|çocuk|yaşlı|engelli|tekerlekli|hamile|kadın|hanım|aile|grup değil/i, seeds: ["yaşlı anne babayla umreye gitmek", "tekerlekli sandalyeyle tavaf nasıl yapılır", "çocuklarla umrede nelere dikkat edilmeli"] },
  { id: "donem", label: "Dönem", match: /ramazan|sömestr|yaz|kış|ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık|hac sonrası|kalabalık|sezon/i, seeds: ["ramazanda umre yapmanın zorlukları", "umre için en sakin aylar hangileri", "sömestr tatilinde umre planlama"] },
  { id: "hazirlik", label: "Hazırlık ve sağlık", match: /hazırlık|eşya|bavul|valiz|sağlık|aşı|ilaç|sıcak|ayakkabı|kıyafet|telefon|internet|sim kart|nusuk/i, seeds: ["umre çantasında neler olmalı", "umre öncesi gerekli aşılar", "suudi arabistanda hangi sim kart kullanılır"] },
];

/** Satış sayfalarına ait baş aramalar: blog bu aramaları hedeflemez */
export const RESERVED_HEADS: { terms: string[]; page: string }[] = [
  { terms: ["umre"], page: "/" },
  { terms: ["bireysel", "umre"], page: "/bireysel-umre" },
  { terms: ["umre", "vizesi"], page: "/umre-vizesi" },
  { terms: ["umre", "fiyatları"], page: "/bireysel-umre" },
  { terms: ["mekke", "otelleri"], page: "/hizmetler" },
  { terms: ["kabeye", "yakın", "oteller"], page: "/hizmetler" },
  { terms: ["umre", "turları"], page: "/paketler" },
];

const FILLER = new Set(["2025", "2026", "2027", "ve", "ile", "için", "en", "iyi", "uygun", "fiyat", "fiyatı", "fiyatları", "ucuz", "nedir", "nasıl", "yapılır", "alınır", "türkiye", "türkiyeden", "istanbul"]);

const norm = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);

export function clusterOf(topic: string): Cluster | null {
  return CLUSTERS.find((c) => c.match.test(topic)) ?? null;
}

/** Konu bir baş aramanın kendisi mi (dolgu kelimeler çıkınca yalnızca o terimler kalıyor mu)? */
export function reservedHead(topic: string): string | null {
  const w = norm(topic).filter((x) => !FILLER.has(x));
  if (!w.length) return null;
  for (const r of RESERVED_HEADS) {
    if (w.every((x) => r.terms.includes(x))) return r.page;
  }
  return null;
}
