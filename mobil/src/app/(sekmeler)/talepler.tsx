// Talepler: iletişim formu ve planlayıcıdan gelenler (Gelen Kutusu), CRM, müşteri havuzu. Ramazan ayrı ekranda.
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { useCrm, useHavuz, useIletisim } from "@/veri/sorgular";
import { Arama, Ayrac, Baslik, Bos, Dugme, HataKutusu, Rozet, Satir, Segment, Yukleniyor } from "@/ui/temel";
import { goreli } from "@/ui/bicim";
import { BOSLUK, R } from "@/tema";

type Sekme = "gelen" | "crm" | "havuz";
const CRM_ASAMA: Record<string, string> = { NEW: "Yeni", IN_DISCUSSION: "Görüşmede", QUOTATION_SENT: "Teklif gönderildi", WON: "Kazanıldı", LOST: "Kaybedildi" };

export default function Talepler() {
  const [sekme, setSekme] = useState<Sekme>("gelen");
  const [ara, setAra] = useState("");
  const gelen = useIletisim();
  const crm = useCrm();
  const havuz = useHavuz();
  const q = sekme === "gelen" ? gelen : sekme === "crm" ? crm : havuz;
  const t = ara.trim().toLocaleLowerCase("tr-TR");
  const uy = (...s: (string | null | undefined)[]) => !t || s.some((x) => String(x ?? "").toLocaleLowerCase("tr-TR").includes(t));

  const satirlar = useMemo(() => {
    if (sekme === "gelen") return (gelen.data ?? []).filter((c) => uy(c.name, c.phone, c.package, c.message)).map((c) => ({ id: c.id, ikon: "gelen", baslik: c.name, alt: `${c.package ?? "İletişim formu"} · ${goreli(c.createdAt)}`, rozet: c.status === "UNREAD" ? <Rozet metin="Yeni" ton="kirmizi" /> : c.status === "RESOLVED" ? <Rozet metin="Çözüldü" ton="gri" /> : <Rozet metin="Görüşüldü" ton="yesil" />, yol: `/talepler/${c.id}` }));
    if (sekme === "crm") return (crm.data?.leads ?? []).filter((c) => uy(c.name, c.phone, c.email)).map((c) => ({ id: c.id, ikon: "kullanici", baslik: c.name, alt: `${c.preferredPackage ?? c.source} · ${goreli(c.updatedAt)}`, rozet: <Rozet metin={CRM_ASAMA[c.stage] ?? c.stage} ton={c.stage === "WON" ? "yesil" : c.stage === "LOST" ? "gri" : "mavi"} />, yol: `/crm/${c.id}` }));
    return (havuz.data?.leads ?? []).filter((c) => uy(c.name, c.email, c.phone)).map((c) => ({ id: c.id, ikon: "eposta", baslik: c.name || c.email, alt: `${c.source} · ${goreli(c.createdAt)}${c.marketingConsent ? " · izinli" : ""}`, rozet: c.status === "new" ? <Rozet metin="Yeni" ton="turuncu" /> : undefined, yol: `/havuz/${c.id}` }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sekme, gelen.data, crm.data, havuz.data, t]);

  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Talepler" sag={<Dugme metin="Ramazan" ikon="kabe" kucuk tur="hafif" onPress={() => router.push("/ramazan")} />} />
      <View style={{ paddingHorizontal: BOSLUK.l, gap: BOSLUK.s, paddingBottom: BOSLUK.s }}>
        <Arama deger={ara} degisti={setAra} yer="Ad, telefon, e-posta" />
        <Segment secenekler={[{ deger: "gelen", etiket: "Gelen kutusu", sayi: (gelen.data ?? []).filter((c) => c.status === "UNREAD").length || undefined }, { deger: "crm", etiket: "CRM" }, { deger: "havuz", etiket: "Müşteri havuzu" }]} deger={sekme} degisti={setSekme} />
      </View>
      {q.isPending && !q.data ? <Yukleniyor /> : (
        <FlatList
          data={satirlar}
          keyExtractor={(s) => s.id}
          ItemSeparatorComponent={Ayrac}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[R.lacivert]} />}
          ListHeaderComponent={q.error && !q.data ? <View style={{ padding: 16 }}><HataKutusu hata={q.error} tekrar={q.refetch} /></View> : undefined}
          ListEmptyComponent={<Bos ikon="gelen" baslik={t ? "Sonuç yok" : "Kayıt yok"} />}
          renderItem={({ item: s }) => <Satir ikon={s.ikon} baslik={s.baslik} alt={s.alt} sag={s.rozet} onPress={() => router.push(s.yol as never)} />}
        />
      )}
    </View>
  );
}
