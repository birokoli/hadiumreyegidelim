// Aylık fiyatlar (web: /admin/fiyat-teklifleri/hizmetler/fiyatlar): seçilen ayın satış fiyatları; kaleme dokununca o kalemin
// bütün ayları düzenlenir. Toplu işlemler: önceki ayı % ile kopyala, maliyetten fiyat üret, dolar kuru.
import { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useFiyatlar } from "@/veri/sorgular";
import { Alan, Arama, Baslik, Dugme, IkonDugme, Satir, Segment, Yazi } from "@/ui/temel";
import { Anahtar, Secim } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import Liste from "@/ui/Liste";
import { usd } from "@/ui/bicim";
import { KATEGORI, KAT_IKON, ayKisa, type KutuphaneKalem } from "@/veri/katalog";
import { Y } from "@/tema";

export default function Fiyatlar() {
  const qc = useQueryClient();
  const f = useFiyatlar();
  const k = useQuery({ queryKey: ["kutuphane"], queryFn: () => istek<{ services: KutuphaneKalem[] }>("/api/admin/service-library") });
  const aylar = f.data?.months ?? [];
  const [ay, setAy] = useState<string | null>(null);
  const [kat, setKat] = useState("tumu");
  const [t, setT] = useState("");
  const [arac, setArac] = useState(false);
  const secAy = ay ?? aylar[0];
  const liste = useMemo(() => (k.data?.services ?? []).filter((s) => s.isActive && (kat === "tumu" || s.category === kat) && (!t || s.name.toLocaleLowerCase("tr-TR").includes(t.toLocaleLowerCase("tr-TR")))).map((s) => {
    const p = (f.data?.prices ?? []).filter((x) => x.serviceId === s.id && x.month === secAy);
    return { ...s, fiyat: p.length ? Math.min(...p.map((x) => x.salePriceUsd)) : null, cesit: p.length };
  }), [k.data, f.data, secAy, t, kat]);
  const eksik = liste.filter((s) => s.isPublic && s.fiyat == null).length;
  const tazele = () => qc.invalidateQueries({ queryKey: ["fiyatlar"] });
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Aylık fiyatlar" alt={f.data?.payment.usdTry ? `1 $ = ${f.data.payment.usdTry} TL · KDV hariç` : "KDV hariç satış fiyatları"} geri sag={<IkonDugme ikon="ayarlar" etiket="Toplu işlemler" onPress={() => setArac(true)} />} />
      <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
        <Arama deger={t} degisti={setT} yer="Otel, transfer, vize…" />
        <Segment secenekler={aylar.map((m) => ({ deger: m, etiket: ayKisa(m) }))} deger={secAy ?? ""} degisti={setAy} />
        <Segment secenekler={[{ deger: "tumu", etiket: "Tümü" }, ...KATEGORI]} deger={kat} degisti={setKat} />
        {eksik ? <Yazi tur="kucuk">{`Sitede görünen ${eksik} kalemin bu ay fiyatı yok; planlayıcıda "teklifte bildirilecek" yazar.`}</Yazi> : null}
      </View>
      <Liste q={k} veri={liste} anahtar={(s) => s.id} bos="Hizmet yok" satir={(s) => (
        <Satir ikon={KAT_IKON[s.category] ?? "paket"} baslik={s.name} alt={[s.city, s.isPublic ? "sitede" : null, s.cesit > 1 ? `${s.cesit} fiyat, en düşük` : null].filter(Boolean).join(" · ")} sag={<Yazi style={{ fontFamily: Y.kalin }}>{usd(s.fiyat)}</Yazi>} onPress={() => router.push({ pathname: "/fiyat/[id]", params: { id: s.id, ad: s.name, kat: s.category } })} />
      )} />
      <TopluIslemler acik={arac} kapat={() => setArac(false)} aylar={aylar} secAy={secAy} kur={f.data?.payment} bitti={tazele} />
    </View>
  );
}

