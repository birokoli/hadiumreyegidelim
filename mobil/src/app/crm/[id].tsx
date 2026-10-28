// CRM kaydı: aşama, not ve etkinlik geçmişi; ara / WhatsApp.
import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { istek } from "@/api/istemci";
import { useOturum } from "@/oturum/Oturum";
import { useCrm, useIslem } from "@/veri/sorgular";
import { Alan, Baslik, Bolum, Dugme, Ekran, Kart, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { ara, goreli, usd, whatsappAc } from "@/ui/bicim";
import { BOSLUK } from "@/tema";

const ASAMA = [{ deger: "NEW", etiket: "Yeni" }, { deger: "IN_DISCUSSION", etiket: "Görüşmede" }, { deger: "QUOTATION_SENT", etiket: "Teklif gönderildi" }, { deger: "WON", etiket: "Kazanıldı" }, { deger: "LOST", etiket: "Kaybedildi" }];

export default function CrmKaydi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { yonetici } = useOturum();
  const q = useCrm();
  const c = q.data?.leads.find((x) => x.id === id);
  const [not, setNot] = useState("");
  const guncelle = useIslem((g: Record<string, unknown>) => istek("/api/admin/crm", { method: "PATCH", govde: { id, ...g } }), [["crm"]]);
  const etkinlik = useIslem((content: string) => istek("/api/admin/crm/activities", { govde: { leadId: id, type: "NOTE", content, createdBy: yonetici?.ad } }), [["crm"]]);
  if (!c) return (<><Baslik baslik="CRM" geri />{q.isPending ? <Yukleniyor /> : <Ekran><Yazi>Kayıt bulunamadı.</Yazi></Ekran>}</>);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={c.name} alt={`${c.preferredPackage ?? c.source} · ${usd(c.valueUSD)}`} geri />
      <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
        <View style={{ flexDirection: "row", gap: BOSLUK.s }}>
          <Dugme metin="Ara" ikon="tel" tur="ikincil" kucuk style={{ flex: 1 }} onPress={() => ara(c.phone)} />
          <Dugme metin="WhatsApp" ikon="whatsapp" tur="whatsapp" kucuk style={{ flex: 1 }} onPress={() => whatsappAc(c.phone)} />
        </View>
        <Bolum baslik="Aşama">
          <Segment secenekler={ASAMA} deger={c.stage} degisti={(stage) => guncelle.mutate({ stage })} />
        </Bolum>
        {c.notes ? <Kart><Yazi>{c.notes}</Yazi></Kart> : null}
        <Alan etiket="Not ekle" value={not} onChangeText={setNot} multiline placeholder="Görüşme notu" />
        <Dugme metin="Notu kaydet" kucuk devreDisi={!not.trim()} yukleniyor={etkinlik.isPending} onPress={() => etkinlik.mutate(not.trim(), { onSuccess: () => setNot("") })} />
        <Bolum baslik="Geçmiş">
          <Kart style={{ gap: 10 }}>
            {(c.activities ?? []).map((a) => (
              <View key={a.id}>
                <Yazi>{a.content}</Yazi>
                <Yazi tur="kucuk">{a.createdBy} · {goreli(a.createdAt)}</Yazi>
              </View>
            ))}
            {!c.activities?.length ? <Yazi tur="kucuk">Henüz etkinlik yok.</Yazi> : null}
          </Kart>
        </Bolum>
      </Ekran>
    </View>
  );
}
