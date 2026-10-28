// Destek sohbeti (influencer ↔ ekip). Açılınca okunmamış sayısı sıfırlanır.
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { istek } from "@/api/istemci";
import { useDestek, useIslem } from "@/veri/sorgular";
import { Baslik, Yukleniyor } from "@/ui/temel";
import Sohbet from "@/ui/Sohbet";

export default function DestekSohbeti() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useDestek(id);
  const gonder = useIslem((content: string) => istek(`/api/admin/support/${id}`, { govde: { content } }), [["destek", id], ["destek"]]);
  const c = q.data?.chat;
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={c?.influencer.fullName ?? "Destek"} alt={c?.influencer.instagramHandle ? `@${c.influencer.instagramHandle.replace(/^@/, "")}` : undefined} geri />
      {!c ? <Yukleniyor /> : <Sohbet balonlar={c.messages.map((m) => ({ id: m.id, biz: m.senderType !== "influencer", metin: m.content, zaman: m.createdAt }))} gonder={(m) => gonder.mutateAsync(m)} gonderiliyor={gonder.isPending} />}
    </View>
  );
}
