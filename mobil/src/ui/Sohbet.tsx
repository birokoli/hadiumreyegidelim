// Mesajlaşma görünümü (destek ve WhatsApp): balonlar, altta yazma kutusu.
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ikon from "@/ikonlar/Ikon";
import { Yazi } from "./temel";
import { tarihSaat } from "./bicim";
import { KOSE, R, Y } from "@/tema";

export type Balon = { id: string; biz: boolean; metin: string; zaman: string; etiket?: string };

export default function Sohbet({ balonlar, gonder, gonderiliyor, yer = "Mesaj yazın" }: { balonlar: Balon[]; gonder: (m: string) => Promise<unknown>; gonderiliyor?: boolean; yer?: string }) {
  const [m, setM] = useState("");
  const liste = useRef<FlatList<Balon>>(null);
  const alt = useSafeAreaInsets().bottom;
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        ref={liste}
        data={balonlar}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => liste.current?.scrollToEnd({ animated: false })}
        renderItem={({ item: b }) => (
          <View style={[st.balon, b.biz ? st.biz : st.onlar]}>
            {b.etiket ? <Yazi tur="kucuk" renk={b.biz ? "rgba(255,255,255,0.7)" : R.altin} style={{ fontFamily: Y.kalin, fontSize: 11 }}>{b.etiket}</Yazi> : null}
            <Yazi renk={b.biz ? "#fff" : R.yazi}>{b.metin}</Yazi>
            <Yazi tur="kucuk" renk={b.biz ? "rgba(255,255,255,0.7)" : R.soluk} style={{ fontSize: 11, alignSelf: "flex-end" }}>{tarihSaat(b.zaman)}</Yazi>
          </View>
        )}
      />
      <View style={[st.yaz, { paddingBottom: alt + 8 }]}>
        <TextInput value={m} onChangeText={setM} placeholder={yer} placeholderTextColor={R.soluk} multiline style={st.girdi} />
        <Pressable disabled={!m.trim() || gonderiliyor} onPress={async () => { const x = m.trim(); setM(""); await gonder(x).catch(() => setM(x)); }} style={[st.gonder, (!m.trim() || gonderiliyor) && { opacity: 0.4 }]} accessibilityLabel="Gönder">
          <Ikon ad="gonder2" boyut={22} renk="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  balon: { maxWidth: "82%", borderRadius: KOSE.l, paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  biz: { alignSelf: "flex-end", backgroundColor: R.lacivert, borderBottomRightRadius: 6 },
  onlar: { alignSelf: "flex-start", backgroundColor: R.kart, borderBottomLeftRadius: 6 },
  yaz: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 8, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi },
  girdi: { flex: 1, maxHeight: 120, minHeight: 44, backgroundColor: R.zemin, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontFamily: Y.normal, fontSize: 16, color: R.yazi },
  gonder: { width: 44, height: 44, borderRadius: 22, backgroundColor: R.lacivert, alignItems: "center", justifyContent: "center" },
});
