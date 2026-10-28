// Satış dosyası: müşteriyi arama / WhatsApp, teklif ve voucher gönderme, aşama değiştirme, ödeme ekleme, yolculuk bilgileri,
// not, kalemler ve geçmiş. Kalem ve fiyat düzenleme web panelinde (uzun form); burada okunur.
// Hesaplar sitenin src/lib/satis/ortak.ts dosyasından (web paneliyle birebir aynı).
import { useState } from "react";
import { Alert, Linking, Share, Switch, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL, istek } from "@/api/istemci";
import { useDosya, type DosyaAyrinti } from "@/veri/sorgular";
import {
  ASAMALAR, KALEM_TURLERI, KART_PAYI, KDV_ETIKETI, alisToplam, asamaLabel, faturaGece, genelToplam, geceSayisi, gunKaldi, kalemToplam, kartPayiOf, kartla, kdvTutari,
  odemeDagilimi, odenen, onaylandiMi, oteller, toplam, trTarih, usd, type Odeme,
} from "@ortak/ortak";
import { Alan, Ayrac, Baslik, Bolum, Dugme, Ekran, HataKutusu, IkonDugme, Kart, Rozet, Satir, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import AltSayfa from "@/ui/AltSayfa";
import { asamaTonu } from "@/ui/asama";
import { ara, goreli, tarihSaat, waNumara } from "@/ui/bicim";
import Ikon from "@/ikonlar/Ikon";
import { BOSLUK, R, Y } from "@/tema";

type Sayfa = null | "asama" | "odeme" | "not" | "yolculuk";
const YOLCULUK: { k: keyof import("@ortak/ortak").DosyaData; etiket: string; yer?: string }[] = [
  { k: "ucusGidis", etiket: "Gidiş uçuşu", yer: "TK 94 · 14 Aralık 09:40" },
  { k: "ucusDonus", etiket: "Dönüş uçuşu" },
  { k: "karsilamaYeri", etiket: "Karşılama yeri", yer: "Cidde Havalimanı, Kuzey Terminal" },
  { k: "karsilayanAd", etiket: "Karşılayan" },
  { k: "karsilayanTel", etiket: "Karşılayan telefonu" },
  { k: "rehberAd", etiket: "Rehber" },
  { k: "rehberTel", etiket: "Rehber telefonu" },
  { k: "tren", etiket: "Tren bilgisi" },
  { k: "donusTransfer", etiket: "Dönüş transferi" },
  { k: "musteriyeNot", etiket: "Müşteriye not" },
];

export default function DosyaEkrani() {
  const { no } = useLocalSearchParams<{ no: string }>();
  const q = useDosya(no);
  const qc = useQueryClient();
  const [sayfa, setSayfa] = useState<Sayfa>(null);
  const [mesgul, setMesgul] = useState(false);

  const yenile = (v?: DosyaAyrinti) => {
    if (v) qc.setQueryData(["satis", no], (eski: DosyaAyrinti | undefined) => ({ ...eski!, ...v }));
    qc.invalidateQueries({ queryKey: ["satis"] });
    qc.invalidateQueries({ queryKey: ["ozet"] });
  };
  const calis = async (f: () => Promise<DosyaAyrinti | void>) => {
    setMesgul(true);
    try {
      yenile((await f()) ?? undefined);
      setSayfa(null);
    } catch (e) {
      Alert.alert("İşlem yapılamadı", e instanceof Error ? e.message : "Tekrar deneyin.");
    } finally {
      setMesgul(false);
    }
  };

  if (q.isPending && !q.data) return (<><Baslik baslik={no} geri /><Yukleniyor /></>);
  if (!q.data) return (<><Baslik baslik={no} geri /><Ekran><HataKutusu hata={q.error} tekrar={q.refetch} /></Ekran></>);

  const { dosya: d } = q.data;
  const x = d.data;
  const top = genelToplam(x);
  const od = odenen(x);
  const kalanTutar = Math.max(0, top - od);
  const kar = toplam(x) - alisToplam(x);
  const gun = gunKaldi(x.gidis);
  const tel = waNumara(d.phone);

  const whatsappMesaj = async (tur: "teklif" | "voucher") => {
    if (!tel) return Alert.alert("Telefon yok", "Dosyada geçerli bir telefon numarası yok.");
    setMesgul(true);
    try {
      const m = await istek<{ teklif: string; voucher: string }>(`/api/mobil/satis-mesaj?no=${encodeURIComponent(d.no)}`);
      await Linking.openURL(`https://wa.me/${tel}?text=${encodeURIComponent(m[tur])}`);
      // WhatsApp açıldıktan sonra kayıt: teklif gönderildiyse aşama "teklif" olur (web panelindeki düğmeyle aynı)
      const v = await istek<DosyaAyrinti>(`/api/admin/satis/${encodeURIComponent(d.no)}`, { govde: { action: tur === "teklif" ? "teklif_gonderildi" : "voucher_gonderildi" } });
      yenile(v);
    } catch (e) {
      Alert.alert("Gönderilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Baslik
        baslik={x.musteriAdi}
        alt={`${d.no} · ${asamaLabel(d.status)}`}
        geri
        sag={<IkonDugme ikon="web" etiket="Web panelinde aç" onPress={() => Linking.openURL(`${API_URL}/admin/satis/${d.no}`)} />}
      />
      <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
        {/* Hızlı işlemler */}
        <View style={{ flexDirection: "row", gap: BOSLUK.s }}>
          <Dugme metin="Ara" ikon="tel" tur="ikincil" kucuk style={{ flex: 1 }} onPress={() => (d.phone ? ara(d.phone) : Alert.alert("Telefon yok"))} />
          <Dugme metin="WhatsApp" ikon="whatsapp" tur="whatsapp" kucuk style={{ flex: 1 }} onPress={() => (tel ? Linking.openURL(`https://wa.me/${tel}`) : Alert.alert("Telefon yok"))} />
        </View>
        <View style={{ flexDirection: "row", gap: BOSLUK.s }}>
          <Dugme metin="Teklifi gönder" ikon="gonder2" kucuk style={{ flex: 1 }} yukleniyor={mesgul} devreDisi={!x.kalemler.length} onPress={() => whatsappMesaj("teklif")} />
          {onaylandiMi(d.status) ? <Dugme metin="Voucher gönder" ikon="belge2" kucuk tur="hafif" style={{ flex: 1 }} onPress={() => whatsappMesaj("voucher")} /> : null}
        </View>

        {/* Durum */}
        <Kart style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Rozet metin={asamaLabel(d.status)} ton={asamaTonu(d.status)} />
            {gun != null && gun >= 0 && onaylandiMi(d.status) ? <Rozet metin={gun === 0 ? "Bugün yola çıkıyor" : `Yolculuğa ${gun} gün`} ton={gun <= 3 ? "kirmizi" : "mavi"} /> : null}
            <View style={{ flex: 1 }} />
            <Dugme metin="Değiştir" kucuk tur="hafif" onPress={() => setSayfa("asama")} />
          </View>
          <Asamalar status={d.status} />
        </Kart>

        {/* Para */}
        <Bolum baslik="Ödeme">
          <Kart style={{ gap: 8 }}>
            <Tutar etiket="Toplam" deger={usd(top)} kalin alt={x.kdv ? `${KDV_ETIKETI} dahil (${usd(kdvTutari(x))})` : "KDV'siz"} />
            <Tutar etiket="Ödenen" deger={usd(od)} renk={R.yesil} />
            <Tutar etiket="Kalan" deger={usd(kalanTutar)} renk={kalanTutar > 0.5 ? R.kirmizi : R.yesil} kalin />
            {x.odemePlani === "bolunmus" ? (() => { const o = odemeDagilimi(x); return <Yazi tur="kucuk">Bölünmüş ödeme: {usd(o.onden)} önden, {usd(o.varis)} Cidde'de</Yazi>; })() : null}
            {x.kdv ? <Yazi tur="kucuk">Kartla ödemede çekilecek: {usd(kartla(top))} (%{Math.round(KART_PAYI * 100)} kart payı)</Yazi> : null}
            {kar ? <Yazi tur="kucuk">Kâr (KDV hariç): <Yazi tur="kucuk" style={{ fontFamily: Y.kalin, color: kar > 0 ? R.yesil : R.kirmizi }}>{usd(kar)}</Yazi></Yazi> : null}
            <Dugme metin="Ödeme ekle" ikon="arti" kucuk onPress={() => setSayfa("odeme")} />
          </Kart>
          {x.odemeler.length ? (
            <Kart style={{ padding: 0, overflow: "hidden" }}>
              {x.odemeler.map((o, i) => (
                <View key={o.id}>
                  {i ? <Ayrac /> : null}
                  <Satir ikon="odeme" baslik={`${usd(o.tutar)} · ${o.yontem === "havale" ? "Havale" : o.yontem === "kart" ? "Kart" : "Nakit"}`} alt={`${trTarih(o.tarih, { day: "numeric", month: "long", year: "numeric" })} · ${o.yer === "cidde" ? "Cidde'de" : "Önden"}${o.kartPayi ? ` · +${usd(o.kartPayi)} kart payı` : ""}${o.aciklama ? ` · ${o.aciklama}` : ""}`} />
                </View>
              ))}
            </Kart>
          ) : null}
        </Bolum>

        {/* Yolculuk */}
        <Bolum baslik="Yolculuk" sag={<Dugme metin="Düzenle" kucuk tur="hafif" onPress={() => setSayfa("yolculuk")} />}>
          <Kart style={{ gap: 8 }}>
            <Bilgi etiket="Tarih" deger={x.gidis ? `${trTarih(x.gidis)}${x.donus ? ` – ${trTarih(x.donus, { day: "numeric", month: "long", year: "numeric" })}` : ""}` : "Belirtilmedi"} />
            <Bilgi etiket="Kişi" deger={[x.yetiskin && `${x.yetiskin} yetişkin`, x.cocuk && `${x.cocuk} çocuk`, x.bebek && `${x.bebek} bebek`].filter(Boolean).join(", ")} />
            {oteller(x).map((k) => (
              <Bilgi key={k.id} etiket={k.tur === "otel_mekke" ? "Mekke" : "Medine"} deger={`${k.otel?.ad}${k.otel?.giris ? ` · ${trTarih(k.otel.giris, { day: "numeric", month: "short" })} – ${trTarih(k.otel.cikis, { day: "numeric", month: "short" })} (${geceSayisi(k.otel?.giris, k.otel?.cikis)} gece)` : ""}${k.otel?.onayNo ? ` · Onay ${k.otel.onayNo}` : ""}`} />
            ))}
            {YOLCULUK.filter((a) => x[a.k]).map((a) => <Bilgi key={a.k} etiket={a.etiket} deger={String(x[a.k])} />)}
          </Kart>
        </Bolum>

        {/* Kalemler */}
        <Bolum baslik={`Kalemler (${x.kalemler.length})`}>
          <Kart style={{ padding: 0, overflow: "hidden" }}>
            {x.kalemler.length ? x.kalemler.map((k, i) => (
              <View key={k.id}>
                {i ? <Ayrac /> : null}
                <Satir
                  ikon={KALEM_TURLERI[k.tur]?.ikon ?? "paket"}
                  baslik={k.ad || KALEM_TURLERI[k.tur]?.label}
                  alt={k.tur.startsWith("otel_") ? `${k.adet} oda × ${faturaGece(k)} gece × ${usd(k.birim)}` : `${k.adet} × ${usd(k.birim)}`}
                  sag={<Yazi tur="govde" style={{ fontFamily: Y.kalin }}>{usd(kalemToplam(k))}</Yazi>}
                />
              </View>
            )) : <View style={{ padding: 16 }}><Yazi tur="kucuk">Henüz kalem yok. Teklif kalemleri web panelinden eklenir.</Yazi></View>}
          </Kart>
        </Bolum>

        {/* Teklif açılışları */}
        {q.data.acilislar.length ? (
          <Bolum baslik="Teklif açılışları">
            <Kart style={{ gap: 4 }}>
              {q.data.acilislar.slice(0, 8).map((a) => <Yazi key={a.id} tur="kucuk">{tarihSaat(a.createdAt)} · {a.cihaz}</Yazi>)}
            </Kart>
          </Bolum>
        ) : null}

        {/* Geçmiş */}
        <Bolum baslik="Geçmiş" sag={<Dugme metin="Not ekle" kucuk tur="hafif" onPress={() => setSayfa("not")} />}>
          <Kart style={{ gap: 12 }}>
            {[...x.gecmis].reverse().slice(0, 30).map((k) => (
              <View key={k.id} style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: R.altin, marginTop: 8 }} />
                <View style={{ flex: 1 }}>
                  <Yazi tur="govde">{k.metin}</Yazi>
                  <Yazi tur="kucuk">{k.kim} · {goreli(k.t)}</Yazi>
                </View>
              </View>
            ))}
          </Kart>
        </Bolum>

        <Dugme metin="Bağlantıyı paylaş" ikon="paylas" tur="ikincil" onPress={async () => {
          const m = await istek<{ teklifLinki: string; voucherLinki: string }>(`/api/mobil/satis-mesaj?no=${encodeURIComponent(d.no)}`).catch(() => null);
          if (m) Share.share({ message: onaylandiMi(d.status) ? m.voucherLinki : m.teklifLinki });
        }} />
      </Ekran>

      <AsamaSayfasi acik={sayfa === "asama"} kapat={() => setSayfa(null)} mevcut={d.status} mesgul={mesgul} kaydet={(status, bildir) => calis(() => istek<DosyaAyrinti>(`/api/admin/satis/${d.no}`, { method: "PUT", govde: { status, bildir } }))} />
      <OdemeSayfasi acik={sayfa === "odeme"} kapat={() => setSayfa(null)} kalan={kalanTutar} mesgul={mesgul} kaydet={(o) => calis(() => istek<DosyaAyrinti>(`/api/admin/satis/${d.no}`, { method: "PUT", govde: { data: { odemeler: [...x.odemeler, o] } } }))} />
      <NotSayfasi acik={sayfa === "not"} kapat={() => setSayfa(null)} mesgul={mesgul} kaydet={(metin) => calis(() => istek<DosyaAyrinti>(`/api/admin/satis/${d.no}`, { govde: { action: "not", metin } }))} />
      <YolculukSayfasi acik={sayfa === "yolculuk"} kapat={() => setSayfa(null)} veri={x} mesgul={mesgul} kaydet={(data) => calis(() => istek<DosyaAyrinti>(`/api/admin/satis/${d.no}`, { method: "PUT", govde: { data } }))} />
    </View>
  );
}

function Asamalar({ status }: { status: string }) {
  const i = ASAMALAR.findIndex((a) => a.key === status);
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {ASAMALAR.map((a, j) => (
        <View key={a.key} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: status === "iptal" ? R.cizgi : j <= i ? (j === i ? R.altin : R.lacivert) : R.cizgi }} />
      ))}
    </View>
  );
}

function Tutar({ etiket, deger, alt, renk, kalin }: { etiket: string; deger: string; alt?: string; renk?: string; kalin?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <View style={{ flex: 1 }}>
        <Yazi tur="govde">{etiket}</Yazi>
        {alt ? <Yazi tur="kucuk">{alt}</Yazi> : null}
      </View>
      <Yazi tur={kalin ? "altBaslik" : "govde"} style={{ fontFamily: kalin ? Y.ekstra : Y.yari, color: renk ?? R.yazi }}>{deger}</Yazi>
    </View>
  );
}

function Bilgi({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Yazi tur="kucuk" style={{ width: 110 }}>{etiket}</Yazi>
      <Yazi tur="govde" style={{ flex: 1 }}>{deger || "—"}</Yazi>
    </View>
  );
}

function AsamaSayfasi({ acik, kapat, mevcut, kaydet, mesgul }: { acik: boolean; kapat: () => void; mevcut: string; kaydet: (s: string, bildir: boolean) => void; mesgul: boolean }) {
  const [sec, setSec] = useState(mevcut);
  const [bildir, setBildir] = useState(true);
  const secenek = [...ASAMALAR.map((a) => ({ key: a.key as string, label: a.label })), { key: "iptal", label: "İptal" }];
  return (
    <AltSayfa acik={acik} kapat={kapat} baslik="Aşamayı değiştir">
      <Kart style={{ padding: 0, overflow: "hidden" }}>
        {secenek.map((a, i) => (
          <View key={a.key}>
            {i ? <Ayrac /> : null}
            <Satir baslik={a.label} onPress={() => setSec(a.key)} sag={sec === a.key ? <Ikon ad="tik" renk={R.lacivert} /> : <View />} />
          </View>
        ))}
      </Kart>
      <Kart style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Yazi tur="govde" style={{ fontFamily: Y.yari }}>Müşteriye e-posta gönder</Yazi>
          <Yazi tur="kucuk">Onay, ödeme, vize ve yolculuk aşamalarında bilgilendirme gider.</Yazi>
        </View>
        <Switch value={bildir} onValueChange={setBildir} trackColor={{ true: R.lacivert }} />
      </Kart>
      <Dugme metin="Kaydet" yukleniyor={mesgul} devreDisi={sec === mevcut} onPress={() => kaydet(sec, bildir)} />
    </AltSayfa>
  );
}

function OdemeSayfasi({ acik, kapat, kalan, kaydet, mesgul }: { acik: boolean; kapat: () => void; kalan: number; kaydet: (o: Odeme) => void; mesgul: boolean }) {
  const [tutar, setTutar] = useState("");
  const [yontem, setYontem] = useState<Odeme["yontem"]>("havale");
  const [yer, setYer] = useState<Odeme["yer"]>("onden");
  const [aciklama, setAciklama] = useState("");
  const n = Number(tutar.replace(",", "."));
  return (
    <AltSayfa acik={acik} kapat={kapat} baslik="Ödeme ekle">
      <Alan etiket="Tutar ($)" value={tutar} onChangeText={setTutar} keyboardType="decimal-pad" placeholder={kalan ? String(Math.round(kalan)) : "0"} />
      {kalan > 0 ? <Dugme metin={`Kalanın tamamı: ${usd(kalan)}`} kucuk tur="hafif" onPress={() => setTutar(String(Math.round(kalan * 100) / 100))} /> : null}
      <Yazi tur="etiket">Yöntem</Yazi>
      <Segment secenekler={[{ deger: "havale", etiket: "Havale / IBAN" }, { deger: "kart", etiket: "Kredi kartı" }, { deger: "nakit", etiket: "Nakit" }]} deger={yontem} degisti={setYontem} />
      <Yazi tur="etiket">Nerede</Yazi>
      <Segment secenekler={[{ deger: "onden", etiket: "Önden" }, { deger: "cidde", etiket: "Cidde'de" }]} deger={yer} degisti={setYer} />
      {yontem === "kart" && n > 0 ? <Yazi tur="kucuk">Karttan çekilecek: {usd(kartla(n))} ({usd(n)} + %{Math.round(KART_PAYI * 100)} kart payı)</Yazi> : null}
      <Alan etiket="Açıklama (isteğe bağlı)" value={aciklama} onChangeText={setAciklama} placeholder="Kapora, dekont no…" />
      <Dugme
        metin="Ödemeyi kaydet"
        yukleniyor={mesgul}
        devreDisi={!(n > 0)}
        onPress={() => {
          kaydet({ id: `od_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, tarih: new Date().toISOString().slice(0, 10), tutar: n, yontem, yer, aciklama: aciklama.trim() || undefined, kartPayi: yontem === "kart" ? kartPayiOf(n) : undefined });
          setTutar("");
          setAciklama("");
        }}
      />
    </AltSayfa>
  );
}

function NotSayfasi({ acik, kapat, kaydet, mesgul }: { acik: boolean; kapat: () => void; kaydet: (m: string) => void; mesgul: boolean }) {
  const [m, setM] = useState("");
  return (
    <AltSayfa acik={acik} kapat={kapat} baslik="Not ekle">
      <Alan etiket="Not" value={m} onChangeText={setM} multiline placeholder="Görüşme notu, müşteri isteği…" autoFocus />
      <Dugme metin="Kaydet" yukleniyor={mesgul} devreDisi={!m.trim()} onPress={() => (kaydet(m.trim()), setM(""))} />
    </AltSayfa>
  );
}

function YolculukSayfasi({ acik, kapat, veri, kaydet, mesgul }: { acik: boolean; kapat: () => void; veri: import("@ortak/ortak").DosyaData; kaydet: (d: Record<string, string>) => void; mesgul: boolean }) {
  const [d, setD] = useState<Record<string, string>>({});
  const deger = (k: string) => d[k] ?? String((veri as Record<string, unknown>)[k] ?? "");
  return (
    <AltSayfa acik={acik} kapat={() => (setD({}), kapat())} baslik="Yolculuk bilgileri">
      {YOLCULUK.map((a) => (
        <Alan key={a.k} etiket={a.etiket} value={deger(a.k)} onChangeText={(v) => setD((o) => ({ ...o, [a.k]: v }))} placeholder={a.yer} multiline={a.k === "musteriyeNot"} keyboardType={String(a.k).endsWith("Tel") ? "phone-pad" : "default"} />
      ))}
      <Dugme metin="Kaydet" yukleniyor={mesgul} devreDisi={!Object.keys(d).length} onPress={() => (kaydet(d), setD({}))} />
    </AltSayfa>
  );
}
