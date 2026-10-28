// Uygulama ikonu (28 Ekim, kullanıcı: "kendi icon setimizi kullan"): önce marka ikon seti (sosyal/marka-kiti/12-ikonlar =
// public/ikon, 1024'lük, dolgulu). Arayüzdeki adların markada karşılığı varsa (ev → kabe, tel → telefon…) o kullanılır.
// Yalnızca markada olmayan küçük arayüz işaretleri (geri, kapat, artı, zil, ayar…) çizgi ikon olarak kalır.
import Svg, { Path } from "react-native-svg";
import { R } from "@/tema";
import { CIZGI, MARKA } from "./veri";
import { EK } from "./ek";

/** Arayüz adı → marka ikonu */
const MARKAYA: Record<string, string> = {
  ev: "kabe", bugun: "kabe", dosya: "fiyat", gelen: "mesaj", sohbet: "mesaj", mesaj: "mesaj",
  tel: "telefon", takvim2: "takvim", ucak2: "ucak", ara2: "ara", tik: "onay", "tik-daire": "onay", ileri: "ok",
  odeme: "fiyat", fiyat2: "fiyat", kullanici: "bireysel", kullanicilar: "aile", aile: "aile", eposta: "eposta",
  belge2: "vize", belge: "vize", bilgi2: "bilgi", guven: "guven", kilit: "guven", yorum: "yorum", yildiz2: "yorum",
  kampanya2: "paket", kampanya: "paket", davet: "aile", icerik: "rehber", rehber: "rehber",
};

export default function Ikon({ ad, boyut = 22, renk = R.lacivert, kalinlik = 1.8 }: { ad: string; boyut?: number; renk?: string; kalinlik?: number }) {
  const marka = MARKA[MARKAYA[ad] ?? ad];
  if (marka) {
    return (
      <Svg width={boyut} height={boyut} viewBox="0 0 1024 1024">
        {marka.map((d, i) => (
          <Path key={i} d={d} fill={renk} fillRule="evenodd" />
        ))}
      </Svg>
    );
  }
  const cizgi = EK[ad] ?? CIZGI[ad];
  if (!cizgi) return null;
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none">
      {cizgi.map((d, i) => (
        <Path key={i} d={d} stroke={renk} strokeWidth={kalinlik} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}
