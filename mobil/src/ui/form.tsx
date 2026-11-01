// Form parçaları: açma/kapama, seçim, görsel yükleme ve web panelindeki "liste + düzenle" ekranlarının ortak hâli (KayitEkrani).
import { useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Switch, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL, yukle } from "@/api/istemci";
import AltSayfa from "./AltSayfa";
import Liste from "./Liste";
import { Alan, Arama, Baslik, Dugme, IkonDugme, Rozet, Satir, Segment, Yazi, titret, type Ton } from "./temel";
import { KOSE, R, Y } from "@/tema";

export function Anahtar({ etiket, alt, deger, degisti }: { etiket: string; alt?: string; deger: boolean; degisti: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => (titret(), degisti(!deger))} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: R.kart, borderRadius: KOSE.m, borderWidth: 1, borderColor: R.cizgi, paddingHorizontal: 14, paddingVertical: 10, minHeight: 52 }}>
      <View style={{ flex: 1 }}>
        <Yazi style={{ fontFamily: Y.yari }}>{etiket}</Yazi>
        {alt ? <Yazi tur="kucuk">{alt}</Yazi> : null}
      </View>
      <Switch value={deger} onValueChange={degisti} trackColor={{ true: R.lacivert, false: R.cizgi }} thumbColor="#fff" />
    </Pressable>
  );
}

export function Secim<T extends string>({ etiket, secenekler, deger, degisti }: { etiket: string; secenekler: { deger: T; etiket: string }[]; deger: T; degisti: (v: T) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Yazi tur="etiket">{etiket}</Yazi>
      <Segment secenekler={secenekler} deger={deger} degisti={degisti} />
    </View>
  );
}

/** Galeriden görsel seçer, siteye yükler (/api/upload) ve adresini döndürür */
export async function gorselSecVeYukle(alanlar?: Record<string, string>): Promise<string | null> {
  const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!izin.granted) {
    Alert.alert("İzin gerekli", "Görsel seçmek için galeri izni verin.");
    return null;
  }
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });
  if (r.canceled || !r.assets[0]) return null;
  const a = r.assets[0];
  const tur = a.mimeType ?? "image/jpeg";
  return yukle({ uri: a.uri, ad: a.fileName ?? `gorsel.${tur.split("/")[1] ?? "jpg"}`, tur }, alanlar);
}

/** Sitedeki göreli görsel adresi ("/images/…") uygulamada sitenin adresiyle açılır */
export const tamAdres = (u: string) => (u.startsWith("/") ? `${API_URL}${u}` : u);

