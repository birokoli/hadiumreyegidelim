// Ramazan 2027 rezervasyonları: durum (bekliyor / ödendi / iptal), son ödeme tarihi, ara / WhatsApp.
import { useState } from "react";
import { Alert, View } from "react-native";
import { istek } from "@/api/istemci";
import { useIslem, useRamazan } from "@/veri/sorgular";
import type { Rezervasyon } from "@/veri/tipler";
import { Baslik, Dugme, Kart, Rozet, Segment, Yazi } from "@/ui/temel";
import Liste from "@/ui/Liste";
import { ara, tarihSaat, usd, whatsappAc } from "@/ui/bicim";

export default function Ramazan() {
  const q = useRamazan();
  const [suz, setSuz] = useState<"aktif" | Rezervasyon["durum"] | "tumu">("aktif");
  const degistir = useIslem((g: { id: string; durum: string }) => istek("/api/admin/ramazan", { govde: g }), [["ramazan"]]);
  const liste = (q.data?.liste ?? []).filter((r) => (suz === "tumu" ? true : suz === "aktif" ? r.durum !== "iptal" : r.durum === suz));
  const sor = (r: Rezervasyon, durum: string, metin: string) => Alert.alert(metin, `${r.adSoyad} · ${r.kod}`, [{ text: "Vazgeç" }, { text: "Evet", onPress: () => degistir.mutate({ id: r.id, durum }) }]);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Ramazan 2027" alt={`${liste.length} rezervasyon`} geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "aktif", etiket: "Aktif" }, { deger: "bekliyor", etiket: "Ödeme bekliyor" }, { deger: "odendi", etiket: "Ödendi" }, { deger: "iptal", etiket: "İptal" }, { deger: "tumu", etiket: "Tümü" }]} deger={suz} degisti={setSuz} />
      </View>
      <Liste q={q} veri={liste} anahtar={(r) => r.id} bos="Rezervasyon yok" kart satir={(r) => (
        <Kart style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Yazi tur="altBaslik" style={{ flex: 1 }} satir={1}>{r.adSoyad}</Yazi>
            <Rozet metin={r.durum === "odendi" ? "Ödendi" : r.durum === "iptal" ? "İptal" : "Ödeme bekliyor"} ton={r.durum === "odendi" ? "yesil" : r.durum === "iptal" ? "gri" : "turuncu"} />
          </View>
          <Yazi tur="kucuk">{r.kod} · Oda {r.oda} · {r.paket} · {r.kisi} kişi</Yazi>
          <Yazi>Toplam {usd(r.toplamUsd)} (kişi başı {usd(r.kisiBasiUsd)})</Yazi>
          {r.durum === "bekliyor" ? <Yazi tur="kucuk">Son ödeme: {tarihSaat(r.sonOdeme)}</Yazi> : null}
          <Yazi tur="kucuk">Yolcular: {r.yolcular}</Yazi>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <Dugme metin="Ara" ikon="tel" kucuk tur="ikincil" onPress={() => ara(r.telefon)} />
            <Dugme metin="WhatsApp" ikon="whatsapp" kucuk tur="whatsapp" onPress={() => whatsappAc(r.telefon)} />
            {r.durum === "bekliyor" ? <Dugme metin="Ödendi" ikon="tik" kucuk onPress={() => sor(r, "odendi", "Ödeme alındı mı?")} /> : null}
            {r.durum !== "iptal" ? <Dugme metin="İptal" kucuk tur="tehlike" onPress={() => sor(r, "iptal", "Rezervasyon iptal edilsin mi?")} /> : null}
          </View>
        </Kart>
      )} />
    </View>
  );
}
