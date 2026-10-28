// Yeni sürüm uyarısı: sunucu GitHub'daki son yayını bildirir (/api/mobil/surum). Sürüm eskiyse alttan pencere çıkar;
// "Güncelle" APK'yı indirir, Android kurulum ekranını açar. "Zorunlu" yayınlarda pencere kapatılamaz.
import { useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import { API_URL, SURUM } from "@/api/istemci";
import AltSayfa from "./AltSayfa";
import { Dugme, Yazi } from "./temel";

type Surum = { surum: string; apk: string | null; zorunlu: boolean; notlar: string[] };
const sayi = (s: string) => s.split(".").map(Number).reduce((t, n, i) => t + (n || 0) * [10000, 100, 1][i]!, 0);

export default function Guncelleme() {
  const [yeni, setYeni] = useState<Surum | null>(null);
  const [kapali, setKapali] = useState<string | null>(null);
  useEffect(() => {
    const bak = () =>
      fetch(`${API_URL}/api/mobil/surum`)
        .then((r) => r.json() as Promise<Surum>)
        .then((s) => (s.apk && sayi(s.surum) > sayi(SURUM) ? setYeni(s) : setYeni(null)))
        .catch(() => {});
    bak();
    const abone = AppState.addEventListener("change", (d) => d === "active" && bak());
    return () => abone.remove();
  }, []);
  if (!yeni || (kapali === yeni.surum && !yeni.zorunlu)) return null;
  return (
    <AltSayfa acik kapat={() => !yeni.zorunlu && setKapali(yeni.surum)} baslik={`Yeni sürüm: ${yeni.surum}`}>
      <Yazi tur="kucuk">Şu anki sürüm {SURUM}. Güncelleme dosyası indirilir; açılan ekranda "Yükle"ye dokunun. Oturumunuz ve ayarlarınız korunur.</Yazi>
      {yeni.notlar.map((n) => <Yazi key={n}>• {n}</Yazi>)}
      <Dugme metin="Güncelle" ikon="indir" onPress={() => Linking.openURL(yeni.apk!)} />
      {!yeni.zorunlu ? <Dugme metin="Sonra" tur="hafif" onPress={() => setKapali(yeni.surum)} /> : null}
    </AltSayfa>
  );
}
