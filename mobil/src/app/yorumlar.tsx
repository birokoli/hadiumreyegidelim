// Yorumlar: onay bekleyenler önce; yayınla / reddet, yanıt yaz.
import { useState } from "react";
import { Alert, Image, Share, View } from "react-native";
import { istek } from "@/api/istemci";
import { useIslem, useYorumlar } from "@/veri/sorgular";
import type { Yorum } from "@/veri/tipler";
import { Alan, Baslik, Dugme, Kart, Rozet, Segment, Yazi } from "@/ui/temel";
import AltSayfa from "@/ui/AltSayfa";
import Liste from "@/ui/Liste";
import { goreli, whatsappAc } from "@/ui/bicim";
import { R } from "@/tema";

const ETIKET: Record<string, string> = { invited: "Davet edildi", pending: "Onay bekliyor", approved: "Yayında", rejected: "Reddedildi" };

export default function Yorumlar() {
  const q = useYorumlar();
  const [suz, setSuz] = useState("pending");
  const [yanit, setYanit] = useState<{ y: Yorum; metin: string } | null>(null);
  const guncelle = useIslem((g: Record<string, unknown>) => istek("/api/admin/reviews", { govde: { action: "update", ...g } }), [["yorumlar"]]);
  const liste = (q.data?.items ?? []).filter((y) => suz === "tumu" || y.status === suz);
  const [davet, setDavet] = useState<{ ad: string; tel: string } | null>(null);
  const [elle, setElle] = useState<{ ad: string; metin: string; puan: string; sehir: string; ay: string } | null>(null);
  const davetEt = useIslem((ad: string) => istek<{ url: string }>("/api/admin/reviews", { govde: { action: "invite", customerName: ad } }), [["yorumlar"]]);
  const elleEkle = useIslem((g: { ad: string; metin: string; puan: string; sehir: string; ay: string }) => istek("/api/admin/reviews", { govde: { action: "manual", customerName: g.ad, text: g.metin, rating: g.puan, city: g.sehir, umreMonth: g.ay } }), [["yorumlar"]]);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Yorumlar" geri sag={<View style={{ flexDirection: "row", gap: 8 }}><Dugme metin="Yorum iste" ikon="gonder2" kucuk onPress={() => setDavet({ ad: "", tel: "" })} /><Dugme metin="Ekle" ikon="arti" kucuk tur="hafif" onPress={() => setElle({ ad: "", metin: "", puan: "5", sehir: "", ay: "" })} /></View>} />
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
      <AltSayfa acik={!!davet} kapat={() => setDavet(null)} baslik="Müşteriden yorum iste">
        <Yazi tur="kucuk">Müşteriye özel yorum bağlantısı oluşturulur; WhatsApp'tan gönderin. Müşteri yazınca onay listesine düşer.</Yazi>
        <Alan etiket="Müşteri adı soyadı" value={davet?.ad ?? ""} onChangeText={(v) => setDavet((o) => (o ? { ...o, ad: v } : o))} autoFocus />
        <Alan etiket="Telefon (WhatsApp için, isteğe bağlı)" value={davet?.tel ?? ""} onChangeText={(v) => setDavet((o) => (o ? { ...o, tel: v } : o))} keyboardType="phone-pad" />
        <Dugme metin="Bağlantıyı oluştur ve gönder" ikon="whatsapp" tur="whatsapp" yukleniyor={davetEt.isPending} devreDisi={(davet?.ad.trim().length ?? 0) < 2} onPress={async () => {
          if (!davet) return;
          try {
            const r = await davetEt.mutateAsync(davet.ad.trim());
            const mesaj = `Selamün aleyküm ${davet.ad.trim().split(" ")[0]}, umrenizle ilgili birkaç cümlenizi çok isteriz. Yorumunuzu buradan yazabilirsiniz: ${r.url}\n\nHadi Umreye Gidelim`;
            if (davet.tel.trim()) whatsappAc(davet.tel, mesaj);
            else Share.share({ message: mesaj });
            setDavet(null);
          } catch (e) {
            Alert.alert("Oluşturulamadı", e instanceof Error ? e.message : "");
          }
        }} />
      </AltSayfa>
      <AltSayfa acik={!!elle} kapat={() => setElle(null)} baslik="Elle yorum ekle">
        <Alan etiket="Müşteri adı" value={elle?.ad ?? ""} onChangeText={(v) => setElle((o) => (o ? { ...o, ad: v } : o))} />
        <Alan etiket="Yorum" value={elle?.metin ?? ""} onChangeText={(v) => setElle((o) => (o ? { ...o, metin: v } : o))} multiline />
        <Yazi tur="etiket">Puan</Yazi>
        <Segment secenekler={["5", "4", "3", "2", "1"].map((p) => ({ deger: p, etiket: "★".repeat(Number(p)) }))} deger={elle?.puan ?? "5"} degisti={(v) => setElle((o) => (o ? { ...o, puan: v } : o))} />
        <Alan etiket="Şehir (isteğe bağlı)" value={elle?.sehir ?? ""} onChangeText={(v) => setElle((o) => (o ? { ...o, sehir: v } : o))} />
        <Alan etiket="Umre ayı (isteğe bağlı)" value={elle?.ay ?? ""} onChangeText={(v) => setElle((o) => (o ? { ...o, ay: v } : o))} placeholder="Ekim 2026" />
        <Dugme metin="Ekle" yukleniyor={elleEkle.isPending} devreDisi={!elle?.ad.trim() || !elle?.metin.trim()} onPress={() => elle && elleEkle.mutate(elle, { onSuccess: () => setElle(null), onError: (e) => Alert.alert("Eklenemedi", e.message) })} />
      </AltSayfa>
      <AltSayfa acik={!!yanit} kapat={() => setYanit(null)} baslik="Yoruma yanıt">
        <Alan etiket="Yanıt (sitede yorumun altında görünür)" value={yanit?.metin ?? ""} onChangeText={(m) => setYanit((o) => (o ? { ...o, metin: m } : o))} multiline />
        <Dugme metin="Kaydet" yukleniyor={guncelle.isPending} onPress={() => yanit && guncelle.mutate({ id: yanit.y.id, reply: yanit.metin.trim() }, { onSuccess: () => setYanit(null) })} />
      </AltSayfa>
    </View>
  );
}
