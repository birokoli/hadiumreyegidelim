import type { Ton } from "./temel";
/** Satış aşaması → rozet rengi */
export const asamaTonu = (k: string): Ton =>
  k === "iptal" ? "gri" : k === "talep" ? "turuncu" : k === "teklif" ? "mavi" : k === "onaylandi" ? "kum" : k === "tamamlandi" ? "gri" : "yesil";
