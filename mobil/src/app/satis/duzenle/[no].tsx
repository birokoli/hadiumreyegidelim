// Teklif düzenleme (web: /admin/satis/[no] → Teklif, Ödeme, Müşteri sekmeleri): yolcular ve tarihler, kalemler (kütüphaneden ya da
// boş), KDV, indirim (tutar ya da kârın yüzdesi), geçerlilik ve not, seçenekler (2. ve 3. teklif), ödeme planı, alınan ödemeleri
// silme ve müşteri iletişimi. Kaydet bütün veriyi gönderir; kaldırılan değerler 0 / [] / null olarak gider (undefined JSON'da düşer).
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useDosya, type DosyaAyrinti } from "@/veri/sorgular";
import {
  KALEM_TURLERI, KART_PAYI, KDV_ETIKETI, KDV_ORANI, SATIS_TURLERI, SECENEK_SINIRI, alisToplam, araToplam, genelToplam, indirimGenel, indirimOf, kalemToplam, kartla,
  kdvTutari, odemeDagilimi, secenekUygula, tarihTers, toplam, trTarih, usd, type DosyaData, type Kalem, type KalemTur, type Secenek,
} from "@ortak/ortak";
import { ZIYARET_ROTALARI } from "@ortak/ziyaret";
import KalemDuzenle, { kalemOzet } from "@/ui/KalemDuzenle";
import AltSayfa from "@/ui/AltSayfa";
import { Anahtar, Secim } from "@/ui/form";
import { Alan, Arama, Ayrac, Baslik, Bolum, Cip, Dugme, Ekran, Kart, Rozet, Satir, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { R, Y } from "@/tema";

const uid = () => Math.random().toString(36).slice(2, 10);
const KUT_TUR: Record<string, KalemTur> = { vize: "vize", hotel: "otel_mekke", transfer: "transfer", tur: "tur", flight: "diger", extra: "diger" };
type Duzen = { yer: "ana" | string; kalem: Kalem; yeni: boolean } | null;
type Kutuphane = DosyaAyrinti["kutuphane"][number] & { sehir?: string | null };

export default function TeklifDuzenle() {
  const { no } = useLocalSearchParams<{ no: string }>();
  const q = useDosya(no);
  const qc = useQueryClient();
  const [x, setX] = useState<DosyaData | null>(null);
  const [kisi, setKisi] = useState({ email: "", phone: "", sorumluId: "" });
  useEffect(() => {
    if (q.data && !x) {
      setX(q.data.dosya.data);
      setKisi({ email: q.data.dosya.email ?? "", phone: q.data.dosya.phone ?? "", sorumluId: q.data.dosya.sorumluId ?? "" });
    }
  }, [q.data, x]);
  const [sekme, setSekme] = useState<"teklif" | "secenek" | "odeme" | "musteri">("teklif");
  const [duzen, setDuzen] = useState<Duzen>(null);
  const [kut, setKut] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const ilk = q.data?.dosya;
  const kirli = useMemo(() => !!x && !!ilk && (JSON.stringify(x) !== JSON.stringify(ilk.data) || kisi.email !== (ilk.email ?? "") || kisi.phone !== (ilk.phone ?? "") || kisi.sorumluId !== (ilk.sorumluId ?? "")), [x, ilk, kisi]);
  if (!x || !q.data) return <View style={{ flex: 1 }}><Baslik baslik={no} geri /><Yukleniyor /></View>;
  const set = <K extends keyof DosyaData>(k: K, v: DosyaData[K]) => setX({ ...x, [k]: v });
  const kisiSayisi = x.yetiskin + x.cocuk;
  const secs = x.secenekler ?? [];
  const setSecs = (l: Secenek[]) => set("secenekler", l);
  const setSec = (id: string, p: Partial<Secenek>) => setSecs(secs.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const onerilen = x.onerilen ?? "ana";
  // Önce gidilen şehrin oteli gidişle başlar, sonraki şehrin oteli dönüşle biter (web ile aynı kural)
  const otelTarihleri = (tur: KalemTur, mevcut: Kalem[]) => {
    const ilkSehir = (x.onceSehir ?? "mekke") === "medine" ? "otel_medine" : "otel_mekke";
    const obur = mevcut.find((k) => k.tur.startsWith("otel_") && k.tur !== tur);
    return tur === ilkSehir ? { giris: x.gidis, cikis: obur?.otel?.giris } : { giris: mevcut.find((k) => k.tur === ilkSehir)?.otel?.cikis, cikis: x.donus };
  };
  const yeniKalem = (tur: KalemTur, mevcut: Kalem[], ek: Partial<Kalem> = {}): Kalem => {
    const k: Kalem = { id: uid(), tur, ad: KALEM_TURLERI[tur].label, adet: tur.startsWith("otel_") ? 1 : ["vize", "tren"].includes(tur) ? kisiSayisi || 1 : 1, birim: 0, ...ek };
    if (tur.startsWith("otel_")) k.otel = { ad: "", ...otelTarihleri(tur, mevcut), oda: "" };
    return k;
  };
  const kalemKaydet = (k: Kalem) => {
    if (!duzen) return;
    if (duzen.yer === "ana") set("kalemler", duzen.yeni ? [...x.kalemler, k] : x.kalemler.map((y) => (y.id === k.id ? k : y)));
    else {
      const sc = secs.find((s) => s.id === duzen.yer);
      if (sc) {
        const alan = k.tur === "transfer" ? "transferler" : "oteller";
        const liste = (sc[alan] ?? []) as Kalem[];
        setSec(sc.id, { [alan]: duzen.yeni ? [...liste, k] : liste.map((y) => (y.id === k.id ? k : y)) });
      }
    }
    setDuzen(null);
  };
  const kalemSil = () => {
    if (!duzen) return;
    if (duzen.yer === "ana") set("kalemler", x.kalemler.filter((y) => y.id !== duzen.kalem.id));
    else {
      const sc = secs.find((s) => s.id === duzen.yer);
      if (sc) setSec(sc.id, { oteller: sc.oteller.filter((y) => y.id !== duzen.kalem.id), transferler: sc.transferler?.filter((y) => y.id !== duzen.kalem.id) });
    }
    setDuzen(null);
  };
  const kaydet = async () => {
    setMesgul(true);
    try {
      const v = await istek<DosyaAyrinti>(`/api/admin/satis/${encodeURIComponent(no)}`, { method: "PUT", govde: { data: x, ...kisi, bildir: false } });
      qc.setQueryData(["satis", no], (eski: DosyaAyrinti | undefined) => ({ ...eski!, ...v }));
      qc.invalidateQueries({ queryKey: ["satis"] });
      setX(v.dosya.data);
      Alert.alert("Kaydedildi");
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const ozet = (dd: DosyaData) => {
    const g = genelToplam(dd);
    const a = alisToplam(dd);
    return { g, kisi: kisiSayisi ? g / kisiSayisi : g, kar: toplam(dd) - a, a };
  };
  const ana = ozet(x);
  const kutListe = (q.data.kutuphane as Kutuphane[]).filter((s) => !kut || s.ad.toLocaleLowerCase("tr-TR").includes(kut.toLocaleLowerCase("tr-TR"))).slice(0, 40);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Teklifi düzenle" alt={`${x.musteriAdi} · ${no}`} geri />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Segment secenekler={[{ deger: "teklif", etiket: "Teklif" }, { deger: "secenek", etiket: `Seçenekler${secs.length ? ` · ${secs.length + 1}` : ""}` }, { deger: "odeme", etiket: "Ödeme" }, { deger: "musteri", etiket: "Müşteri" }]} deger={sekme} degisti={setSekme} />
      </View>
      <Ekran>
        {sekme === "teklif" ? (
          <>
            <Bolum baslik="Yolcular ve tarihler">
              <Kart style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Alan etiket="Yetişkin" value={String(x.yetiskin)} keyboardType="number-pad" onChangeText={(v) => set("yetiskin", Number(v) || 1)} /></View>
                  <View style={{ flex: 1 }}><Alan etiket="Çocuk" value={String(x.cocuk)} keyboardType="number-pad" onChangeText={(v) => set("cocuk", Number(v) || 0)} /></View>
                  <View style={{ flex: 1 }}><Alan etiket="Bebek" value={String(x.bebek)} keyboardType="number-pad" onChangeText={(v) => set("bebek", Number(v) || 0)} /></View>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Alan etiket="Gidiş (YYYY-AA-GG)" value={x.gidis ?? ""} autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={(v) => set("gidis", v.trim())} /></View>
                  <View style={{ flex: 1 }}><Alan etiket="Dönüş" value={x.donus ?? ""} autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={(v) => set("donus", v.trim())} /></View>
                </View>
                {tarihTers(x.gidis, x.donus) ? <Yazi tur="kucuk" renk={R.kirmizi}>{`Dönüş gidişten önce görünüyor (${trTarih(x.gidis)} → ${trTarih(x.donus)}).`}</Yazi> : null}
                <Secim etiket="Önce" secenekler={[{ deger: "mekke", etiket: "Mekke" }, { deger: "medine", etiket: "Medine" }]} deger={x.onceSehir ?? "mekke"} degisti={(v) => set("onceSehir", v)} />
                <Secim etiket="Satış türü" secenekler={Object.entries(SATIS_TURLERI).map(([k, v]) => ({ deger: k, etiket: v }))} deger={x.satisTuru ?? "01"} degisti={(v) => set("satisTuru", v as DosyaData["satisTuru"])} />
                {x.talepNotu ? <Yazi tur="kucuk">{`Talep notu: ${x.talepNotu}`}</Yazi> : null}
              </Kart>
            </Bolum>
            <Bolum baslik={`Kalemler (${x.kalemler.length})`}>
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {x.kalemler.length ? x.kalemler.map((k, i) => (
                  <View key={k.id}>
                    {i ? <Ayrac /> : null}
                    <Satir ikon={KALEM_TURLERI[k.tur]?.ikon ?? "paket"} baslik={k.ad || KALEM_TURLERI[k.tur].label} alt={kalemOzet(k)} sag={<Yazi style={{ fontFamily: Y.kalin }}>{usd(kalemToplam(k))}</Yazi>} onPress={() => setDuzen({ yer: "ana", kalem: k, yeni: false })} />
                  </View>
                )) : <View style={{ padding: 16 }}><Yazi tur="kucuk">Aşağıdan otel, vize, transfer ve diğer kalemleri ekleyin.</Yazi></View>}
              </Kart>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(Object.keys(KALEM_TURLERI) as KalemTur[]).flatMap((t) => t === "tur"
                  ? (["mekke", "medine"] as const).map((r) => <Cip key={`tur-${r}`} metin={`+ ${ZIYARET_ROTALARI[r].ad}`} secili={false} onPress={() => setDuzen({ yer: "ana", yeni: true, kalem: yeniKalem("tur", x.kalemler, { rota: r, ad: ZIYARET_ROTALARI[r].ad }) })} />)
                  : [<Cip key={t} metin={`+ ${KALEM_TURLERI[t].label}`} secili={false} onPress={() => setDuzen({ yer: "ana", yeni: true, kalem: yeniKalem(t, x.kalemler) })} />])}
                {q.data.kutuphane.length ? <Cip metin="+ Kütüphaneden" secili={false} onPress={() => setKut("")} /> : null}
              </View>
            </Bolum>
            <Bolum baslik="Toplam">
              <Kart style={{ gap: 8 }}>
                <Anahtar etiket={`Fiyatlara ${KDV_ETIKETI} ekle`} alt={`Kalemler KDV hariç girilir; kartla ödemede ayrıca %${Math.round(KART_PAYI * 100)} kart payı`} deger={!!x.kdv} degisti={(v) => set("kdv", v)} />
                <Tutar etiket="KDV hariç" deger={usd(toplam(x))} />
                {x.kdv ? <Tutar etiket={`KDV (%${Math.round(KDV_ORANI * 100)})`} deger={usd(kdvTutari(x))} /> : null}
                <Tutar etiket="Toplam · havale / EFT" deger={usd(ana.g)} kalin />
                <Tutar etiket="Toplam · kartla" deger={usd(kartla(ana.g))} />
                <Tutar etiket="Kişi başı (havale)" deger={kisiSayisi ? usd(ana.g / kisiSayisi) : "—"} />
                <Tutar etiket="Alış" deger={ana.a ? usd(ana.a) : "—"} />
                <Tutar etiket="Kâr (KDV hariç)" deger={ana.a ? `${usd(ana.kar)} · %${toplam(x) ? Math.round((ana.kar / toplam(x)) * 100) : 0}` : "—"} renk={ana.kar >= 0 ? R.yesil : R.kirmizi} />
              </Kart>
              <IndirimAlani dd={{ ...x, indirim: undefined }} deger={x.indirim} degistir={(n) => set("indirim", n ?? 0)} />
            </Bolum>
            <Bolum baslik="Teklif">
              <Kart style={{ gap: 10 }}>
                <Alan etiket="Geçerlilik (YYYY-AA-GG)" value={x.gecerlilik ?? ""} autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={(v) => set("gecerlilik", v.trim())} />
                <Alan etiket="Teklif notu (mesajda ve teklif sayfasında)" value={x.teklifNotu ?? ""} onChangeText={(v) => set("teklifNotu", v)} multiline placeholder="Fiyatlar müsaitliğe göre değişebilir…" />
              </Kart>
            </Bolum>
          </>
        ) : null}
        {sekme === "secenek" ? (
          <>
            <Yazi tur="kucuk">Müşteri aynı bağlantıda seçenekleri karşılaştırır ve birini onaylar. Seçenek yalnızca otelleri, isterseniz transferleri (araç farkı) ve indirimi değiştirir; vize, tur, tren ortaktır.</Yazi>
            {secs.length ? (
              <Kart style={{ gap: 8, borderWidth: 1, borderColor: R.lacivert }}>
                <Alan etiket="1. seçenek adı (Teklif sekmesindeki kalemler)" value={x.anaAd ?? ""} placeholder="Örn. Yemekli" onChangeText={(v) => set("anaAd", v)} />
                <SecenekOzet o={ana} ind={indirimGenel(x)} onerilen={onerilen === "ana"} oner={() => set("onerilen", "ana")} />
              </Kart>
            ) : null}
            {secs.map((sc, i) => {
              const dd = secenekUygula(x, sc);
              const o = ozet(dd);
              return (
                <Kart key={sc.id} style={{ gap: 10 }}>
                  <Alan etiket={`${i + 2}. seçenek adı`} value={sc.ad} placeholder="Örn. Ekonomik" onChangeText={(v) => setSec(sc.id, { ad: v })} />
                  <Kart style={{ padding: 0, overflow: "hidden" }}>
                    {[...sc.oteller, ...(sc.transferler ?? [])].map((k, j) => (
                      <View key={k.id}>
                        {j ? <Ayrac /> : null}
                        <Satir ikon={KALEM_TURLERI[k.tur]?.ikon ?? "otel"} baslik={k.ad || KALEM_TURLERI[k.tur].label} alt={kalemOzet(k)} sag={<Yazi style={{ fontFamily: Y.kalin }}>{usd(kalemToplam(k))}</Yazi>} onPress={() => setDuzen({ yer: sc.id, kalem: k, yeni: false })} />
                      </View>
                    ))}
                  </Kart>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {(["otel_mekke", "otel_medine"] as const).map((t) => <Cip key={t} metin={`+ ${KALEM_TURLERI[t].label}`} secili={false} onPress={() => setDuzen({ yer: sc.id, yeni: true, kalem: yeniKalem(t, sc.oteller) })} />)}
                  </View>
                  <Anahtar etiket="Araç farkı" alt="Transferler bu seçenekte ayrı fiyatlanır" deger={!!sc.transferler} degisti={(v) => setSec(sc.id, { transferler: v ? x.kalemler.filter((k) => k.tur === "transfer").map((k) => ({ ...k, id: uid() })) : undefined })} />
                  <IndirimAlani dd={{ ...dd, indirim: undefined }} deger={sc.indirim} degistir={(n) => setSec(sc.id, { indirim: n })} />
                  <SecenekOzet o={o} ind={indirimGenel(dd)} fark={o.g - ana.g} onerilen={onerilen === sc.id} oner={() => set("onerilen", sc.id)} />
                  <Dugme metin="Seçeneği sil" tur="tehlike" kucuk onPress={() => Alert.alert("Seçenek silinsin mi?", "", [{ text: "Vazgeç" }, { text: "Sil", style: "destructive", onPress: () => setX({ ...x, secenekler: secs.filter((s) => s.id !== sc.id), onerilen: onerilen === sc.id ? "ana" : x.onerilen }) }])} />
                </Kart>
              );
            })}
            {secs.length + 1 < SECENEK_SINIRI ? (
              <Dugme metin="Seçenek ekle (oteller kopyalanır)" ikon="arti" tur="hafif" devreDisi={!x.kalemler.some((k) => k.tur.startsWith("otel_"))} onPress={() => setSecs([...secs, { id: uid(), ad: "", oteller: x.kalemler.filter((k) => k.tur.startsWith("otel_")).map((k) => ({ ...k, id: uid(), otel: k.otel ? { ...k.otel, onayNo: undefined } : undefined })) }])} />
            ) : <Yazi tur="kucuk">{`En fazla ${SECENEK_SINIRI} seçenek olur.`}</Yazi>}
            {!x.kalemler.some((k) => k.tur.startsWith("otel_")) ? <Yazi tur="kucuk">Seçenek eklemek için önce Teklif sekmesinde otel ekleyin.</Yazi> : null}
          </>
        ) : null}
        {sekme === "odeme" ? (
          <>
            <Kart style={{ gap: 10 }}>
              <Secim etiket="Ödeme planı" secenekler={[{ deger: "tek", etiket: "Tek seferde" }, { deger: "bolunmus", etiket: "Bölünmüş (önden + Cidde'de)" }]} deger={x.odemePlani} degisti={(v) => set("odemePlani", v)} />
              {x.odemePlani === "bolunmus" ? (() => { const d = odemeDagilimi(x); return <><Tutar etiket="Önden (otel, vize, hocanın yarısı)" deger={usd(d.onden)} /><Tutar etiket="Cidde'de (transfer, hocanın yarısı)" deger={usd(d.varis)} /></>; })() : null}
            </Kart>
            <Bolum baslik="Alınan ödemeler">
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {x.odemeler.length ? x.odemeler.map((o, i) => (
                  <View key={o.id}>
                    {i ? <Ayrac /> : null}
                    <Satir ikon="odeme" baslik={`${usd(o.tutar)} · ${o.yontem === "havale" ? "Havale" : o.yontem === "kart" ? "Kart" : "Nakit"}`} alt={`${trTarih(o.tarih, { day: "numeric", month: "long", year: "numeric" })} · ${o.yer === "cidde" ? "Cidde'de" : "Önden"}${o.aciklama ? ` · ${o.aciklama}` : ""}`} sag={<Dugme metin="Sil" kucuk tur="tehlike" onPress={() => Alert.alert("Ödeme kaydı silinsin mi?", "Kaydetmeden önce geri alabilirsiniz (Vazgeç).", [{ text: "Vazgeç" }, { text: "Sil", style: "destructive", onPress: () => set("odemeler", x.odemeler.filter((y) => y.id !== o.id)) }])} />} />
                  </View>
                )) : <View style={{ padding: 16 }}><Yazi tur="kucuk">Ödeme yok. Yeni ödemeyi dosya ekranındaki "Ödeme ekle" ile girin.</Yazi></View>}
              </Kart>
            </Bolum>
          </>
        ) : null}
        {sekme === "musteri" ? (
          <Kart style={{ gap: 10 }}>
            <Alan etiket="Müşteri adı" value={x.musteriAdi} onChangeText={(v) => set("musteriAdi", v)} />
            <Secim etiket="Hitap" secenekler={[{ deger: "", etiket: "Yok" }, { deger: "bey", etiket: "Bey" }, { deger: "hanim", etiket: "Hanım" }]} deger={x.hitap ?? ""} degisti={(v) => set("hitap", (v || null) as DosyaData["hitap"])} />
            <Alan etiket="Telefon" value={kisi.phone} keyboardType="phone-pad" onChangeText={(phone) => setKisi({ ...kisi, phone })} />
            <Alan etiket="E-posta" value={kisi.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(email) => setKisi({ ...kisi, email })} />
            <Yazi tur="etiket">Sorumlu</Yazi>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Cip metin="Yok" secili={!kisi.sorumluId} onPress={() => setKisi({ ...kisi, sorumluId: "" })} />
              {q.data.ekip.map((e) => <Cip key={e.id} metin={e.name} secili={kisi.sorumluId === e.id} onPress={() => setKisi({ ...kisi, sorumluId: e.id })} />)}
            </View>
          </Kart>
        ) : null}
      </Ekran>
      {kirli ? (
        <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi, flexDirection: "row", gap: 8 }}>
          <Dugme metin="Vazgeç" tur="ikincil" onPress={() => Alert.alert("Değişiklikler silinsin mi?", "", [{ text: "Hayır" }, { text: "Evet", style: "destructive", onPress: () => router.back() }])} style={{ flex: 1 }} />
          <Dugme metin="Kaydet" ikon="tik" yukleniyor={mesgul} onPress={kaydet} style={{ flex: 2 }} />
        </View>
      ) : null}
      <KalemDuzenle kalem={duzen?.kalem ?? null} oteller={q.data.oteller} kapat={() => setDuzen(null)} kaydet={kalemKaydet} sil={duzen && !duzen.yeni ? kalemSil : undefined} />
      <AltSayfa acik={kut != null} kapat={() => setKut(null)} baslik="Hizmet kütüphanesinden ekle">
        <Arama deger={kut ?? ""} degisti={setKut} yer="Ara" />
        <Kart style={{ padding: 0, overflow: "hidden" }}>
          {kutListe.map((s, i) => (
            <View key={s.id}>
              {i ? <Ayrac /> : null}
              <Satir baslik={s.ad} alt={`${s.kategori}${s.satis ? ` · satış ${usd(s.satis)}` : ""}${s.alis ? ` · alış ${usd(s.alis)}` : ""}`} onPress={() => {
                const tur = s.kategori === "hotel" && /medine/i.test(s.sehir ?? s.ad) ? "otel_medine" : KUT_TUR[s.kategori] ?? "diger";
                setKut(null);
                setDuzen({ yer: "ana", yeni: true, kalem: yeniKalem(tur, x.kalemler, { ad: s.ad, birim: s.satis ?? 0, alis: s.alis || undefined }) });
              }} />
            </View>
          ))}
        </Kart>
      </AltSayfa>
    </View>
  );
}

