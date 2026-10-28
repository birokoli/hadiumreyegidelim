// Giriş: web panelindeki kullanıcı adı ve şifre. Bir kez girilir; sonra parmak izi / yüz ile açılır.
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Device from "expo-device";
import { useOturum } from "@/oturum/Oturum";
import { Dugme, Yazi } from "@/ui/temel";
import Ikon from "@/ikonlar/Ikon";
import { KOSE, R, Y } from "@/tema";

export default function GirisEkrani() {
  const { giris } = useOturum();
  const alt = useSafeAreaInsets();
  const [k, setK] = useState("");
  const [s, setS] = useState("");
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [yuk, setYuk] = useState(false);

  const gonder = async () => {
    if (!k.trim() || !s) return setHata("Kullanıcı adı ve şifreyi yazın.");
    setYuk(true);
    setHata(null);
    try {
      await giris(k.trim(), s, [Device.manufacturer, Device.modelName].filter(Boolean).join(" ") || "Android");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Giriş yapılamadı.");
    } finally {
      setYuk(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: R.gece }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[st.kap, { paddingTop: alt.top + 48, paddingBottom: alt.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Image source={require("../../assets/marka/acilis.png")} style={{ width: 150, height: 150 }} resizeMode="contain" />
        <Text style={st.ust}>YÖNETİM</Text>
        <View style={st.kart}>
          <Yazi tur="baslik">Giriş yapın</Yazi>
          <Yazi tur="kucuk">Web panelindeki kullanıcı adınız ve şifrenizle. Sonraki açılışlarda parmak izi ya da yüz tanıma yeterli.</Yazi>
          <TextInput value={k} onChangeText={setK} placeholder="Kullanıcı adı veya e-posta" placeholderTextColor={R.soluk} autoCapitalize="none" autoCorrect={false} textContentType="username" autoComplete="username" style={st.girdi} returnKeyType="next" />
          <View>
            <TextInput value={s} onChangeText={setS} placeholder="Şifre" placeholderTextColor={R.soluk} secureTextEntry={!goster} textContentType="password" autoComplete="password" style={[st.girdi, { paddingRight: 52 }]} returnKeyType="go" onSubmitEditing={gonder} />
            <Pressable hitSlop={10} onPress={() => setGoster((g) => !g)} style={st.goz} accessibilityLabel={goster ? "Şifreyi gizle" : "Şifreyi göster"}>
              <Ikon ad={goster ? "goz-kapali" : "goz"} boyut={22} renk={R.metin} />
            </Pressable>
          </View>
          {hata ? <Yazi tur="kucuk" renk={R.kirmizi} style={{ fontFamily: Y.yari }}>{hata}</Yazi> : null}
          <Dugme metin="Giriş yap" onPress={gonder} yukleniyor={yuk} />
        </View>
        <Text style={st.alt}>Bu uygulama yalnızca Hadi Umreye Gidelim ekibi içindir.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  kap: { flexGrow: 1, alignItems: "center", paddingHorizontal: 20, gap: 16 },
  ust: { color: R.kum, fontFamily: Y.kalin, letterSpacing: 6, fontSize: 13, marginTop: -8 },
  kart: { width: "100%", maxWidth: 440, backgroundColor: R.kart, borderRadius: KOSE.l, padding: 20, gap: 14, marginTop: 8 },
  girdi: { backgroundColor: R.zemin, borderRadius: KOSE.m, paddingHorizontal: 16, minHeight: 52, fontFamily: Y.normal, fontSize: 16, color: R.yazi },
  goz: { position: "absolute", right: 14, top: 15 },
  alt: { color: "rgba(255,255,255,0.55)", fontFamily: Y.normal, fontSize: 12.5, marginTop: "auto", textAlign: "center" },
});
