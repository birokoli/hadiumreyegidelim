// Paylaşım görselleri (19 Ekim): her sayfa kendi arka plan görselini ve başlığını /og şablonuna verir (src/app/og/route.tsx).
// Görsel listesi ve brief: docs/OG-GORSEL-LISTESI.md, docs/Paylasim-Gorselleri-Brief.docx; dosyalar public/og/<ad>.jpg.

export const OG_GORSELLER = [
  "varsayilan", "bireysel-umre", "umre-vizesi", "paketler",
  "bolge-marmara", "bolge-ege", "bolge-akdeniz", "bolge-ic-anadolu", "bolge-karadeniz", "bolge-dogu-anadolu", "bolge-guneydogu",
  "ilk-umrem", "hanim-umresi", "grup-umre", "hizmetler", "rehberlik", "blog", "sss", "yorumlar", "hakkimizda", "kuba", "hendek-turu",
  "ihram-nedir", "tavaf-nedir", "say-nedir", "mikat-nedir", "tiras-nedir", "bireysel-mi-turla-mi", "ekonomik-mi-luks-mu",
  "once-mekke-mi-medine-mi", "umre-mi-hac-mi", "aile-umresi", "yasli-umresi", "tekerlekli-sandalye", "ogrenci-umresi",
  "ekim-umresi", "kasim-umresi", "aralik-umresi", "ocak-umresi", "subat-umresi", "mart-umresi", "nisan-umresi", "ramazan-umresi", "somestr-umresi",
] as const;
export type OgGorsel = (typeof OG_GORSELLER)[number];

/** Bölge adı (il sayfası verisi) → bölge görseli */
export const BOLGE_GORSELI: Record<string, OgGorsel> = {
  Marmara: "bolge-marmara",
  Ege: "bolge-ege",
  Akdeniz: "bolge-akdeniz",
  "İç Anadolu": "bolge-ic-anadolu",
  Karadeniz: "bolge-karadeniz",
  "Doğu Anadolu": "bolge-dogu-anadolu",
  "Güneydoğu Anadolu": "bolge-guneydogu",
};

/** Rehber içerik sayfası slug'ı → görsel (src/content/pages) */
export const REHBER_GORSELI: Record<string, OgGorsel> = {
  "ihram-nedir": "ihram-nedir",
  "tavaf-nedir": "tavaf-nedir",
  "say-nedir": "say-nedir",
  "mikat-nedir": "mikat-nedir",
  "tiras-nedir": "tiras-nedir",
  "bireysel-umre-mi-turla-umre-mi": "bireysel-mi-turla-mi",
  "ekonomik-umre-mi-luks-umre-mi": "ekonomik-mi-luks-mu",
  "once-mekke-mi-medine-mi": "once-mekke-mi-medine-mi",
  "umre-mi-hac-mi": "umre-mi-hac-mi",
  "aile-umresi": "aile-umresi",
  "yasli-umresi": "yasli-umresi",
  "tekerlekli-sandalye-ile-umre": "tekerlekli-sandalye",
  "ogrenci-umresi": "ogrenci-umresi",
  "ekim-umresi": "ekim-umresi",
  "kasim-umresi": "kasim-umresi",
  "aralik-umresi": "aralik-umresi",
  "ocak-umresi": "ocak-umresi",
  "subat-umresi": "subat-umresi",
  "mart-umresi": "mart-umresi",
  "nisan-umresi": "nisan-umresi",
  "ramazan-umresi": "ramazan-umresi",
  "somestr-umresi": "somestr-umresi",
};

/** Metadata openGraph.images için tek öğe. Başlık sayfa başlığından " | Hadi Umreye Gidelim" ve uzun ek kısımlar atılarak verilir. */
export function ogGorsel(g: OgGorsel, baslik: string, kicker = "Bireysel umre") {
  const t = baslik.replace(/\s*\|\s*Hadi Umreye Gidelim\s*$/i, "").trim();
  const q = new URLSearchParams({ g, k: kicker, t });
  return { url: `/og?${q.toString()}`, width: 1200, height: 630, alt: t };
}
