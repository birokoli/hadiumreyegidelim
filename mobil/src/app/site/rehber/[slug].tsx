// Tek rehber sayfası: bütün alanlar; "Denetle" kalite kurallarını çalıştırır (kaydetmez), "Kaydet" denetimden geçerse yayınlar.
import { useEffect, useState } from "react";
import { Alert, Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, istek } from "@/api/istemci";
import { NesneDuzenleyici } from "@/ui/NesneDuzenleyici";
import { Baslik, Dugme, Ekran, IkonDugme, Kart, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { R } from "@/tema";

type Sorun = { level: "hata" | "uyarı"; message: string };
type Veri = { page: Record<string, unknown>; path: string; edited: boolean; codeNewer: boolean };
const ETIKET: Record<string, string> = {
  keyword: "Hedef kelime", title: "Sayfa başlığı (≤ 60 ile birlikte)", description: "Meta açıklama (120–158 karakter)", h1: "H1 başlık", lead: "Giriş paragrafı (40–60 kelime)",
  sections: "Bölümler", h2: "Ara başlık", paragraphs: "Paragraflar", bullets: "Maddeler", table: "Tablo", head: "Tablo başlıkları", rows: "Tablo satırları",
  faq: "Sık sorulan sorular", q: "Soru", a: "Cevap", sources: "Resmî kaynaklar", text: "Metin", href: "Adres", related: "İç bağlantılar (yollar)", reviewed: "Gözden geçirme (YYYY-AA-GG)", term: "Terim",
};
const GRUPLAR = [
  { deger: "ust", etiket: "Başlık ve giriş", alanlar: ["h1", "lead", "keyword", "title", "description", "term", "reviewed"] },
  { deger: "govde", etiket: "Bölümler", alanlar: ["sections"] },
  { deger: "sss", etiket: "SSS ve kaynak", alanlar: ["faq", "sources", "related"] },
];

export default function RehberSayfasi() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["rehber-sayfasi", slug], queryFn: () => istek<Veri>(`/api/admin/content-pages?slug=${encodeURIComponent(slug)}`) });
  const [p, setP] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { if (q.data && !p) setP(q.data.page); }, [q.data, p]);
  const [grup, setGrup] = useState("ust");
  const [sorunlar, setSorunlar] = useState<Sorun[] | null>(null);
  const [mesgul, setMesgul] = useState<string | null>(null);
  if (!p || !q.data) return <View style={{ flex: 1 }}><Baslik baslik="Rehber sayfası" geri /><Yukleniyor /></View>;
  const gonder = async (dryRun: boolean) => {
    setMesgul(dryRun ? "denetle" : "kaydet");
    try {
      // Hatalı sayfayı sunucu 422 ile reddeder; önce denetleyip hataları listede göstermek için her kayıt bir denetimle başlar
      const d = await istek<{ ok: boolean; issues: Sorun[] }>("/api/admin/content-pages", { govde: { slug, page: p, dryRun: true } });
      if (dryRun || !d.ok) {
        setSorunlar(d.issues);
        if (!dryRun) Alert.alert("Kaydedilmedi", "Denetimde hata var; listeye bakın.");
        return;
      }
      const r = await istek<{ ok: boolean; saved: boolean; issues: Sorun[] }>("/api/admin/content-pages", { govde: { slug, page: p } });
      setSorunlar(r.issues);
      if (r.saved) {
        await qc.invalidateQueries({ queryKey: ["rehber-sayfalari"] });
        await qc.invalidateQueries({ queryKey: ["rehber-sayfasi", slug] });
        Alert.alert("Yayında", "Sayfa kaydedildi.");
      }
    } catch (e) {
      Alert.alert("Olmadı", e instanceof Error ? e.message : "Denetimde hata var.");
    } finally {
      setMesgul(null);
    }
  };
  const g = GRUPLAR.find((x) => x.deger === grup)!;
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={String(p.h1 ?? slug)} alt={q.data.path} geri sag={<IkonDugme ikon="disari" etiket="Sitede aç" onPress={() => Linking.openURL(`${API_URL}${q.data!.path}`)} />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={GRUPLAR} deger={grup} degisti={setGrup} />
      </View>
      <Ekran>
        {sorunlar ? (
          <Kart style={{ gap: 4, backgroundColor: sorunlar.some((s) => s.level === "hata") ? R.kirmiziZemin : R.yesilZemin }}>
            <Yazi tur="etiket">{sorunlar.length ? `${sorunlar.length} not` : "Denetimden geçti"}</Yazi>
            {sorunlar.map((s, i) => <Yazi key={i} tur="kucuk" renk={s.level === "hata" ? R.kirmizi : R.turuncu}>{`${s.level === "hata" ? "Hata" : "Uyarı"}: ${s.message}`}</Yazi>)}
          </Kart>
        ) : null}
        <Kart style={{ gap: 12 }}>
          <NesneDuzenleyici nesne={p} etiket={ETIKET} alanlar={g.alanlar} degisti={setP} />
        </Kart>
        {q.data.edited ? <Dugme metin="Özgün sürüme dön" tur="tehlike" onPress={() => Alert.alert("Özgün sürüme dönülsün mü?", "Panelde yapılan düzenlemeler silinir, sayfa kod dosyasındaki hâline döner.", [{ text: "Vazgeç" }, { text: "Dön", style: "destructive", onPress: async () => {
          await istek(`/api/admin/content-pages?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
          await qc.invalidateQueries({ queryKey: ["rehber-sayfalari"] });
          router.back();
        } }])} /> : null}
      </Ekran>
      <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi, flexDirection: "row", gap: 8 }}>
        <Dugme metin="Denetle" tur="ikincil" yukleniyor={mesgul === "denetle"} onPress={() => gonder(true)} style={{ flex: 1 }} />
        <Dugme metin="Kaydet ve yayınla" ikon="tik" yukleniyor={mesgul === "kaydet"} onPress={() => gonder(false)} style={{ flex: 2 }} />
      </View>
    </View>
  );
}
