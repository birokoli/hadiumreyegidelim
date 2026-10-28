// Marketing paneli ikonları (27 Ekim): setimizde karşılığı olanlar marka ikon setinden (HugIcon, public/ikon);
// arayüz ikonları (paylaş, kopyala, cüzdan…) Apple SF Symbols çizgisinde kendi çizimimiz: 24'lük ızgara, 1,7 çizgi,
// yuvarlak uç ve köşe. SF Symbols'ün kendisi yalnızca Apple platformlarındaki uygulamalarda kullanılabildiği için web'de yok.
import HugIcon, { HUG_ICONS, type HugIconName } from "@/components/icons/HugIcon";

const S = (d: string | string[]) => (Array.isArray(d) ? d : [d]);

const CIZIM: Record<string, string[]> = {
  kampanya: S(["M4 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l5.2 3.6a.8.8 0 0 0 1.3-.7V6.1a.8.8 0 0 0-1.3-.7L7 9H5.5A1.5 1.5 0 0 0 4 10.5Z", "M17 9.2a4 4 0 0 1 0 5.6", "M19.3 7a7 7 0 0 1 0 10"]),
  icerik: S(["M7 7.5V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1.5", "M4 10a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z", "m4.5 17 3.6-3.6a1.2 1.2 0 0 1 1.7 0L13 16.5", "M12.5 11.5h.01"]),
  cuzdan: S(["M4 7.5A2.5 2.5 0 0 1 6.5 5H17a1 1 0 0 1 1 1v2", "M4 7.5v9A2.5 2.5 0 0 0 6.5 19H19a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5Z", "M16.5 13.5h.01"]),
  palet: S(["M12 4a8 8 0 0 0 0 16c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6h1.7A3.9 3.9 0 0 0 20 10.8C20 7 16.4 4 12 4Z", "M8 11h.01", "M10.5 7.8h.01", "M14.5 7.8h.01"]),
  link: S(["M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.8.8", "M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.8-.8"]),
  davet: S(["M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M3.5 19.5c.7-3 3.1-5 6-5s5.3 2 6 5", "M18.5 8v6", "M15.5 11h6"]),
  disari: S(["M13.5 4.5H19.5V10.5", "M19.5 4.5 11 13", "M17 14v3.5A2.5 2.5 0 0 1 14.5 20h-8A2.5 2.5 0 0 1 4 17.5v-8A2.5 2.5 0 0 1 6.5 7H10"]),
  menu: S(["M4.5 7h15", "M4.5 12h15", "M4.5 17h15"]),
  cikis: S(["M14 4.5H7.5A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5H14", "M10 12h10", "m16.5 8.5 3.5 3.5-3.5 3.5"]),
  kopyala: S(["M9 9.5A2.5 2.5 0 0 1 11.5 7h6A2.5 2.5 0 0 1 20 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 9 17.5Z", "M15 7V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v8A2.5 2.5 0 0 0 6.5 17H9"]),
  paylas: S(["M12 14.5V3.5", "m8 7.5 4-4 4 4", "M8.5 10.5H7A2.5 2.5 0 0 0 4.5 13v5A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-5a2.5 2.5 0 0 0-2.5-2.5h-1.5"]),
  tik: S(["m5 12.5 4.5 4.5L19 7.5"]),
  saat: S(["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M12 8v4.5l3 2"]),
  belge: S(["M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5Z", "M14 3.5v5h5", "M9 13h6", "M9 16.5h4"]),
  tikla: S(["m6 5 12.5 5.2-5.3 1.9-1.9 5.3Z", "m13.2 12.1 4.8 4.8"]),
  arti: S(["M12 5v14", "M5 12h14"]),
  film: S(["M4 7a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17Z", "m10.5 9.5 4 2.5-4 2.5Z"]),
  kamera: S(["M4 9a2 2 0 0 1 2-2h1.6a1 1 0 0 0 .9-.6l.6-1.3a1 1 0 0 1 .9-.6h4a1 1 0 0 1 .9.6l.6 1.3a1 1 0 0 0 .9.6H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z", "M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]),
  story: S(["M8 4.5h8A2.5 2.5 0 0 1 18.5 7v10a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 17V7A2.5 2.5 0 0 1 8 4.5Z", "M9 7.5h6"]),
  yukleniyor: S(["M12 4a8 8 0 1 0 8 8"]),
  yapayzeka: S(["M10 4.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z", "M17.5 14c.3 1.5 1 2.2 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.3 2.2-1 2.5-2.5Z", "M17.5 3.5c.2 1 .6 1.4 1.5 1.5-.9.2-1.3.6-1.5 1.5-.2-.9-.6-1.3-1.5-1.5.9-.1 1.3-.5 1.5-1.5Z"]),
  kalem: S(["M15.5 5.5a2.1 2.1 0 0 1 3 3L9 18l-4 1 1-4Z", "m14 7 3 3"]),
  geri: S(["M14.5 6 8.5 12l6 6"]),
  ileri: S(["m9.5 6 6 6-6 6"]),
  "tik-daire": S(["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m8.5 12.3 2.3 2.3 4.7-4.7"]),
  yasak: S(["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m6.4 6.4 11.2 11.2"]),
  indir: S(["M12 4v11", "m7.5 10.5 4.5 4.5 4.5-4.5", "M5 19.5h14"]),
  video: S(["M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z", "m10.5 9.5 4 2.5-4 2.5Z"]),
  muzik: S(["M9.5 17.5V6l9-1.5V16", "M7.5 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M16.5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"]),
  dunya: S(["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M4 12h16", "M12 4c2.2 2.2 3.3 4.9 3.3 8s-1.1 5.8-3.3 8c-2.2-2.2-3.3-4.9-3.3-8S9.8 6.2 12 4Z"]),
  etiket: S(["M9 4.5 7.5 19.5", "M16.5 4.5 15 19.5", "M5 9h14", "M4.5 15h14"]),
  gonder: S(["M20 4 10.5 13.5", "M20 4l-6 16-3.5-6.5L4 10Z"]),
  kapat: S(["M6.5 6.5l11 11", "M17.5 6.5l-11 11"]),
  banka: S(["M4 9.5 12 5l8 4.5", "M5 9.5h14", "M6.5 10v7", "M10 10v7", "M14 10v7", "M17.5 10v7", "M4.5 19h15"]),
  kalp: S(["M12 19s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 2.5C19 14.6 12 19 12 19Z"]),
  uyari: S(["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M12 8v5", "M12 16h.01"]),
  goz: S(["M3 12s3.3-6 9-6 9 6 9 6-3.3 6-9 6-9-6-9-6Z", "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"]),
  "goz-kapali": S(["M10.6 6.1A9 9 0 0 1 12 6c5.7 0 9 6 9 6a15 15 0 0 1-2.4 3.1", "M6.6 7.6C4.3 9.2 3 12 3 12s3.3 6 9 6a8.6 8.6 0 0 0 4.4-1.2", "M4 4l16 16", "M9.9 10a2.5 2.5 0 0 0 3.9 3.3"]),
  yildiz: S(["m12 4.5 2.3 4.7 5.2.8-3.8 3.6.9 5.2-4.6-2.4-4.6 2.4.9-5.2L4.5 10l5.2-.8Z"]),
  destek: S(["M5 12.5V11a7 7 0 0 1 14 0v1.5", "M5 12.5a1.5 1.5 0 0 1 1.5-1.5H8v5H6.5A1.5 1.5 0 0 1 5 14.5Z", "M19 12.5a1.5 1.5 0 0 0-1.5-1.5H16v5h1.5a1.5 1.5 0 0 0 1.5-1.5Z", "M16 16a4 4 0 0 1-4 3.5"]),
  bugun: S(["M5 8a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 8v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17Z", "M5 10h14", "M9 3.5v3", "M15 3.5v3", "M12 13.5h.01"]),
  sohbet: S(["M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h0A2 2 0 0 1 5 14Z"]),
};

/** Kullanılabilen ikon adları: marka seti + panelin arayüz ikonları */
export type IkonAdi = HugIconName | keyof typeof CIZIM;

export default function Ikon({ ad, boyut = 20, className = "", baslik }: { ad: IkonAdi | string; boyut?: number; className?: string; baslik?: string }) {
  if (ad in HUG_ICONS) return <HugIcon name={ad as HugIconName} size={boyut} className={className} title={baslik} />;
  const yollar = CIZIM[ad] ?? CIZIM.uyari;
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 ${ad === "yukleniyor" ? "animate-spin" : ""} ${className}`} role={baslik ? "img" : undefined} aria-label={baslik} aria-hidden={baslik ? undefined : true}>
      {yollar.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
