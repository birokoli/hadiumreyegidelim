export const SITE_URL = "https://hadiumreyegidelim.com";
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
