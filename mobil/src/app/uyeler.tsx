// Üyeler: arama, yeni / izinli süzgeci; dokununca ara, WhatsApp, e-posta ya da son umre dosyası.
import { useMemo, useState } from "react";
import { ActionSheetIOS, Alert, Platform, View } from "react-native";
import { router } from "expo-router";
import { useUyeler } from "@/veri/sorgular";
import { Arama, Baslik, Rozet, Satir, Segment } from "@/ui/temel";
import Liste from "@/ui/Liste";
import { ara, epostaAc, goreli, whatsappAc } from "@/ui/bicim";

export default function Uyeler() {
  const q = useUyeler();
  const [t, setT] = useState("");
  const [suz, setSuz] = useState<"tumu" | "yeni" | "izinli" | "dosyali">("tumu");
  const liste = useMemo(() => {
    const k = t.trim().toLocaleLowerCase("tr-TR");
    return (q.data?.uyeler ?? []).filter((u) => (suz === "yeni" ? u.yeni : suz === "izinli" ? u.izinEposta || u.izinWhatsapp : suz === "dosyali" ? u.dosyaSayisi > 0 : true) && (!k || `${u.ad} ${u.eposta} ${u.telefon ?? ""}`.toLocaleLowerCase("tr-TR").includes(k)));
  }, [q.data, t, suz]);
  const sec = (u: (typeof liste)[number]) => {
    const secenek = [
      ...(u.telefon ? [{ ad: "Ara", f: () => ara(u.telefon) }, { ad: "WhatsApp", f: () => whatsappAc(u.telefon) }] : []),
      { ad: "E-posta", f: () => epostaAc(u.eposta) },
      ...(u.sonDosyaNo ? [{ ad: `Dosya ${u.sonDosyaNo}`, f: () => router.push(`/satis/${u.sonDosyaNo}`) }] : []),
    ];
    if (Platform.OS === "ios") ActionSheetIOS.showActionSheetWithOptions({ options: [...secenek.map((s) => s.ad), "Vazgeç"], cancelButtonIndex: secenek.length }, (i) => secenek[i]?.f());
    else Alert.alert(u.ad, u.eposta, [...secenek.map((s) => ({ text: s.ad, onPress: s.f })), { text: "Kapat", style: "cancel" }]);
  };
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Üyeler" alt={`${liste.length} üye`} geri />
      <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
        <Arama deger={t} degisti={setT} yer="Ad, e-posta, telefon" />
        <Segment secenekler={[{ deger: "tumu", etiket: "Tümü" }, { deger: "yeni", etiket: "Son 7 gün" }, { deger: "izinli", etiket: "İletişim izni var" }, { deger: "dosyali", etiket: "Umre dosyası var" }]} deger={suz} degisti={setSuz} />
      </View>
      <Liste q={q} veri={liste} anahtar={(u) => u.id} bos="Üye bulunamadı" satir={(u) => (
        <Satir ikon="kullanici" baslik={u.ad} alt={`${u.eposta} · ${goreli(u.uyelik)}${u.plan.donem ? ` · plan: ${u.plan.donem}` : ""}`} sag={u.yeni ? <Rozet metin="Yeni" ton="turuncu" /> : u.dosyaSayisi ? <Rozet metin={`${u.dosyaSayisi} dosya`} /> : undefined} onPress={() => sec(u)} />
      )} />
    </View>
  );
}
