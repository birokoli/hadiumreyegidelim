// WhatsApp konuşması: yapay zekânın ve müşterinin mesajları; temsilci olarak yanıt (sunucudaki WhatsApp hattından gider).
import { Linking, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { istek } from "@/api/istemci";
import { useIslem, useWhatsapp } from "@/veri/sorgular";
import { Baslik, IkonDugme, Kart, Yazi, Yukleniyor } from "@/ui/temel";
import Sohbet from "@/ui/Sohbet";
import { R } from "@/tema";

export default function WhatsappKonusma() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useWhatsapp();
  const c = q.data?.conversations.find((x) => x.id === id);
  const gonder = useIslem((text: string) => istek("/api/admin/whatsapp-ai/send-message", { govde: { conversationId: id, phone: c?.phone, text } }), [["whatsapp"]]);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={c?.name || (c ? `+${c.phone}` : "WhatsApp")} alt={c?.handoffReason ?? undefined} geri sag={c ? <IkonDugme ikon="whatsapp" renk={R.whatsapp} etiket="WhatsApp'ta aç" onPress={() => Linking.openURL(`https://wa.me/${c.phone}`)} /> : undefined} />
      {!c ? <Yukleniyor /> : (
        <>
          {c.status === "HUMAN_NEEDED" ? <Kart style={{ margin: 12, marginBottom: 0, backgroundColor: R.kirmiziZemin }}><Yazi tur="kucuk" renk={R.kirmizi}>Yapay zekâ bu konuşmayı temsilciye devretti.</Yazi></Kart> : null}
          <Sohbet balonlar={c.messages.map((m) => ({ id: m.id, biz: m.direction === "OUTBOUND", metin: m.content, zaman: m.createdAt, etiket: m.direction === "OUTBOUND" ? (m.source === "ai" ? "Yapay zekâ" : "Ekip") : undefined }))} gonder={(m) => gonder.mutateAsync(m)} gonderiliyor={gonder.isPending} yer="Temsilci olarak yazın" />
        </>
      )}
    </View>
  );
}
