// Giriş: açılış animasyonunun ardından web panelindeki kullanıcı adı ve şifre. Bir kez girilir; sonra parmak izi / yüz.
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Device from "expo-device";
import { useOturum } from "@/oturum/Oturum";
import { Dugme, Yazi } from "@/ui/temel";
import Acilis from "@/ui/Acilis";
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Acilis ust={alt.top + 40}>
        <ScrollView contentContainerStyle={[st.kap, { paddingBottom: alt.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <View style={st.kart}>
            <Yazi tur="baslik">Hoş geldiniz</Yazi>
            <Yazi tur="kucuk">Web panelindeki kullanıcı adınız ve şifrenizle giriş yapın. Sonraki açılışlarda parmak izi ya da yüz tanıma yeterli.</Yazi>
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
          <Text style={st.alt}>Yalnızca Hadi Umreye Gidelim ekibi içindir.</Text>
        </ScrollView>
      </Acilis>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  kap: { flexGrow: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 28, gap: 16 },
  kart: { width: "100%", maxWidth: 440, backgroundColor: R.kart, borderRadius: KOSE.l + 4, padding: 22, gap: 14, borderWidth: 1, borderColor: R.cizgi, shadowColor: R.gece, shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  girdi: { backgroundColor: R.zemin, borderRadius: KOSE.m, paddingHorizontal: 16, minHeight: 52, fontFamily: Y.normal, fontSize: 16, color: R.yazi },
  goz: { position: "absolute", right: 14, top: 15 },
  alt: { color: R.soluk, fontFamily: Y.normal, fontSize: 12.5, marginTop: "auto", textAlign: "center" },
});
