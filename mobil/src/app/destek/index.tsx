import { View } from "react-native";
import { router } from "expo-router";
import { useDestekler } from "@/veri/sorgular";
import { Baslik, Satir } from "@/ui/temel";
import Liste from "@/ui/Liste";
import { goreli } from "@/ui/bicim";

export default function Destekler() {
  const q = useDestekler();
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Destek mesajları" geri />
      <Liste q={q} veri={q.data?.chats ?? []} anahtar={(c) => c.id} bos="Destek mesajı yok" satir={(c) => (
        <Satir ikon="sohbet" baslik={c.influencer?.fullName ?? "Influencer"} alt={`${c.messages?.[c.messages.length - 1]?.content ?? ""} · ${goreli(c.lastMessageAt)}`} rozet={c.unreadByAdmin || undefined} onPress={() => router.push(`/destek/${c.id}`)} />
      )} />
    </View>
  );
}
