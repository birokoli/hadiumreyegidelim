// Influencer'lar ve başvurular: bekleyen başvuruları onayla / reddet; aktiflerin satış ve tıklama özeti.
import { useState } from "react";
import { Alert, Linking, View } from "react-native";
import { istek } from "@/api/istemci";
import { useInfluencerlar, useIslem } from "@/veri/sorgular";
import { Baslik, Dugme, Kart, Rozet, Segment, Yazi } from "@/ui/temel";
import Liste from "@/ui/Liste";
import { goreli, whatsappAc } from "@/ui/bicim";

export default function Basvurular() {
  const q = useInfluencerlar();
  const [suz, setSuz] = useState("pending");
  const karar = useIslem((g: { id: string; action: string }) => istek(`/api/admin/influencers/${g.id}/approve`, { govde: { action: g.action } }), [["influencerlar"]]);
  const liste = (q.data?.influencers ?? []).filter((i) => suz === "tumu" || i.status === suz);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Influencer'lar" geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "pending", etiket: "Başvurular", sayi: (q.data?.influencers ?? []).filter((i) => i.status === "pending").length || undefined }, { deger: "active", etiket: "Aktif" }, { deger: "passive", etiket: "Pasif" }, { deger: "tumu", etiket: "Tümü" }]} deger={suz} degisti={setSuz} />
      </View>
      <Liste q={q} veri={liste} anahtar={(i) => i.id} bos="Kayıt yok" kart satir={(i) => (
        <Kart style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Yazi tur="altBaslik" style={{ flex: 1 }} satir={1}>{i.fullName}</Yazi>
            <Rozet metin={i.status === "pending" ? "Başvuru" : i.status === "active" ? i.tier : i.status} ton={i.status === "pending" ? "turuncu" : i.status === "active" ? "yesil" : "gri"} />
          </View>
          <Yazi tur="kucuk">{[i.instagramHandle && `IG @${i.instagramHandle.replace(/^@/, "")} (${i.instagramFollowers.toLocaleString("tr-TR")})`, i.tiktokHandle && `TikTok ${i.tiktokHandle}`, i.youtubeHandle && `YouTube ${i.youtubeHandle}`].filter(Boolean).join(" · ") || "Sosyal hesap yok"}</Yazi>
          {i.status === "active" ? <Yazi tur="kucuk">{i.totalClicks} tıklama · {i.totalSales} satış · kod {i.uniqueCode}</Yazi> : <Yazi tur="kucuk">{goreli(i.createdAt)} başvurdu</Yazi>}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {i.instagramHandle ? <Dugme metin="Instagram" ikon="disari" kucuk tur="ikincil" onPress={() => Linking.openURL(`https://instagram.com/${i.instagramHandle!.replace(/^@/, "")}`)} /> : null}
            <Dugme metin="WhatsApp" ikon="whatsapp" kucuk tur="whatsapp" onPress={() => whatsappAc(i.phone)} />
            {i.status === "pending" ? <Dugme metin="Onayla" ikon="tik" kucuk onPress={() => karar.mutate({ id: i.id, action: "approve" })} /> : null}
            {i.status === "pending" ? <Dugme metin="Reddet" kucuk tur="tehlike" onPress={() => Alert.alert("Başvuru reddedilsin mi?", i.fullName, [{ text: "Vazgeç" }, { text: "Reddet", style: "destructive", onPress: () => karar.mutate({ id: i.id, action: "reject" }) }])} /> : null}
          </View>
        </Kart>
      )} />
    </View>
  );
}
