// Blog yazısı düzenleyici: başlık, adres, SEO alanları, kategori, yazar, kapak, özet, içerik (HTML) ve önizleme; yayınla / taslağa al.
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, istek } from "@/api/istemci";
import { useYazilar, yaziKaydet, type Yazi as Kayit } from "@/veri/blog";
import { Anahtar, GorselAlan } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Baslik, Bolum, Cip, Dugme, Ekran, IkonDugme, Kart, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { R } from "@/tema";

const BOS: Partial<Kayit> = { title: "", slug: "", metaTitle: "", description: "", content: "", keywords: "", tags: "", focusKeyword: "", imageUrl: null, imageAlt: "", tldr: "", faq: "", personalExperience: "", references: "", published: false, categoryId: null, authorId: null, scheduledAt: null };

export default function YaziDuzenle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const yeni = id === "yeni";
  const qc = useQueryClient();
  const q = useYazilar();
  const kat = useQuery({ queryKey: ["kategoriler"], queryFn: () => istek<{ id: string; name: string }[]>("/api/categories") });
  const yaz = useQuery({ queryKey: ["yazarlar"], queryFn: () => istek<{ id: string; name: string }[]>("/api/authors") });
  const kayit = useMemo(() => (yeni ? BOS : q.data?.find((y) => y.id === id)), [q.data, id, yeni]);
  const [y, setY] = useState<Partial<Kayit> | null>(null);
  useEffect(() => { if (kayit && !y) setY({ ...kayit }); }, [kayit, y]);
  const [bolum, setBolum] = useState<"yazi" | "seo" | "icerik">("yazi");
  const [onizle, setOnizle] = useState(false);
  const [mesgul, setMesgul] = useState(false);
  if (!y) return <View style={{ flex: 1 }}><Baslik baslik="Yazı" geri /><Yukleniyor /></View>;
  const set = <K extends keyof Kayit>(k: K, v: Kayit[K] | null) => setY({ ...y, [k]: v });
  const degisti = JSON.stringify(y) !== JSON.stringify(kayit);
  const kaydet = async (yayin?: boolean) => {
    if (!y.title?.trim() || !y.slug?.trim()) return Alert.alert("Eksik", "Başlık ve adres gerekli.");
    setMesgul(true);
    try {
      const sonuc = await yaziKaydet({ ...y, published: yayin ?? y.published }, yeni);
      await qc.invalidateQueries({ queryKey: ["yazilar"] });
      if (yeni) router.replace({ pathname: "/blog/[id]", params: { id: sonuc.id } });
      else setY({ ...y, published: yayin ?? y.published });
      Alert.alert("Kaydedildi", yayin === true ? "Yazı yayında." : yayin === false ? "Yazı taslağa alındı." : "");
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const sil = () => Alert.alert("Yazı silinsin mi?", "Kalıcı olarak silinir. Yalnızca gizlemek için taslağa alın.", [{ text: "Vazgeç" }, { text: "Sil", style: "destructive", onPress: async () => {
    try {
      await istek(`/api/posts?id=${y.id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["yazilar"] });
      router.back();
    } catch (e) {
      Alert.alert("Silinemedi", e instanceof Error ? e.message : "");
    }
  } }]);
  const kelime = (y.content ?? "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={yeni ? "Yeni yazı" : y.title || "Yazı"} alt={y.published ? "Yayında" : y.scheduledAt ? "Zamanlanmış" : "Taslak"} geri sag={!yeni && y.published ? <IkonDugme ikon="disari" etiket="Sitede aç" onPress={() => Linking.openURL(`${API_URL}/blog/${y.slug}`)} /> : undefined} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "yazi", etiket: "Yazı" }, { deger: "icerik", etiket: `İçerik · ${kelime} kelime` }, { deger: "seo", etiket: "SEO ve kaynak" }]} deger={bolum} degisti={setBolum} />
      </View>
      <Ekran>
        {bolum === "yazi" ? (
          <Kart style={{ gap: 12 }}>
            <Alan etiket="Başlık" value={y.title ?? ""} onChangeText={(v) => set("title", v)} multiline />
            <Alan etiket="Adres (slug)" value={y.slug ?? ""} onChangeText={(v) => set("slug", v)} autoCapitalize="none" />
            <Alan etiket="Kısa açıklama (meta açıklama)" value={y.description ?? ""} onChangeText={(v) => set("description", v)} multiline />
            <Alan etiket="Özet (TL;DR)" value={y.tldr ?? ""} onChangeText={(v) => set("tldr", v)} multiline />
            <GorselAlan etiket="Kapak görseli" deger={y.imageUrl} degisti={(v) => set("imageUrl", v)} />
            <Alan etiket="Görsel açıklaması (alt)" value={y.imageAlt ?? ""} onChangeText={(v) => set("imageAlt", v)} />
            <Bolum baslik="Kategori">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(kat.data ?? []).map((c) => <Cip key={c.id} metin={c.name} secili={y.categoryId === c.id} onPress={() => set("categoryId", y.categoryId === c.id ? null : c.id)} />)}
              </View>
            </Bolum>
            <Bolum baslik="Yazar">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(yaz.data ?? []).map((a) => <Cip key={a.id} metin={a.name} secili={y.authorId === a.id} onPress={() => set("authorId", y.authorId === a.id ? null : a.id)} />)}
              </View>
            </Bolum>
            <Alan etiket="Zamanlanmış yayın (YYYY-AA-GG SS:DD, boşsa yok)" value={y.scheduledAt ? y.scheduledAt.slice(0, 16).replace("T", " ") : ""} onChangeText={(v) => set("scheduledAt", v.trim() ? new Date(v.trim().replace(" ", "T")).toISOString() : null)} autoCapitalize="none" />
          </Kart>
        ) : null}
        {bolum === "icerik" ? (
          <>
            <Dugme metin="Önizle" ikon="goz" tur="hafif" onPress={() => setOnizle(true)} />
            <Alan etiket="İçerik (HTML)" value={y.content ?? ""} onChangeText={(v) => set("content", v)} multiline style={{ minHeight: 420, fontSize: 14 }} autoCapitalize="none" />
            <Alan etiket="Kişisel deneyim" value={y.personalExperience ?? ""} onChangeText={(v) => set("personalExperience", v)} multiline />
            <Alan etiket="SSS (web panelindeki biçimde)" value={y.faq ?? ""} onChangeText={(v) => set("faq", v)} multiline autoCapitalize="none" />
          </>
        ) : null}
        {bolum === "seo" ? (
          <Kart style={{ gap: 12 }}>
            <Alan etiket="SEO başlığı" value={y.metaTitle ?? ""} onChangeText={(v) => set("metaTitle", v)} />
            <Yazi tur="kucuk" renk={(y.metaTitle ?? "").length > 60 ? R.kirmizi : R.metin}>{`${(y.metaTitle ?? "").length} / 60 karakter`}</Yazi>
            <Alan etiket="Odak anahtar kelime" value={y.focusKeyword ?? ""} onChangeText={(v) => set("focusKeyword", v)} />
            <Alan etiket="Anahtar kelimeler (virgülle)" value={y.keywords ?? ""} onChangeText={(v) => set("keywords", v)} multiline />
            <Alan etiket="Etiketler (virgülle)" value={y.tags ?? ""} onChangeText={(v) => set("tags", v)} />
            <Alan etiket="Kaynaklar" value={y.references ?? ""} onChangeText={(v) => set("references", v)} multiline autoCapitalize="none" />
            {y.seoScore != null ? <Yazi tur="kucuk">{`Son SEO puanı: ${y.seoScore}`}</Yazi> : null}
          </Kart>
        ) : null}
        <Anahtar etiket="Yayında" alt="Kapalıysa sitede görünmez" deger={!!y.published} degisti={(v) => set("published", v)} />
        {!yeni ? <Dugme metin="Yazıyı sil" tur="tehlike" onPress={sil} /> : null}
      </Ekran>
      {degisti || yeni ? (
        <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi, flexDirection: "row", gap: 8 }}>
          {!y.published ? <Dugme metin="Kaydet ve yayınla" tur="ikincil" onPress={() => kaydet(true)} style={{ flex: 1 }} /> : null}
          <Dugme metin="Kaydet" ikon="tik" yukleniyor={mesgul} onPress={() => kaydet()} style={{ flex: 1 }} />
        </View>
      ) : null}
      <AltSayfa acik={onizle} kapat={() => setOnizle(false)} baslik="Önizleme">
        <View style={{ height: 520, borderRadius: 12, overflow: "hidden" }}>
          <WebView originWhitelist={["*"]} source={{ html: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,Roboto,sans-serif;padding:16px;color:#12295A;line-height:1.7}img{max-width:100%;height:auto}h1,h2,h3{line-height:1.3}table{border-collapse:collapse;width:100%}td,th{border:1px solid #DCE3F2;padding:6px}</style></head><body><h1>${(y.title ?? "").replace(/</g, "&lt;")}</h1>${y.content ?? ""}</body></html>`, baseUrl: API_URL }} />
        </View>
      </AltSayfa>
    </View>
  );
}
