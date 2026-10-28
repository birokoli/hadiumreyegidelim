// Sağ altta yüzen "yeni" düğmesi (telefonda başparmak erişimine yakın)
import { Pressable, StyleSheet } from "react-native";
import Ikon from "@/ikonlar/Ikon";
import { titret } from "./temel";
import { R } from "@/tema";

export default function Fab({ onPress, ikon = "arti", etiket }: { onPress: () => void; ikon?: string; etiket: string }) {
  return (
    <Pressable accessibilityLabel={etiket} onPress={() => (titret(), onPress())} style={({ pressed }) => [st.fab, pressed && { transform: [{ scale: 0.95 }] }]}>
      <Ikon ad={ikon} boyut={28} renk="#fff" kalinlik={2.2} />
    </Pressable>
  );
}
const st = StyleSheet.create({
  fab: { position: "absolute", right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: R.lacivert, alignItems: "center", justifyContent: "center", shadowColor: R.gece, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
});
