// Marka kiti (sosyal/marka-kiti/02-renk): lacivert ana renk, kum ve altın vurgu, açık mavi zemin. Yazı tipi Cairo.
export const R = {
  lacivert: "#203C76",
  gece: "#12295A",
  kraliyet: "#1D428A",
  kum: "#F2DDA6",
  altin: "#B8902A",
  zemin: "#EDF1FE",
  kart: "#FFFFFF",
  yazi: "#12295A",
  metin: "#5B6B86",
  soluk: "#8C99B2",
  cizgi: "#DCE3F2",
  yesil: "#1F8A5B",
  yesilZemin: "#E3F4EC",
  kirmizi: "#C2413A",
  kirmiziZemin: "#FBE9E7",
  turuncu: "#C77A12",
  turuncuZemin: "#FDF1DE",
  maviZemin: "#E4EBFB",
  whatsapp: "#1F9E55",
} as const;

export const Y = {
  normal: "Cairo_400Regular",
  orta: "Cairo_500Medium",
  yari: "Cairo_600SemiBold",
  kalin: "Cairo_700Bold",
  ekstra: "Cairo_800ExtraBold",
} as const;

export const BOSLUK = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;
export const KOSE = { s: 10, m: 14, l: 20, hap: 999 } as const;

/** Tablet: kısa kenar 600 dp ve üstü */
export const TABLET_ESIK = 600;
