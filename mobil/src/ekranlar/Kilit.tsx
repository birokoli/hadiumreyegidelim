// Kilit ekranı: açılış animasyonu, ardından parmak izi / yüz kendiliğinden istenir.
import { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOturum } from "@/oturum/Oturum";
import { Dugme, Yazi } from "@/ui/temel";
import Acilis from "@/ui/Acilis";

export default function KilitEkrani() {
  const { kilidiAc, cikis, yonetici } = useOturum();
  const alt = useSafeAreaInsets();
  useEffect(() => {
    const t = setTimeout(kilidiAc, 1100);
    return () => clearTimeout(t);
  }, [kilidiAc]);
  return (
    <Acilis ust={alt.top + 80}>
      <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 18 }}>
        <Yazi tur="baslik">Merhaba {yonetici?.ad?.split(" ")[0] ?? ""}</Yazi>
        <View style={{ width: "100%", maxWidth: 360, gap: 10 }}>
          <Dugme metin="Kilidi aç" ikon="guven" onPress={kilidiAc} />
          <Dugme metin="Farklı hesapla giriş" tur="hafif" onPress={cikis} />
        </View>
        <Yazi tur="kucuk" style={{ marginTop: "auto", marginBottom: alt.bottom + 20 }}>Hadi Umreye Gidelim · yönetim</Yazi>
      </View>
    </Acilis>
  );
}
