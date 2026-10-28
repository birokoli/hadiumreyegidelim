// Müşteri havuzu kaydı (kitapçık indirenler, üyeler): durum ve iletişim.
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { istek } from "@/api/istemci";
import { useHavuz, useIslem } from "@/veri/sorgular";
import { Baslik, Bolum, Dugme, Ekran, Kart, Rozet, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { ara, epostaAc, tarihSaat, whatsappAc } from "@/ui/bicim";
import { BOSLUK } from "@/tema";

export default function HavuzKaydi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useHavuz();
  const c = q.data?.leads.find((x) => x.id === id);
  const durum = useIslem((status: string) => istek("/api/admin/leads", { govde: { id, status } }), [["havuz"]]);
  if (!c) return (<><Baslik baslik="Müşteri" geri />{q.isPending ? <Yukleniyor /> : <Ekran><Yazi>Kayıt bulunamadı.</Yazi></Ekran>}</>);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={c.name || c.email} alt={tarihSaat(c.createdAt)} geri />
      <Ekran>
        <View style={{ flexDirection: "row", gap: BOSLUK.s }}>
          {c.phone ? <Dugme metin="Ara" ikon="tel" tur="ikincil" kucuk style={{ flex: 1 }} onPress={() => ara(c.phone)} /> : null}
          {c.phone ? <Dugme metin="WhatsApp" ikon="whatsapp" tur="whatsapp" kucuk style={{ flex: 1 }} onPress={() => whatsappAc(c.phone)} /> : null}
          <Dugme metin="E-posta" ikon="eposta" tur="hafif" kucuk style={{ flex: 1 }} onPress={() => epostaAc(c.email)} />
        </View>
        <Kart style={{ gap: 6 }}>
          <Yazi>{c.email}</Yazi>
          {c.phone ? <Yazi tur="kucuk">{c.phone}</Yazi> : null}
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            <Rozet metin={c.source} />
            <Rozet metin={c.marketingConsent ? "Pazarlama izni var" : "İzin yok"} ton={c.marketingConsent ? "yesil" : "gri"} />
            {c.emailVerified ? <Rozet metin="E-posta doğrulandı" ton="yesil" /> : null}
          </View>
          {c.note ? <Yazi tur="kucuk">{c.note}</Yazi> : null}
        </Kart>
        <Bolum baslik="Durum">
          <Segment secenekler={[{ deger: "new", etiket: "Yeni" }, { deger: "contacted", etiket: "Görüşüldü" }, { deger: "customer", etiket: "Müşteri" }, { deger: "not_interested", etiket: "İlgilenmiyor" }]} deger={c.status} degisti={(s) => durum.mutate(s)} />
        </Bolum>
      </Ekran>
    </View>
  );
}
