// Alttan açılan sayfa: aşama değiştirme, ödeme ekleme, not gibi kısa işlemler. Klavye açılınca yukarı kayar.
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Yazi } from "./temel";
import Ikon from "@/ikonlar/Ikon";
import { KOSE, R } from "@/tema";

export default function AltSayfa({ acik, kapat, baslik, children }: { acik: boolean; kapat: () => void; baslik: string; children: ReactNode }) {
  const alt = useSafeAreaInsets().bottom;
  return (
    <Modal visible={acik} transparent animationType="slide" onRequestClose={kapat} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={st.perde} onPress={kapat} />
        <View style={[st.sayfa, { paddingBottom: alt + 16 }]}>
          <View style={st.tutamak} />
          <View style={st.ust}>
            <Yazi tur="altBaslik" style={{ flex: 1 }}>{baslik}</Yazi>
            <Pressable hitSlop={12} onPress={kapat} accessibilityLabel="Kapat">
              <Ikon ad="kapat" boyut={24} renk={R.metin} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const st = StyleSheet.create({
  perde: { flex: 1, backgroundColor: "rgba(18,41,90,0.45)" },
  sayfa: { backgroundColor: R.zemin, borderTopLeftRadius: KOSE.l + 4, borderTopRightRadius: KOSE.l + 4, paddingHorizontal: 16, maxHeight: "88%", width: "100%", maxWidth: 640, alignSelf: "center" },
  tutamak: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: R.cizgi, marginTop: 8 },
  ust: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
});
