// Canlıda sunulan adres www'li (Vercel'de www korunuyor; www'siz adres www'ye yönleniyor).
// Canonical, sitemap, robots ve şemalar bu adresi gösterir: gösterilen adres doğrudan 200 dönmeli.
export const SITE_URL = "https://www.hadiumreyegidelim.com";
export const SITE_DOMAIN = "hadiumreyegidelim.com";

// DataForSEO: Türkiye (2792) + Türkçe
export const DFS_LOCATION_CODE = 2792;
export const DFS_LANGUAGE_CODE = "tr";

export function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}
