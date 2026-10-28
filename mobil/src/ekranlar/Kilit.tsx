// Kilit ekranı: açılışta kendiliğinden parmak izi / yüz ister; vazgeçilirse düğmeyle tekrar denenir.
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useOturum } from "@/oturum/Oturum";
import { Dugme } from "@/ui/temel";
import { R, Y } from "@/tema";

export default function KilitEkrani() {
  const { kilidiAc, cikis, yonetici } = useOturum();
  useEffect(() => {
    kilidiAc();
  }, [kilidiAc]);
  return (
    <View style={st.kap}>
      <Image source={require("../../assets/marka/acilis.png")} style={{ width: 140, height: 140 }} resizeMode="contain" />
      <Text style={st.ad}>Merhaba {yonetici?.ad?.split(" ")[0] ?? ""}</Text>
      <View style={{ width: "100%", maxWidth: 360, gap: 10 }}>
        <Dugme metin="Kilidi aç" ikon="parmak" onPress={kilidiAc} />
        <Dugme metin="Farklı hesapla giriş" tur="hafif" onPress={cikis} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.gece, alignItems: "center", justifyContent: "center", gap: 20, padding: 24 },
  ad: { color: "#fff", fontFamily: Y.kalin, fontSize: 20 },
});
