// Tek sayfanın metinleri. Boş bırakılan ya da varsayılanla aynı alan saklanmaz (sitede varsayılan görünür).
// SSS sayfasının "items" alanı soru-cevap listesi olarak düzenlenir (biçim: src/lib/page-texts/faq.ts).
import { useEffect, useState } from "react";
import { Alert, Linking, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL, istek } from "@/api/istemci";
import { useSayfaMetinleri } from "@/veri/sayfaMetinleri";
import { parseFaq, serializeFaq } from "@site/lib/page-texts/faq";
import { Alan, Baslik, Bolum, Dugme, Ekran, IkonDugme, Kart, Yazi, Yukleniyor } from "@/ui/temel";
import { R } from "@/tema";

type Sss = { cat: string; q: string; a: string };

export default function SayfaMetni() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const q = useSayfaMetinleri();
  const tanim = q.data?.pages.find((p) => p.id === id);
  const kayitli = q.data?.values[id] ?? {};
  const [d, setD] = useState<Record<string, string> | null>(null);
  useEffect(() => { if (tanim && !d) setD(Object.fromEntries(tanim.fields.map((f) => [f.key, kayitli[f.key] ?? f.default]))); }, [tanim, d, kayitli]);
  const [mesgul, setMesgul] = useState(false);
  if (!tanim || !d) return <View style={{ flex: 1 }}><Baslik baslik="Sayfa" geri /><Yukleniyor /></View>;
  const ilk = Object.fromEntries(tanim.fields.map((f) => [f.key, kayitli[f.key] ?? f.default]));
  const degisti = JSON.stringify(ilk) !== JSON.stringify(d);
  const kaydet = async () => {
    setMesgul(true);
    try {
      await istek("/api/admin/page-texts", { method: "PUT", govde: { page: tanim.id, values: d } });
      await qc.invalidateQueries({ queryKey: ["sayfa-metinleri"] });
      Alert.alert("Kaydedildi", "Sayfa sitede güncellendi.");
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={tanim.label} alt={tanim.path} geri sag={<IkonDugme ikon="disari" etiket="Sayfayı aç" onPress={() => Linking.openURL(`${API_URL}${tanim.path}`)} />} />
      <Ekran>
        {tanim.fields.map((f) =>
          tanim.id === "sss" && f.key === "items" ? (
            <SssDuzenle key={f.key} metin={d[f.key] ?? ""} degisti={(v) => setD({ ...d, [f.key]: v })} />
          ) : (
            <View key={f.key} style={{ gap: 4 }}>
              <Alan etiket={f.label} value={d[f.key] ?? ""} onChangeText={(v) => setD({ ...d, [f.key]: v })} multiline={f.multiline || (d[f.key] ?? "").length > 60} placeholder={f.default} />
              {f.help ? <Yazi tur="kucuk">{f.help}</Yazi> : null}
              {d[f.key] !== f.default && f.default ? <Dugme metin="Varsayılana dön" kucuk tur="ikincil" onPress={() => setD({ ...d, [f.key]: f.default })} style={{ alignSelf: "flex-start" }} /> : null}
            </View>
          ),
        )}
      </Ekran>
      {degisti ? (
        <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi }}>
          <Dugme metin="Kaydet ve yayınla" ikon="tik" yukleniyor={mesgul} onPress={kaydet} />
        </View>
      ) : null}
    </View>
  );
}

function SssDuzenle({ metin, degisti }: { metin: string; degisti: (v: string) => void }) {
  const [liste, setListe] = useState<Sss[]>(() => parseFaq(metin));
  const yaz = (l: Sss[]) => {
    setListe(l);
    degisti(serializeFaq(l));
  };
  return (
    <Bolum baslik={`Sorular (${liste.length})`}>
      {liste.map((s, i) => (
        <Kart key={i} style={{ gap: 8 }}>
          <Alan etiket="Kategori" value={s.cat} onChangeText={(cat) => yaz(liste.map((x, j) => (j === i ? { ...x, cat } : x)))} />
          <Alan etiket="Soru" value={s.q} onChangeText={(q) => yaz(liste.map((x, j) => (j === i ? { ...x, q } : x)))} multiline />
          <Alan etiket="Cevap" value={s.a} onChangeText={(a) => yaz(liste.map((x, j) => (j === i ? { ...x, a } : x)))} multiline />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {i > 0 ? <Dugme metin="Yukarı" kucuk tur="ikincil" onPress={() => { const l = [...liste]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; yaz(l); }} /> : null}
            <Dugme metin="Sil" kucuk tur="tehlike" onPress={() => yaz(liste.filter((_, j) => j !== i))} />
          </View>
        </Kart>
      ))}
      <Dugme metin="Soru ekle" ikon="arti" tur="hafif" onPress={() => setListe([...liste, { cat: liste[liste.length - 1]?.cat ?? "Genel", q: "", a: "" }])} />
      <Yazi tur="kucuk">Sorusu ya da cevabı boş olan madde kaydedilmez.</Yazi>
    </Bolum>
  );
}
