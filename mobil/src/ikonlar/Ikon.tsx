// Uygulama ikonu: önce Apple çizgisindeki arayüz ikonları (24'lük, 1,7 çizgi), yoksa marka ikon seti (1024'lük, dolgulu).
import Svg, { Path } from "react-native-svg";
import { R } from "@/tema";
import { CIZGI, MARKA } from "./veri";
import { EK } from "./ek";

export type IkonAdi = string;

export default function Ikon({ ad, boyut = 22, renk = R.lacivert, kalinlik = 1.7 }: { ad: IkonAdi; boyut?: number; renk?: string; kalinlik?: number }) {
  const cizgi = EK[ad] ?? CIZGI[ad];
  if (cizgi) {
    return (
      <Svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none">
        {cizgi.map((d, i) => (
          <Path key={i} d={d} stroke={renk} strokeWidth={kalinlik} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
    );
  }
  const marka = MARKA[ad];
  if (!marka) return null;
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 1024 1024">
      {marka.map((d, i) => (
        <Path key={i} d={d} fill={renk} fillRule="evenodd" />
      ))}
    </Svg>
  );
}
