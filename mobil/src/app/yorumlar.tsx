// Yorumlar: onay bekleyenler önce; yayınla / reddet, yanıt yaz.
import { useState } from "react";
import { Alert, Image, View } from "react-native";
import { istek } from "@/api/istemci";
import { useIslem, useYorumlar } from "@/veri/sorgular";
import type { Yorum } from "@/veri/tipler";
import { Alan, Baslik, Dugme, Kart, Rozet, Segment, Yazi } from "@/ui/temel";
import AltSayfa from "@/ui/AltSayfa";
import Liste from "@/ui/Liste";
import { goreli } from "@/ui/bicim";
import { R } from "@/tema";

const ETIKET: Record<string, string> = { invited: "Davet edildi", pending: "Onay bekliyor", approved: "Yayında", rejected: "Reddedildi" };

export default function Yorumlar() {
  const q = useYorumlar();
  const [suz, setSuz] = useState("pending");
  const [yanit, setYanit] = useState<{ y: Yorum; metin: string } | null>(null);
  const guncelle = useIslem((g: Record<string, unknown>) => istek("/api/admin/reviews", { govde: { action: "update", ...g } }), [["yorumlar"]]);
  const liste = (q.data?.items ?? []).filter((y) => suz === "tumu" || y.status === suz);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Yorumlar" geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "pending", etiket: "Onay bekliyor", sayi: (q.data?.items ?? []).filter((y) => y.status === "pending").length || undefined }, { deger: "approved", etiket: "Yayında" }, { deger: "rejected", etiket: "Reddedildi" }, { deger: "invited", etiket: "Davet" }, { deger: "tumu", etiket: "Tümü" }]} deger={suz} degisti={setSuz} />
      </View>
      <Liste q={q} veri={liste} anahtar={(y) => y.id} bos="Yorum yok" kart satir={(y) => (
        <Kart style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Yazi tur="altBaslik" style={{ flex: 1 }} satir={1}>{y.displayName || y.customerName}</Yazi>
            <Rozet metin={ETIKET[y.status] ?? y.status} ton={y.status === "approved" ? "yesil" : y.status === "pending" ? "turuncu" : "gri"} />
          </View>
          <Yazi tur="kucuk">{[y.rating ? "★".repeat(y.rating) : null, y.city, y.umreMonth, goreli(y.submittedAt ?? y.createdAt)].filter(Boolean).join(" · ")}</Yazi>
          {y.text ? <Yazi>{y.text}</Yazi> : null}
          {y.photoUrl ? <Image source={{ uri: y.photoUrl }} style={{ width: "100%", height: 180, borderRadius: 12 }} resizeMode="cover" /> : null}
          {y.reply ? <Yazi tur="kucuk" renk={R.lacivert}>Yanıtımız: {y.reply}</Yazi> : null}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {y.status !== "approved" && y.text ? <Dugme metin="Yayınla" ikon="tik" kucuk onPress={() => guncelle.mutate({ id: y.id, status: "approved" })} /> : null}
            {y.status === "pending" || y.status === "approved" ? <Dugme metin={y.status === "approved" ? "Yayından kaldır" : "Reddet"} kucuk tur="tehlike" onPress={() => Alert.alert("Emin misiniz?", "", [{ text: "Vazgeç" }, { text: "Evet", onPress: () => guncelle.mutate({ id: y.id, status: "rejected" }) }])} /> : null}
            {y.text ? <Dugme metin={y.reply ? "Yanıtı düzenle" : "Yanıtla"} kucuk tur="hafif" onPress={() => setYanit({ y, metin: y.reply ?? "" })} /> : null}
          </View>
        </Kart>
      )} />
      <AltSayfa acik={!!yanit} kapat={() => setYanit(null)} baslik="Yoruma yanıt">
        <Alan etiket="Yanıt (sitede yorumun altında görünür)" value={yanit?.metin ?? ""} onChangeText={(m) => setYanit((o) => (o ? { ...o, metin: m } : o))} multiline />
        <Dugme metin="Kaydet" yukleniyor={guncelle.isPending} onPress={() => yanit && guncelle.mutate({ id: yanit.y.id, reply: yanit.metin.trim() }, { onSuccess: () => setYanit(null) })} />
      </AltSayfa>
    </View>
  );
}
