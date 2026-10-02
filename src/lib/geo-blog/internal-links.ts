// Blog içeriklerindeki eski / kırık iç bağlantıları düzeltme kuralı.
type LinkMapping = {
  from: string[];
  to: string | null;
};

const MAPPINGS: LinkMapping[] = [
  {
    from: [
      "/blog/mescid-i-haram-ziyareti",
      "https://hadiumreyegidelim.com/blog/mescid-i-haram-ziyareti",
      "https://www.hadiumreyegidelim.com/blog/mescid-i-haram-ziyareti",
    ],
    to: "/blog/mescidi-haram-ziyaret-rehberi",
  },
  {
    from: [
      "/blog/nusuk-uygulamasi-kullanimi",
      "https://hadiumreyegidelim.com/blog/nusuk-uygulamasi-kullanimi",
      "https://www.hadiumreyegidelim.com/blog/nusuk-uygulamasi-kullanimi",
    ],
    to: "/blog/nusuk-uygulamasi-nasil-kullanilir",
  },
  {
    from: [
      "/otel-rezervasyonu",
      "https://hadiumreyegidelim.com/otel-rezervasyonu",
      "https://www.hadiumreyegidelim.com/otel-rezervasyonu",
    ],
    to: "/bireysel-umre",
  },
  {
    from: [
      "/tren-bileti-al",
      "https://hadiumreyegidelim.com/tren-bileti-al",
      "https://www.hadiumreyegidelim.com/tren-bileti-al",
    ],
    to: "/bireysel-umre",
  },
  {
    from: [
      "/blog/medine-gezilecek-yerler",
      "https://hadiumreyegidelim.com/blog/medine-gezilecek-yerler",
      "https://www.hadiumreyegidelim.com/blog/medine-gezilecek-yerler",
    ],
    to: null,
  },
  {
    from: [
      "/blog/mekke-hediyelik-esya-rehberi",
      "https://hadiumreyegidelim.com/blog/mekke-hediyelik-esya-rehberi",
      "https://www.hadiumreyegidelim.com/blog/mekke-hediyelik-esya-rehberi",
    ],
    to: null,
  },
];

export function fixInternalLinks(html: string): string {
  if (!html) return html;
  let result = html;

  for (const m of MAPPINGS) {
    for (const source of m.from) {
      if (m.to !== null) {
        const regex = new RegExp(`href=["']${source.replace(/[/.]/g, "\\$&")}["']`, "gi");
        result = result.replace(regex, `href="${m.to}"`);
      } else {
        const regex = new RegExp(`<a[^>]*href=["']${source.replace(/[/.]/g, "\\$&")}["'][^>]*>(.*?)<\\/a>`, "gis");
        result = result.replace(regex, "$1");
      }
    }
  }

  return result;
}
