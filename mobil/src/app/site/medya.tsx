// Medya (web: /admin/media): sitedeki yüklü görseller; yükle, adresini kopyala, sil.
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, RefreshControl, View, useWindowDimensions } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { gorselSecVeYukle } from "@/ui/form";
import AltSayfa from "@/ui/AltSayfa";
import { Arama, Baslik, Bos, Dugme, IkonDugme, Yazi, Yukleniyor, HataKutusu } from "@/ui/temel";
import { tarih } from "@/ui/bicim";
import { KOSE, R } from "@/tema";

type Dosya = { id: string; ad: string; url: string; boyut: number; tur: string; tarih: string };
const boyut = (b: number) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export default function Medya() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["medya"], queryFn: () => istek<{ dosyalar: Dosya[] }>("/api/mobil/medya") });
  const [t, setT] = useState("");
  const [ac, setAc] = useState<Dosya | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const { width } = useWindowDimensions();
  const sutun = width >= 900 ? 5 : width >= 600 ? 4 : 3;
  const kenar = (width - 32 - (sutun - 1) * 8) / sutun;
  const liste = useMemo(() => (q.data?.dosyalar ?? []).filter((d) => !t || d.ad.toLowerCase().includes(t.toLowerCase())), [q.data, t]);
  const yukle = async () => {
    setYukleniyor(true);
    try {
      const url = await gorselSecVeYukle();
      if (url) {
        await qc.invalidateQueries({ queryKey: ["medya"] });
        await Clipboard.setStringAsync(url);
        Alert.alert("Yüklendi", "Adres panoya kopyalandı.");
      }
    } catch (e) {
      Alert.alert("Yüklenemedi", e instanceof Error ? e.message : "");
    } finally {
      setYukleniyor(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Medya" alt={`${q.data?.dosyalar.length ?? 0} dosya`} geri sag={<IkonDugme ikon="arti" etiket="Görsel yükle" onPress={yukle} />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}><Arama deger={t} degisti={setT} yer="Dosya adı" /></View>
      {yukleniyor ? <Yazi tur="kucuk" style={{ paddingHorizontal: 16 }}>Yükleniyor…</Yazi> : null}
      {q.isPending ? <Yukleniyor /> : (
        <FlatList
          data={liste}
          key={sutun}
          numColumns={sutun}
          keyExtractor={(d) => d.id}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[R.lacivert]} />}
          ListHeaderComponent={q.error ? <HataKutusu hata={q.error} tekrar={q.refetch} /> : undefined}
          ListEmptyComponent={<Bos ikon="kamera" baslik="Dosya yok" />}
          renderItem={({ item: d }) => (
            <Pressable onPress={() => setAc(d)} style={{ width: kenar, height: kenar, borderRadius: KOSE.s, overflow: "hidden", backgroundColor: R.maviZemin, alignItems: "center", justifyContent: "center" }}>
              {d.tur.startsWith("image/") ? <Image source={{ uri: d.url }} style={{ width: "100%", height: "100%" }} /> : <Yazi tur="kucuk">{d.ad.split(".").pop()?.toUpperCase()}</Yazi>}
            </Pressable>
          )}
        />
      )}
      <AltSayfa acik={!!ac} kapat={() => setAc(null)} baslik={ac?.ad ?? ""}>
        {ac ? (
          <>
            {ac.tur.startsWith("image/") ? <Image source={{ uri: ac.url }} style={{ width: "100%", height: 260, borderRadius: 12 }} resizeMode="contain" /> : null}
            <Yazi tur="kucuk">{`${boyut(ac.boyut)} · ${ac.tur} · ${tarih(ac.tarih, true)}`}</Yazi>
            <Dugme metin="Adresi kopyala" ikon="kopyala" onPress={async () => { await Clipboard.setStringAsync(ac.url); Alert.alert("Kopyalandı"); }} />
            <Dugme metin="Sil" tur="tehlike" onPress={() => Alert.alert("Dosya silinsin mi?", "Sitede kullanılıyorsa görsel kırık görünür. Geri alınamaz.", [{ text: "Vazgeç" }, { text: "Sil", style: "destructive", onPress: async () => {
              try {
                await istek("/api/admin/media", { method: "DELETE", govde: { fileName: ac.ad } });
                await qc.invalidateQueries({ queryKey: ["medya"] });
                setAc(null);
              } catch (e) {
                Alert.alert("Silinemedi", e instanceof Error ? e.message : "");
              }
            } }])} />
          </>
        ) : null}
      </AltSayfa>
    </View>
  );
}
