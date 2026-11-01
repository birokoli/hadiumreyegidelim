// Affiliate programı (web: /admin/affiliate): program kuralları, dönem puanlarını hesaplama, influencer'a yıldız ekleme / düşme.
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useInfluencerlar } from "@/veri/sorgular";
import { Alan, Ayrac, Baslik, Bolum, Dugme, Ekran, Kart, Satir, Yazi, Yukleniyor } from "@/ui/temel";
import AltSayfa from "@/ui/AltSayfa";
import { Arama } from "@/ui/temel";

type Ayar = Record<string, number>;
const ALAN: { k: string; etiket: string }[] = [
  { k: "baseThreshold", etiket: "Program açılış eşiği (geçerli satış)" }, { k: "referralReduction", etiket: "Davet başına eşikten düşülen" }, { k: "minThreshold", etiket: "En düşük eşik" },
  { k: "startRate", etiket: "Başlangıç komisyonu (%)" }, { k: "maxRate", etiket: "En yüksek komisyon (%)" },
  { k: "weightCvr", etiket: "Puan ağırlığı: dönüşüm" }, { k: "weightVolume", etiket: "Puan ağırlığı: hacim" }, { k: "weightCtr", etiket: "Puan ağırlığı: tıklama" },
  { k: "starToTry", etiket: "1 yıldız kaç TL" }, { k: "minWithdrawTry", etiket: "En az çekim (TL)" }, { k: "refundWindowDays", etiket: "İade süresi (gün)" }, { k: "attributionWindowDays", etiket: "Yönlendirme süresi (gün)" },
];
type Puan = { influencerId: string; score: number; commissionRate: number; influencer?: { fullName: string; uniqueCode: string } | null };
const buAy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`; };

export default function Affiliate() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["affiliate"], queryFn: () => istek<{ config: Ayar }>("/api/admin/affiliate/config") });
  const inf = useInfluencerlar();
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => { if (q.data) setForm(Object.fromEntries(ALAN.map((a) => [a.k, String(q.data!.config[a.k] ?? "")]))); }, [q.data]);
  const [puanlar, setPuanlar] = useState<Puan[] | null>(null);
  const [donem, setDonem] = useState(buAy());
  const [mesgul, setMesgul] = useState<string | null>(null);
  const [yildiz, setYildiz] = useState<{ id: string; ad: string; delta: string; not: string } | null>(null);
  const [ara, setAra] = useState("");
  const is = async (ad: string, f: () => Promise<unknown>) => {
    setMesgul(ad);
    try { await f(); } catch (e) { Alert.alert("Olmadı", e instanceof Error ? e.message : ""); } finally { setMesgul(null); }
  };
  if (q.isPending) return <View style={{ flex: 1 }}><Baslik baslik="Affiliate" geri /><Yukleniyor /></View>;
  const infListe = (inf.data?.influencers ?? []).filter((i) => !ara || i.fullName.toLocaleLowerCase("tr-TR").includes(ara.toLocaleLowerCase("tr-TR")));
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Affiliate" alt="Program kuralları ve puanlar" geri />
      <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
        <Bolum baslik="Dönem puanları">
          <Kart style={{ gap: 10 }}>
            <Alan etiket="Dönem (YYYY-AA-01)" value={donem} onChangeText={setDonem} autoCapitalize="none" />
            <Dugme metin="Puanları hesapla" ikon="yenile" yukleniyor={mesgul === "puan"} onPress={() => is("puan", async () => {
              const r = await istek<{ results: Puan[]; count: number }>("/api/admin/affiliate/compute", { govde: { period: donem } });
              setPuanlar(r.results ?? []);
            })} />
            {puanlar ? (puanlar.length ? puanlar.map((p) => (
              <View key={p.influencerId} style={{ flexDirection: "row", gap: 8 }}>
                <Yazi style={{ flex: 1 }}>{p.influencer?.fullName ?? p.influencerId}</Yazi>
                <Yazi tur="kucuk">{`puan ${Math.round(p.score * 100) / 100} · %${p.commissionRate}`}</Yazi>
              </View>
            )) : <Yazi tur="kucuk">Bu dönemde puanlanacak influencer yok.</Yazi>) : null}
          </Kart>
        </Bolum>
        <Bolum baslik="Yıldız ekle / düş">
          <Arama deger={ara} degisti={setAra} yer="Influencer ara" />
          <Kart style={{ padding: 0, overflow: "hidden" }}>
            {infListe.slice(0, 30).map((i, n) => (
              <View key={i.id}>
                {n ? <Ayrac /> : null}
                <Satir ikon="yildiz2" baslik={i.fullName} alt={`${i.uniqueCode} · ${i.totalSales} satış`} onPress={() => setYildiz({ id: i.id, ad: i.fullName, delta: "", not: "" })} />
              </View>
            ))}
          </Kart>
        </Bolum>
        <Bolum baslik="Program kuralları">
          <Kart style={{ gap: 10 }}>
            {ALAN.map((a) => <Alan key={a.k} etiket={a.etiket} value={form[a.k] ?? ""} onChangeText={(v) => setForm((o) => ({ ...o, [a.k]: v.replace(",", ".") }))} keyboardType="decimal-pad" />)}
            <Dugme metin="Kuralları kaydet" ikon="tik" yukleniyor={mesgul === "ayar"} onPress={() => is("ayar", async () => {
              await istek("/api/admin/affiliate/config", { method: "PUT", govde: Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)])) });
              await qc.invalidateQueries({ queryKey: ["affiliate"] });
              Alert.alert("Kaydedildi");
            })} />
          </Kart>
        </Bolum>
      </Ekran>
      <AltSayfa acik={!!yildiz} kapat={() => setYildiz(null)} baslik={yildiz?.ad ?? ""}>
        <Alan etiket="Yıldız (eksi değer düşer)" value={yildiz?.delta ?? ""} onChangeText={(delta) => setYildiz((o) => (o ? { ...o, delta } : o))} keyboardType="numbers-and-punctuation" />
        <Alan etiket="Not (zorunlu)" value={yildiz?.not ?? ""} onChangeText={(not) => setYildiz((o) => (o ? { ...o, not } : o))} />
        <Dugme metin="Uygula" yukleniyor={mesgul === "yildiz"} devreDisi={!yildiz?.delta || !yildiz?.not.trim()} onPress={() => yildiz && is("yildiz", async () => {
          await istek("/api/admin/affiliate/stars", { govde: { influencerId: yildiz.id, delta: Number(yildiz.delta), note: yildiz.not.trim() } });
          setYildiz(null);
          Alert.alert("Yıldız güncellendi");
        })} />
      </AltSayfa>
    </View>
  );
}
