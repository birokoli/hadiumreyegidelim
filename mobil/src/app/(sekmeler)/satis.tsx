// Satış Masası listesi: aşamaya göre süzme, arama (ad, numara, telefon), son güncellenen üstte. Tablette iki sütun.
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDosyalar } from "@/veri/sorgular";
import { ASAMALAR, asamaLabel, genelToplam, gunKaldi, odenen, usd } from "@ortak/ortak";
import { Arama, Baslik, Bos, HataKutusu, Kart, Rozet, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import Fab from "@/ui/Fab";
import { asamaTonu } from "@/ui/asama";
import { goreli, tarih } from "@/ui/bicim";
import Ikon from "@/ikonlar/Ikon";
import { BOSLUK, R, TABLET_ESIK, Y } from "@/tema";

type Suzgec = "aktif" | "tumu" | (typeof ASAMALAR)[number]["key"] | "iptal";

export default function Satis() {
  const p = useLocalSearchParams<{ asama?: string }>();
  const [suz, setSuz] = useState<Suzgec>((p.asama as Suzgec) || "aktif");
  const [ara, setAra] = useState("");
  const q = useDosyalar();
  const { width } = useWindowDimensions();
  const sutun = width >= TABLET_ESIK + 200 ? 2 : 1;

  const liste = useMemo(() => {
    const t = ara.trim().toLocaleLowerCase("tr-TR");
    const rakam = t.replace(/\D/g, "");
    return (q.data?.dosyalar ?? []).filter((d) => {
      if (suz === "aktif" ? d.status === "iptal" || d.status === "tamamlandi" : suz !== "tumu" && d.status !== suz) return false;
      if (!t) return true;
      return d.data.musteriAdi.toLocaleLowerCase("tr-TR").includes(t) || d.no.toLowerCase().includes(t) || (rakam.length >= 4 && String(d.phone ?? "").replace(/\D/g, "").includes(rakam));
    });
  }, [q.data, suz, ara]);

  const say = (k: string) => (q.data?.dosyalar ?? []).filter((d) => d.status === k).length;
  const secenekler = [
    { deger: "aktif" as Suzgec, etiket: "Aktif" },
    ...ASAMALAR.map((a) => ({ deger: a.key as Suzgec, etiket: a.label, sayi: say(a.key) || undefined })),
    { deger: "iptal" as Suzgec, etiket: "İptal" },
    { deger: "tumu" as Suzgec, etiket: "Tümü" },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Satış Masası" alt={q.data ? `${liste.length} dosya` : undefined} />
      <View style={{ paddingHorizontal: BOSLUK.l, gap: BOSLUK.s, paddingBottom: BOSLUK.s }}>
        <Arama deger={ara} degisti={setAra} yer="Ad, dosya no ya da telefon" />
        <Segment secenekler={secenekler} deger={suz} degisti={setSuz} />
      </View>
      {q.isPending && !q.data ? (
        <Yukleniyor />
      ) : (
        <FlatList
          key={sutun}
          data={liste}
          numColumns={sutun}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ padding: BOSLUK.l, paddingTop: BOSLUK.s, gap: BOSLUK.m, paddingBottom: 100 }}
          columnWrapperStyle={sutun > 1 ? { gap: BOSLUK.m } : undefined}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[R.lacivert]} />}
          ListHeaderComponent={q.error && !q.data ? <HataKutusu hata={q.error} tekrar={q.refetch} /> : undefined}
          ListEmptyComponent={<Bos ikon="dosya" baslik={ara ? "Sonuç yok" : "Bu aşamada dosya yok"} />}
          renderItem={({ item: d }) => {
            const top = genelToplam(d.data);
            const od = odenen(d.data);
            const kalan = gunKaldi(d.data.gidis);
            const ac = q.data?.acilis?.[d.id];
            return (
              <Kart onPress={() => router.push(`/satis/${d.no}`)} style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Yazi tur="altBaslik" satir={1}>{d.data.musteriAdi}</Yazi>
                    <Yazi tur="kucuk">{d.no} · {goreli(d.updatedAt)}</Yazi>
                  </View>
                  <Rozet metin={asamaLabel(d.status)} ton={asamaTonu(d.status)} />
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 2 }}>
                  {d.data.gidis ? (
                    <Bilgi ikon="takvim2" metin={`${tarih(d.data.gidis)}${kalan != null && kalan >= 0 && kalan <= 60 ? ` · ${kalan} gün` : ""}`} />
                  ) : null}
                  <Bilgi ikon="kullanicilar" metin={`${d.data.yetiskin + d.data.cocuk} kişi`} />
                  {top > 0 ? <Bilgi ikon="odeme" metin={`${usd(od)} / ${usd(top)}`} vurgu={od + 0.5 >= top ? R.yesil : undefined} /> : null}
                  {ac?.sayi ? <Bilgi ikon="goz" metin={`Teklif ${ac.sayi} kez açıldı`} /> : null}
                </View>
              </Kart>
            );
          }}
        />
      )}
      <Fab etiket="Yeni dosya" onPress={() => router.push("/satis/yeni")} />
    </View>
  );
}

function Bilgi({ ikon, metin, vurgu }: { ikon: string; metin: string; vurgu?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Ikon ad={ikon} boyut={16} renk={vurgu ?? R.metin} />
      <Yazi tur="kucuk" style={vurgu ? { color: vurgu, fontFamily: Y.yari } : undefined}>{metin}</Yazi>
    </View>
  );
}