function TopluIslemler({ acik, kapat, aylar, secAy, kur, bitti }: { acik: boolean; kapat: () => void; aylar: string[]; secAy?: string; kur?: { usdTry: number | null; rateDate: string | null; ibanPercent: number; cardPercent: number }; bitti: () => void }) {
  const [tur, setTur] = useState<"kopya" | "maliyet" | "kur">("kopya");
  const [kaynak, setKaynak] = useState(aylar[0] ?? "");
  const [hedef, setHedef] = useState(secAy ?? "");
  const [yuzde, setYuzde] = useState("0");
  const [kat, setKat] = useState("");
  const [ustune, setUstune] = useState(false);
  const [usdTry, setUsdTry] = useState(kur?.usdTry ? String(kur.usdTry) : "");
  const [mesgul, setMesgul] = useState(false);
  const calistir = async () => {
    setMesgul(true);
    try {
      if (tur === "kur") {
        await istek("/api/admin/service-prices", { govde: { action: "payment", usdTry: Number(usdTry.replace(",", ".")) || 0, rateDate: new Date().toISOString().slice(0, 10), ibanPercent: kur?.ibanPercent ?? 0, cardPercent: kur?.cardPercent ?? 0 } });
        Alert.alert("Kaydedildi", "Dolar kuru güncellendi.");
      } else if (tur === "kopya") {
        const r = await istek<{ copied: number; skipped: number }>("/api/admin/service-prices", { govde: { action: "copy", from: kaynak, to: hedef, percent: Number(yuzde.replace(",", ".")) || 0, category: kat || undefined, overwrite: ustune } });
        Alert.alert("Kopyalandı", `${r.copied} fiyat yazıldı${r.skipped ? `, ${r.skipped} dolu hücre korundu` : ""}.`);
      } else {
        const r = await istek<{ filled: number; skipped: number }>("/api/admin/service-prices", { govde: { action: "fromCost", month: hedef, margin: Number(yuzde.replace(",", ".")) || 0, category: kat || undefined, overwrite: ustune } });
        Alert.alert("Üretildi", `${r.filled} fiyat yazıldı${r.skipped ? `, ${r.skipped} dolu hücre korundu` : ""}.`);
      }
      bitti();
      kapat();
    } catch (e) {
      Alert.alert("Olmadı", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const aySecenek = aylar.map((m) => ({ deger: m, etiket: ayKisa(m) }));
  return (
    <AltSayfa acik={acik} kapat={kapat} baslik="Toplu işlemler">
      <Segment secenekler={[{ deger: "kopya", etiket: "Ay kopyala" }, { deger: "maliyet", etiket: "Maliyetten üret" }, { deger: "kur", etiket: "Dolar kuru" }]} deger={tur} degisti={setTur} />
      {tur === "kur" ? (
        <>
          <Alan etiket="1 $ kaç TL" value={usdTry} onChangeText={setUsdTry} keyboardType="decimal-pad" />
          <Yazi tur="kucuk">Planlayıcıda TL karşılığı bu kurla gösterilir. Tarih bugün olarak kaydedilir.</Yazi>
        </>
      ) : (
        <>
          {tur === "kopya" ? <Secim etiket="Kaynak ay" secenekler={aySecenek} deger={kaynak} degisti={setKaynak} /> : null}
          <Secim etiket={tur === "kopya" ? "Hedef ay" : "Ay"} secenekler={aySecenek} deger={hedef} degisti={setHedef} />
          <Alan etiket={tur === "kopya" ? "Değişim % (artı ya da eksi)" : "Kâr marjı % (maliyetin üstüne)"} value={yuzde} onChangeText={setYuzde} keyboardType="numbers-and-punctuation" />
          <Secim etiket="Kategori" secenekler={[{ deger: "", etiket: "Hepsi" }, ...KATEGORI]} deger={kat} degisti={setKat} />
          <Anahtar etiket="Dolu fiyatların üstüne yaz" alt="Kapalıyken yalnızca boş hücreler doldurulur" deger={ustune} degisti={setUstune} />
        </>
      )}
      <Dugme metin="Uygula" ikon="tik" yukleniyor={mesgul} devreDisi={tur === "kopya" && kaynak === hedef} onPress={calistir} />
    </AltSayfa>
  );
}
