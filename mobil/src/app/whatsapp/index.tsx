// WhatsApp konuşmaları (yapay zekâ asistanı): temsilci gerekenler üstte.
import { View } from "react-native";
import { router } from "expo-router";
import { useWhatsapp } from "@/veri/sorgular";
import { Baslik, Rozet, Satir } from "@/ui/temel";
import Liste from "@/ui/Liste";
import { goreli } from "@/ui/bicim";

export default function Whatsapp() {
  const q = useWhatsapp();
  const liste = [...(q.data?.conversations ?? [])].sort((a, b) => Number(b.status === "HUMAN_NEEDED") - Number(a.status === "HUMAN_NEEDED"));
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="WhatsApp" geri />
      <Liste q={q} veri={liste} anahtar={(c) => c.id} bos="Konuşma yok" satir={(c) => (
        <Satir ikon="whatsapp" baslik={c.name || `+${c.phone}`} alt={`${c.messages?.[c.messages.length - 1]?.content ?? ""} · ${goreli(c.lastMessageAt)}`} sag={c.status === "HUMAN_NEEDED" ? <Rozet metin="Temsilci" ton="kirmizi" /> : undefined} onPress={() => router.push(`/whatsapp/${c.id}`)} />
      )} />
    </View>
  );
}
