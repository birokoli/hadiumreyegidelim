// Influencer ayrıntısı (web: /admin/influencers/[id]): kazanç özeti, telefonla gelen satışı elle ekleme, satışı tamamlama (komisyon
// kazanılır, puan verilir) ya da iade, program eşiğini kişiye özel değiştirme.
import { useState } from "react";
import { Alert, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import AltSayfa from "@/ui/AltSayfa";
import { Alan, Ayrac, Baslik, Bolum, Dugme, Ekran, Kart, Rozet, Sayac, Yazi, Yukleniyor } from "@/ui/temel";
import { tarih, usd, whatsappAc } from "@/ui/bicim";
import { BOSLUK, Y } from "@/tema";

type Satis = { id: string; musteri: string; telefon: string; paket: string | null; tutar: number; oran: number; komisyon: number; durum: string; tarih: string; not: string | null };
type Veri = { influencer: { id: string; fullName: string; phone: string; instagramHandle: string | null; uniqueCode: string; tier: string; status: string; totalSales: number; totalEarnings: number; pendingEarnings: number; totalClicks: number; baseThrOverride: number | null }; satislar: Satis[] };
const DURUM: Record<string, { ad: string; ton: "turuncu" | "yesil" | "mavi" | "gri" }> = { pending: { ad: "Bekliyor", ton: "turuncu" }, earned: { ad: "Kazanıldı", ton: "yesil" }, paid: { ad: "Ödendi", ton: "mavi" }, refunded: { ad: "İade", ton: "gri" } };

export default function InfluencerAyrinti() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["influencer", id], queryFn: () => istek<Veri>(`/api/mobil/influencer?id=${encodeURIComponent(id)}`) });
  const [yeni, setYeni] = useState<{ ad: string; tel: string; paket: string; tutar: string; not: string } | null>(null);
  const [esik, setEsik] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState<string | null>(null);
  const tazele = () => { qc.invalidateQueries({ queryKey: ["influencer", id] }); qc.invalidateQueries({ queryKey: ["influencerlar"] }); };
  const is = async (ad: string, f: () => Promise<unknown>) => {
    setMesgul(ad);
    try { await f(); tazele(); } catch (e) { Alert.alert("Olmadı", e instanceof Error ? e.message : ""); } finally { setMesgul(null); }
  };
  if (!q.data) return <View style={{ flex: 1 }}><Baslik baslik="Influencer" geri /><Yukleniyor /></View>;
  const i = q.data.influencer;
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={i.fullName} alt={`${i.uniqueCode} · ${i.tier}${i.instagramHandle ? ` · @${i.instagramHandle.replace(/^@/, "")}` : ""}`} geri />
      <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
          <Sayac etiket="Satış" deger={i.totalSales} ikon="tik" ton="yesil" />
          <Sayac etiket="Tıklama" deger={i.totalClicks} ikon="tikla" />
          <Sayac etiket="Toplam kazanç" deger={usd(i.totalEarnings)} ikon="fiyat2" />
          <Sayac etiket="Ödenecek" deger={usd(i.pendingEarnings)} ikon="odeme" ton={i.pendingEarnings ? "turuncu" : "mavi"} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Dugme metin="WhatsApp" ikon="whatsapp" tur="whatsapp" kucuk style={{ flex: 1 }} onPress={() => whatsappAc(i.phone)} />
          <Dugme metin="Satış ekle" ikon="arti" kucuk style={{ flex: 1 }} onPress={() => setYeni({ ad: "", tel: "", paket: "", tutar: "", not: "" })} />
        </View>
        <Kart style={{ gap: 8 }}>
          <Yazi tur="etiket">Program eşiği</Yazi>
          <Yazi tur="kucuk">{i.baseThrOverride != null ? `Kişiye özel eşik: ${i.baseThrOverride} satış` : "Genel kural geçerli (Affiliate → Program kuralları)"}</Yazi>
          <Dugme metin="Eşiği değiştir" kucuk tur="hafif" onPress={() => setEsik(i.baseThrOverride != null ? String(i.baseThrOverride) : "")} style={{ alignSelf: "flex-start" }} />
        </Kart>
        <Bolum baslik={`Satışlar (${q.data.satislar.length})`}>
          <Kart style={{ padding: 0, overflow: "hidden" }}>
            {q.data.satislar.map((s, n) => (
              <View key={s.id}>
                {n ? <Ayrac /> : null}
                <View style={{ padding: 14, gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Yazi style={{ flex: 1, fontFamily: Y.yari }}>{s.musteri}</Yazi>
                    <Rozet metin={DURUM[s.durum]?.ad ?? s.durum} ton={DURUM[s.durum]?.ton ?? "gri"} />
                  </View>
                  <Yazi tur="kucuk">{`${tarih(s.tarih, true)} · ${usd(s.tutar)} · komisyon %${Math.round(s.oran * 1000) / 10} = ${usd(s.komisyon)}${s.paket ? ` · ${s.paket}` : ""}`}</Yazi>
                  {s.not ? <Yazi tur="kucuk">{s.not}</Yazi> : null}
                  {s.durum === "pending" ? (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Dugme metin="Tamamlandı" ikon="tik" kucuk yukleniyor={mesgul === `t${s.id}`} onPress={() => Alert.alert("Satış tamamlansın mı?", "Komisyon kazanılmış sayılır ve puan verilir.", [{ text: "Vazgeç" }, { text: "Tamamla", onPress: () => is(`t${s.id}`, () => istek(`/api/admin/influencers/${i.id}/sales`, { method: "PATCH", govde: { saleId: s.id, action: "complete" } })) }])} />
                      <Dugme metin="İade" kucuk tur="tehlike" yukleniyor={mesgul === `i${s.id}`} onPress={() => Alert.alert("Satış iade edilsin mi?", "", [{ text: "Vazgeç" }, { text: "İade", style: "destructive", onPress: () => is(`i${s.id}`, () => istek(`/api/admin/influencers/${i.id}/sales`, { method: "PATCH", govde: { saleId: s.id, action: "refund" } })) }])} />
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
            {!q.data.satislar.length ? <View style={{ padding: 16 }}><Yazi tur="kucuk">Henüz satış yok.</Yazi></View> : null}
          </Kart>
        </Bolum>
      </Ekran>
      <AltSayfa acik={!!yeni} kapat={() => setYeni(null)} baslik="Telefonla gelen satış">
        <Alan etiket="Müşteri adı" value={yeni?.ad ?? ""} onChangeText={(ad) => setYeni((o) => (o ? { ...o, ad } : o))} />
        <Alan etiket="Müşteri telefonu" value={yeni?.tel ?? ""} keyboardType="phone-pad" onChangeText={(tel) => setYeni((o) => (o ? { ...o, tel } : o))} />
        <Alan etiket="Paket / dosya no" value={yeni?.paket ?? ""} onChangeText={(paket) => setYeni((o) => (o ? { ...o, paket } : o))} />
        <Alan etiket="Satış tutarı" value={yeni?.tutar ?? ""} keyboardType="decimal-pad" onChangeText={(tutar) => setYeni((o) => (o ? { ...o, tutar } : o))} />
        <Alan etiket="Not" value={yeni?.not ?? ""} onChangeText={(not) => setYeni((o) => (o ? { ...o, not } : o))} />
        <Dugme metin="Satışı ekle" yukleniyor={mesgul === "ekle"} devreDisi={!yeni?.ad.trim() || !yeni?.tel.trim() || !Number(yeni?.tutar.replace(",", "."))} onPress={() => yeni && is("ekle", async () => {
          await istek(`/api/admin/influencers/${i.id}/sales`, { govde: { customerName: yeni.ad.trim(), customerPhone: yeni.tel.trim(), umrePackage: yeni.paket.trim() || undefined, saleAmount: Number(yeni.tutar.replace(",", ".")), notes: yeni.not.trim() || undefined } });
          setYeni(null);
        })} />
      </AltSayfa>
      <AltSayfa acik={esik != null} kapat={() => setEsik(null)} baslik="Program eşiği">
        <Yazi tur="kucuk">Bu influencer için programın açılacağı satış sayısı. Boş bırakırsanız genel kural geçerli olur.</Yazi>
        <Alan etiket="Eşik (satış)" value={esik ?? ""} keyboardType="number-pad" onChangeText={setEsik} />
        <Dugme metin="Kaydet" yukleniyor={mesgul === "esik"} onPress={() => is("esik", async () => { await istek(`/api/admin/influencers/${i.id}/affiliate/threshold`, { govde: { override: esik?.trim() ? Number(esik) : null } }); setEsik(null); })} />
      </AltSayfa>
    </View>
  );
}
