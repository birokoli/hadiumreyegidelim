// Hadi Umreye Gidelim ikon seti (6 Ekim): Recraft V4.1 Pro Vector ile üretildi, Claude tek renge çevirip kırptı.
// Dosyalar public/ikon/<ad>.svg; renk CSS maskesiyle yazı rengini (currentColor) alır, JS yükü yok.
import type { CSSProperties } from "react";

export const HUG_ICONS = {
  paket: "Umre paketi",
  bireysel: "Bireysel umre",
  vize: "Umre vizesi",
  otel: "Otel",
  transfer: "Transfer",
  tren: "Haremeyn treni",
  rehber: "Rehberlik",
  ilk: "İlk umrem",
  hanim: "Hanım umresi",
  kabe: "Kâbe",
  tavaf: "Tavaf",
  say: "Sa'y",
  zemzem: "Zemzem",
  medine: "Medine",
  ihram: "İhram",
  dua: "Dua",
  tesbih: "Tesbih",
  takvim: "Takvim",
  ucak: "Uçuş",
  telefon: "Telefon",
  mesaj: "Mesaj",
  eposta: "E-posta",
  konum: "Konum",
  fiyat: "Fiyat",
  guven: "Doğrulanmış",
  yorum: "Yorum",
  aile: "Aile ve grup",
  bebek: "Bebekle umre",
  ara: "Ara",
  ok: "İleri",
  onay: "Onay",
  bilgi: "Bilgi",
} as const;

export type HugIconName = keyof typeof HUG_ICONS;

export default function HugIcon({ name, size = 24, className, title, style }: { name: HugIconName; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const url = `url(/ikon/${name}.svg)`;
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{ display: "inline-block", flexShrink: 0, width: size, height: size, backgroundColor: "currentColor", WebkitMask: `${url} center / contain no-repeat`, mask: `${url} center / contain no-repeat`, ...style }}
    />
  );
}
