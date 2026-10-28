// Yeni satış dosyası: müşteri, telefon, kişi, tarih ve not. Kalemler ve teklif web panelinde ya da sonra.
import { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { istek } from "@/api/istemci";
import { useIslem } from "@/veri/sorgular";
import { Alan, Baslik, Dugme, Ekran, Segment } from "@/ui/temel";

export default function YeniDosya() {
  const [f, setF] = useState({ musteriAdi: "", phone: "", email: "", yetiskin: "2", cocuk: "0", gidis: "", donus: "", talepNotu: "", satisTuru: "01" });
  const set = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }));
  const olustur = useIslem(() => istek<{ dosya: { no: string } }>("/api/admin/satis", { govde: { ...f, yetiskin: Number(f.yetiskin) || 1, cocuk: Number(f.cocuk) || 0 } }), [["satis"]]);
  const tarihOk = (t: string) => !t || /^\d{4}-\d{2}-\d{2}$/.test(t);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Yeni dosya" geri />
      <Ekran>
        <Segment secenekler={[{ deger: "01", etiket: "Bireysel umre" }, { deger: "02", etiket: "Grup" }, { deger: "03", etiket: "Yalnızca vize" }, { deger: "04", etiket: "Yalnızca otel" }, { deger: "05", etiket: "Transfer / diğer" }]} deger={f.satisTuru} degisti={set("satisTuru")} />
        <Alan etiket="Müşteri adı soyadı" value={f.musteriAdi} onChangeText={set("musteriAdi")} autoFocus />
        <Alan etiket="Telefon" value={f.phone} onChangeText={set("phone")} keyboardType="phone-pad" placeholder="05xx xxx xx xx" />
        <Alan etiket="E-posta (isteğe bağlı)" value={f.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}><Alan etiket="Yetişkin" value={f.yetiskin} onChangeText={set("yetiskin")} keyboardType="number-pad" /></View>
          <View style={{ flex: 1 }}><Alan etiket="Çocuk" value={f.cocuk} onChangeText={set("cocuk")} keyboardType="number-pad" /></View>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}><Alan etiket="Gidiş (YYYY-AA-GG)" value={f.gidis} onChangeText={set("gidis")} placeholder="2026-12-14" keyboardType="numbers-and-punctuation" /></View>
          <View style={{ flex: 1 }}><Alan etiket="Dönüş" value={f.donus} onChangeText={set("donus")} placeholder="2026-12-24" keyboardType="numbers-and-punctuation" /></View>
        </View>
        <Alan etiket="Talep notu" value={f.talepNotu} onChangeText={set("talepNotu")} multiline placeholder="Otel tercihi, bütçe, özel istek…" />
        <Dugme metin="Dosyayı aç" ikon="dosya" yukleniyor={olustur.isPending} devreDisi={f.musteriAdi.trim().length < 2 || !tarihOk(f.gidis) || !tarihOk(f.donus)} onPress={async () => {
          try {
            const r = await olustur.mutateAsync(undefined);
            router.replace(`/satis/${r.dosya.no}`);
          } catch (e) {
            Alert.alert("Açılamadı", e instanceof Error ? e.message : "");
          }
        }} />
      </Ekran>
    </View>
  );
}
