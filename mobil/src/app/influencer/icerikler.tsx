// Influencer içerikleri: onay bekleyenler; onayla / revize iste (ekip notu influencer'ın panelinde görünür).
import { useState } from "react";
import { Image, Linking, View } from "react-native";
import { istek } from "@/api/istemci";
import { useIcerikler, useIslem } from "@/veri/sorgular";
import type { Icerik } from "@/veri/tipler";
import { Alan, Baslik, Dugme, Kart, Rozet, Segment, Yazi } from "@/ui/temel";
import AltSayfa from "@/ui/AltSayfa";
import Liste from "@/ui/Liste";
import { goreli } from "@/ui/bicim";

export default function Icerikler() {
  const [durum, setDurum] = useState("pending");
  const q = useIcerikler(durum);
  const [revize, setRevize] = useState<{ i: Icerik; not: string } | null>(null);
  const karar = useIslem((g: { i: Icerik; action: "approve" | "reject"; note?: string }) => istek(`/api/admin/influencers/${g.i.influencer.id}/shares`, { govde: { shareId: g.i.id, action: g.action, note: g.note, rejectReason: g.note } }), [["icerikler"], ["influencerlar"]]);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Influencer içerikleri" geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "pending", etiket: "Onay bekliyor" }, { deger: "approved", etiket: "Onaylandı" }, { deger: "rejected", etiket: "Revize istendi" }, { deger: "tumu", etiket: "Tümü" }]} deger={durum} degisti={setDurum} />
      </View>
      <Liste q={q} veri={q.data?.icerikler ?? []} anahtar={(i) => i.id} bos="İçerik yok" kart satir={(i) => (
        <Kart style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Yazi tur="altBaslik" style={{ flex: 1 }} satir={1}>{i.influencer.fullName}</Yazi>
            <Rozet metin={i.platform} />
          </View>
          <Yazi tur="kucuk">{[i.influencer.instagramHandle ? `@${i.influencer.instagramHandle.replace(/^@/, "")}` : null, i.kampanya, i.tarih, goreli(i.olusturma)].filter(Boolean).join(" · ")}</Yazi>
          {i.aciklama ? <Yazi>{i.aciklama}</Yazi> : null}
          {i.gorsel ? <Image source={{ uri: i.gorsel }} style={{ width: "100%", height: 240, borderRadius: 12 }} resizeMode="cover" /> : null}
          {i.ekipNotu ? <Yazi tur="kucuk">Ekip notu: {i.ekipNotu}</Yazi> : null}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {i.link ? <Dugme metin="Paylaşımı aç" ikon="disari" kucuk tur="ikincil" onPress={() => Linking.openURL(i.link!)} /> : null}
            {i.durum !== "approved" ? <Dugme metin="Onayla" ikon="tik" kucuk onPress={() => karar.mutate({ i, action: "approve" })} /> : null}
            {i.durum === "pending" ? <Dugme metin="Revize iste" kucuk tur="tehlike" onPress={() => setRevize({ i, not: "" })} /> : null}
          </View>
        </Kart>
      )} />
      <AltSayfa acik={!!revize} kapat={() => setRevize(null)} baslik="Revize iste">
        <Alan etiket="Influencer'a not" value={revize?.not ?? ""} onChangeText={(n) => setRevize((o) => (o ? { ...o, not: n } : o))} multiline placeholder="Linki ekleyin, fiyatı kampanyadaki gibi yazın…" />
        <Dugme metin="Gönder" yukleniyor={karar.isPending} devreDisi={!revize?.not.trim()} onPress={() => revize && karar.mutate({ i: revize.i, action: "reject", note: revize.not.trim() }, { onSuccess: () => setRevize(null) })} />
      </AltSayfa>
    </View>
  );
}
