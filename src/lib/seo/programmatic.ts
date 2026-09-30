// Programatik SEO kalıpları (programmatic-seo playbook'larından: Konum,
// Kişi, Zaman, Karşılaştırma, Sözlük, Profil). "covers" bir sayfanın bu
// kelimeyi karşılayıp karşılamadığını sitedeki yollara bakarak belirler.

export type Playbook = "Konum" | "Kişi" | "Zaman" | "Karşılaştırma" | "Sözlük" | "Profil";

export type Candidate = { keyword: string; covers: string[] };

export type Pattern = {
  id: string;
  playbook: Playbook;
  template: string;
  urlTemplate: string;
  data: string;
  candidates: Candidate[];
};

const MONTHS = ["ekim", "kasım", "aralık", "ocak", "şubat", "mart", "nisan"];
const BIG_CITIES = [
  ["istanbul", "İstanbul"], ["ankara", "Ankara"], ["izmir", "İzmir"], ["bursa", "Bursa"], ["konya", "Konya"],
  ["antalya", "Antalya"], ["gaziantep", "Gaziantep"], ["kayseri", "Kayseri"], ["trabzon", "Trabzon"], ["diyarbakir", "Diyarbakır"],
];

export function buildPatterns(hotels: { name: string }[], year: number): Pattern[] {
  return [
    {
      id: "city",
      playbook: "Konum",
      template: "{şehir} çıkışlı umre",
      urlTemplate: "/{şehir}-cikisli-bireysel-umre",
      data: "turkey-cities.ts: 81 il, havalimanı kodu ve adı",
      candidates: BIG_CITIES.map(([slug, name]) => ({
        keyword: `${name.toLocaleLowerCase("tr")} çıkışlı umre`,
        covers: [`/${slug}-cikisli-bireysel-umre`],
      })),
    },
    {
      id: "persona",
      playbook: "Kişi",
      template: "{kime} umre",
      urlTemplate: "/{kime}-umresi",
      data: "Paket içerikleri + rehber hizmetleri",
      candidates: [
        { keyword: "hanımlar için umre", covers: ["/hanim-umresi"] },
        { keyword: "ilk kez umreye gidecekler", covers: ["/ilk-umrem"] },
        { keyword: "bireysel umre", covers: ["/bireysel-umre"] },
        { keyword: "aile umresi", covers: ["/aile-umresi"] },
        { keyword: "yaşlılar için umre", covers: ["/yasli-umresi"] },
        { keyword: "tekerlekli sandalye ile umre", covers: ["/tekerlekli-sandalye-ile-umre"] },
        { keyword: "öğrenci umresi", covers: ["/ogrenci-umresi"] },
      ],
    },
    {
      id: "month",
      playbook: "Zaman",
      template: "{ay} umresi {yıl}",
      urlTemplate: "/{ay}-umresi",
      data: "Paket tarihleri ve fiyatları (Package tablosu)",
      candidates: [
        { keyword: `eylül umresi ${year}`, covers: ["/eylul-umresi"] },
        ...MONTHS.map((m) => ({ keyword: `${m} umresi ${m === "ocak" || m === "şubat" || m === "mart" || m === "nisan" ? year + 1 : year}`, covers: [`/${slugify(m)}-umresi`] })),
        { keyword: `ramazan umresi ${year + 1}`, covers: ["/ramazan-umresi"] },
        { keyword: "sömestr umresi", covers: ["/somestr-umresi"] },
      ],
    },
    {
      id: "compare",
      playbook: "Karşılaştırma",
      template: "{a} mı {b} mi",
      urlTemplate: "/umre-rehberi/{a}-mi-{b}-mi",
      data: "Fiyat motoru ve otel mesafeleri",
      candidates: [
        { keyword: "bireysel umre mi turla umre mi", covers: ["/umre-rehberi/bireysel-umre-mi-turla-umre-mi"] },
        { keyword: "ekonomik umre mi lüks umre mi", covers: ["/umre-rehberi/ekonomik-umre-mi-luks-umre-mi"] },
        { keyword: "umre önce mekke mi medine mi", covers: ["/umre-rehberi/once-mekke-mi-medine-mi"] },
        { keyword: "umre mi hac mı", covers: ["/umre-rehberi/umre-mi-hac-mi"] },
      ],
    },
    {
      id: "glossary",
      playbook: "Sözlük",
      template: "{terim} nedir",
      urlTemplate: "/umre-rehberi/{terim}-nedir",
      data: "Rehber içerikleri",
      candidates: ["ihram", "tavaf", "say", "mikat", "tıraş", "umre vizesi"].map((t) => ({
        keyword: `${t} nedir`,
        covers: [`/umre-rehberi/${slugify(t)}-nedir`, `/blog/${slugify(t)}-nedir`, ...(t === "umre vizesi" ? ["/umre-vizesi"] : [])],
      })),
    },
    {
      id: "hotel",
      playbook: "Profil",
      template: "{otel} kabe'ye uzaklık",
      urlTemplate: "/oteller/{otel}",
      data: `Hotel tablosu: ${hotels.length} aktif otel, metre cinsinden Kabe mesafesi (kendi verimiz)`,
      candidates: hotels.slice(0, 8).map((h) => ({
        keyword: `${h.name.toLocaleLowerCase("tr")} kabe'ye uzaklık`,
        covers: [`/oteller/${slugify(h.name)}`],
      })),
    },
  ];
}

export function slugify(s: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return s
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Kelime 5'lileri üzerinden Jaccard benzerliği (0–1). */
export function shingleSimilarity(a: string, b: string, n = 5) {
  const shingles = (t: string) => {
    const w = t.toLocaleLowerCase("tr").split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(" "));
    return set;
  };
  const sa = shingles(a);
  const sb = shingles(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const s of sa) if (sb.has(s)) inter++;
  return inter / (sa.size + sb.size - inter);
}