function Tutar({ etiket, deger, kalin, renk }: { etiket: string; deger: string; kalin?: boolean; renk?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Yazi style={{ flex: 1 }} tur={kalin ? "govde" : "kucuk"}>{etiket}</Yazi>
      <Yazi style={{ fontFamily: kalin ? Y.ekstra : Y.yari, color: renk ?? R.yazi }}>{deger}</Yazi>
    </View>
  );
}

/** İndirim (web: indirimAlani): tutar ya da kârın yüzdesi; müşteriye yalnızca tutar görünür. Kaldırınca 0 / undefined döner. */
function IndirimAlani({ dd, deger, degistir }: { dd: DosyaData; deger: number | undefined; degistir: (n: number | undefined) => void }) {
  const ara = araToplam(dd);
  const alis = alisToplam(dd);
  const kar = ara - alis;
  const ind = Math.max(0, deger ?? 0);
  const kalan = kar - ind;
  return (
    <Kart style={{ gap: 8, backgroundColor: "#FBF3DE" }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}><Alan etiket="İndirim $ (KDV hariç)" value={ind ? String(ind) : ""} keyboardType="decimal-pad" onChangeText={(v) => { const n = Number(v.replace(",", ".")); degistir(n > 0 ? n : undefined); }} /></View>
        <View style={{ flex: 1 }}><Alan etiket="Kârın %'si" value={ind > 0 && kar > 0 ? String(Math.round((ind / kar) * 100)) : ""} keyboardType="number-pad" editable={alis > 0 && kar > 0} placeholder={alis > 0 ? "" : "önce alış girin"} onChangeText={(v) => { const y = Number(v); degistir(y > 0 ? Math.round((kar * y) / 100) : undefined); }} /></View>
      </View>
      {ind > 0 ? (
        <>
          <Yazi tur="kucuk" renk={alis && kalan < 0 ? R.kirmizi : R.metin}>{`Müşteri görür: ${usd(ara)} → ${usd(ara - Math.min(ind, ara))} (KDV hariç) · ${usd(ind)} indirim${alis ? ` · kalan kâr ${usd(kalan)}${kalan < 0 ? " · indirim kârı aşıyor, zarar" : ""}` : " · alış girilmediği için kâr denetlenemiyor"}`}</Yazi>
          <Dugme metin="İndirimi kaldır" kucuk tur="ikincil" onPress={() => degistir(undefined)} style={{ alignSelf: "flex-start" }} />
        </>
      ) : null}
    </Kart>
  );
}

function SecenekOzet({ o, ind, fark, onerilen, oner }: { o: { g: number; kisi: number; kar: number; a: number }; ind: number; fark?: number; onerilen: boolean; oner: () => void }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Rozet metin={`Toplam ${usd(o.g)}`} />
        <Rozet metin={`Kişi başı ${usd(o.kisi)}`} />
        {ind > 0 ? <Rozet metin={`${usd(ind)} indirim`} ton="kum" /> : null}
        {o.a > 0 ? <Rozet metin={`Kâr ${usd(o.kar)}`} ton={o.kar < 0 ? "kirmizi" : "yesil"} /> : null}
        {fark != null ? <Rozet metin={`1. seçeneğe göre ${fark >= 0 ? "+" : "−"}${usd(Math.abs(fark))}`} ton="gri" /> : null}
      </View>
      <Cip metin={onerilen ? "Önerilen" : "Önerilen yap"} secili={onerilen} onPress={oner} />
    </View>
  );
}