export function GorselAlan({ etiket, deger, degisti }: { etiket: string; deger: string | null | undefined; degisti: (url: string | null) => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const sec = async () => {
    setYukleniyor(true);
    try {
      const url = await gorselSecVeYukle();
      if (url) degisti(url);
    } catch (e) {
      Alert.alert("Yüklenemedi", e instanceof Error ? e.message : "");
    } finally {
      setYukleniyor(false);
    }
  };
  return (
    <View style={{ gap: 6 }}>
      <Yazi tur="etiket">{etiket}</Yazi>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View style={{ width: 96, height: 72, borderRadius: KOSE.s, backgroundColor: R.maviZemin, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
          {yukleniyor ? <ActivityIndicator color={R.lacivert} /> : deger ? <Image source={{ uri: tamAdres(deger) }} style={{ width: "100%", height: "100%" }} /> : <Yazi tur="kucuk">Görsel yok</Yazi>}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Dugme metin={deger ? "Değiştir" : "Görsel seç"} ikon="kamera" kucuk tur="hafif" onPress={sec} devreDisi={yukleniyor} />
          {deger ? <Dugme metin="Kaldır" kucuk tur="tehlike" onPress={() => degisti(null)} /> : null}
        </View>
      </View>
    </View>
  );
}

export type FormAlan<T> = {
  k: keyof T & string;
  etiket: string;
  tur?: "metin" | "uzun" | "sayi" | "anahtar" | "secim" | "gorsel" | "satirlar";
  secenekler?: { deger: string; etiket: string }[];
  yer?: string;
  alt?: string;
  gizli?: (t: T) => boolean;
};

/** Alan listesinden form: değerler kayıt nesnesinde; "satirlar" alanı dizi ↔ satır satır metin */
export function Form<T extends Record<string, unknown>>({ alanlar, kayit, degisti }: { alanlar: FormAlan<T>[]; kayit: T; degisti: (k: keyof T & string, v: unknown) => void }) {
  return (
    <>
      {alanlar.filter((a) => !a.gizli?.(kayit)).map((a) => {
        const v = kayit[a.k];
        switch (a.tur ?? "metin") {
          case "anahtar":
            return <Anahtar key={a.k} etiket={a.etiket} alt={a.alt} deger={!!v} degisti={(x) => degisti(a.k, x)} />;
          case "secim":
            return <Secim key={a.k} etiket={a.etiket} secenekler={a.secenekler ?? []} deger={String(v ?? "")} degisti={(x) => degisti(a.k, x)} />;
          case "gorsel":
            return <GorselAlan key={a.k} etiket={a.etiket} deger={(v as string) ?? null} degisti={(x) => degisti(a.k, x)} />;
          case "satirlar":
            return <Alan key={a.k} etiket={a.etiket} value={Array.isArray(v) ? (v as string[]).join("\n") : String(v ?? "")} onChangeText={(x) => degisti(a.k, x.split("\n"))} multiline placeholder={a.yer ?? "Her satıra bir madde"} />;
          case "sayi":
            return <Alan key={a.k} etiket={a.etiket} value={v == null ? "" : String(v)} onChangeText={(x) => degisti(a.k, x.replace(",", "."))} keyboardType="decimal-pad" placeholder={a.yer} />;
          default:
            return <Alan key={a.k} etiket={a.etiket} value={String(v ?? "")} onChangeText={(x) => degisti(a.k, x)} multiline={a.tur === "uzun"} placeholder={a.yer} autoCapitalize={a.k.toLowerCase().includes("slug") || a.k.toLowerCase().includes("url") ? "none" : "sentences"} />;
        }
      })}
    </>
  );
}

type SatirBilgi = { baslik: string; alt?: string; ikon?: string; rozet?: { metin: string; ton?: Ton }; gorsel?: string | null };

/**
 * Web panelindeki "liste + düzenle" sayfalarının uygulamadaki karşılığı: arama, isteğe bağlı süzgeç, kayıt düzenleme alt sayfası,
 * yeni kayıt ve silme. Kaydet/sil sunucuya gider, sonra liste yenilenir.
 */
export function KayitEkrani<T extends { id: string }>(p: {
  baslik: string;
  alt?: string;
  q: { isPending: boolean; isRefetching: boolean; error: unknown; refetch: () => unknown; data?: unknown };
  anahtar: string[];
  veri: T[];
  ara?: (t: T) => string;
  satir: (t: T) => SatirBilgi;
  alanlar?: FormAlan<T & Record<string, unknown>>[];
  bos: string;
  yeni?: () => T;
  kaydet?: (t: T, yeni: boolean) => Promise<unknown>;
  sil?: (t: T) => Promise<unknown>;
  silUyari?: string;
  sec?: (t: T) => void;
  /** Yeni kayıt için kendi ekranı olanlarda (ör. blog yazısı) */
  ekle?: () => void;
  suzgec?: { secenekler: { deger: string; etiket: string; sayi?: number }[]; uygula: (t: T, d: string) => boolean; ilk?: string };
  ust?: ReactNode;
  formUst?: (t: T) => ReactNode;
  formAlt?: (t: T, degis: (k: string, v: unknown) => void, kapat: () => void) => ReactNode;
}) {
  const qc = useQueryClient();
  const [t, setT] = useState("");
  const [suz, setSuz] = useState(p.suzgec?.ilk ?? p.suzgec?.secenekler[0]?.deger ?? "");
  const [duz, setDuz] = useState<{ k: T; yeni: boolean } | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const liste = useMemo(() => {
    const a = t.trim().toLocaleLowerCase("tr-TR");
    return p.veri.filter((x) => (!p.suzgec || p.suzgec.uygula(x, suz)) && (!a || (p.ara ? p.ara(x) : p.satir(x).baslik).toLocaleLowerCase("tr-TR").includes(a)));
  }, [p.veri, t, suz, p.suzgec, p.ara, p.satir]);
  const tazele = () => qc.invalidateQueries({ queryKey: p.anahtar });
  const degis = (k: string, v: unknown) => setDuz((o) => (o ? { ...o, k: { ...o.k, [k]: v } } : o));
  const kaydet = async () => {
    if (!duz || !p.kaydet) return;
    setMesgul(true);
    try {
      await p.kaydet(duz.k, duz.yeni);
      await tazele();
      setDuz(null);
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const sil = (k: T) =>
    Alert.alert("Silinsin mi?", p.silUyari ?? "Bu kayıt kalıcı olarak silinir.", [
      { text: "Vazgeç" },
      { text: "Sil", style: "destructive", onPress: async () => {
        try {
          await p.sil!(k);
          await tazele();
          setDuz(null);
        } catch (e) {
          Alert.alert("Silinemedi", e instanceof Error ? e.message : "");
        }
      } },
    ]);
  const ac = (k: T) => (p.sec ? p.sec(k) : p.alanlar ? setDuz({ k: { ...k }, yeni: false }) : undefined);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={p.baslik} alt={p.alt ?? `${p.veri.length} kayıt`} geri sag={p.ekle ? <IkonDugme ikon="arti" etiket="Yeni" onPress={p.ekle} /> : p.yeni && p.kaydet ? <IkonDugme ikon="arti" etiket="Yeni" onPress={() => setDuz({ k: p.yeni!(), yeni: true })} /> : undefined} />
      <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
        <Arama deger={t} degisti={setT} />
        {p.suzgec ? <Segment secenekler={p.suzgec.secenekler} deger={suz} degisti={setSuz} /> : null}
      </View>
      <Liste q={p.q} veri={liste} anahtar={(x) => x.id} bos={p.bos} ust={p.ust ? <View style={{ padding: 16, paddingBottom: 4 }}>{p.ust}</View> : undefined} satir={(x) => {
        const s = p.satir(x);
        return (
          <Satir ikon={s.gorsel ? undefined : s.ikon ?? "belge"} baslik={s.baslik} alt={s.alt} onPress={p.sec || p.alanlar ? () => ac(x) : undefined} sag={s.rozet ? <Rozet metin={s.rozet.metin} ton={s.rozet.ton} /> : undefined} />
        );
      }} />
      {p.alanlar ? (
        <AltSayfa acik={!!duz} kapat={() => setDuz(null)} baslik={duz?.yeni ? "Yeni kayıt" : "Düzenle"}>
          {duz ? (
            <>
              {p.formUst?.(duz.k)}
              <Form alanlar={p.alanlar} kayit={duz.k as T & Record<string, unknown>} degisti={degis} />
              {p.formAlt?.(duz.k, degis, () => setDuz(null))}
              {p.kaydet ? <Dugme metin="Kaydet" ikon="tik" yukleniyor={mesgul} onPress={kaydet} /> : null}
              {!duz.yeni && p.sil ? <Dugme metin="Sil" tur="tehlike" onPress={() => sil(duz.k)} /> : null}
            </>
          ) : null}
        </AltSayfa>
      ) : null}
    </View>
  );
}
