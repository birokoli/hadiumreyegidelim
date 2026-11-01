// Teklif kalemi düzenleme (web: satış dosyası → kalemSatiri). Otelde otel seçimi, giriş, gece / çıkış, oda, oda tipi, gecelik
// satış ve alış; diğer kalemlerde ad, açıklama (turda rota), adet ve birim ya da toplam fiyat. Hesaplar ortak dosyadan.
import { useEffect, useState } from "react";
import { View } from "react-native";
import { KALEM_TURLERI, faturaGece, geceSayisi, gunEkle, kalemToplam, tarihTers, trTarih, usd, type Kalem } from "@ortak/ortak";
import { ZIYARET_ROTALARI, durakSayisi } from "@ortak/ziyaret";
import AltSayfa from "./AltSayfa";
import { Alan, Arama, Cip, Dugme, Kart, Yazi } from "./temel";
import { R, Y } from "@/tema";

export type OtelSecenek = { slug: string; ad: string; sehir: string; kabe: number | null };
const kisiBasi = (k: Kalem) => ["vize", "tren"].includes(k.tur);
const aracBasi = (k: Kalem) => ["tur", "transfer"].includes(k.tur);
const yuvarla = (n: number) => Math.round(n * 100) / 100;
const sayi = (v: string) => Number(v.replace(",", ".")) || 0;
const TARIH = /^\d{4}-\d{2}-\d{2}$/;

export function kalemOzet(k: Kalem) {
  if (k.tur.startsWith("otel_")) return `${k.otel?.giris ? `${trTarih(k.otel.giris, { day: "numeric", month: "short" })} – ${trTarih(k.otel.cikis, { day: "numeric", month: "short" })} · ` : ""}${k.adet} oda × ${faturaGece(k)} gece × ${usd(k.birim)}`;
  return `${k.adet} ${kisiBasi(k) ? "kişi" : aracBasi(k) ? "araç" : "adet"} × ${usd(k.birim)}${k.alis ? ` · alış ${usd(k.alis)}` : ""}`;
}

export default function KalemDuzenle({ kalem, oteller, kapat, kaydet, sil }: { kalem: Kalem | null; oteller: OtelSecenek[]; kapat: () => void; kaydet: (k: Kalem) => void; sil?: () => void }) {
  const [k, setK] = useState<Kalem | null>(kalem);
  const [otelAra, setOtelAra] = useState("");
  const [elle, setElle] = useState(false);
  useEffect(() => { setK(kalem); setOtelAra(""); setElle(!!kalem?.otel?.ad && !kalem?.otel?.slug); }, [kalem]);
  if (!k) return <AltSayfa acik={false} kapat={kapat} baslik=""><View /></AltSayfa>;
  const set = (p: Partial<Kalem>) => setK({ ...k, ...p, otel: p.otel ? { ...(k.otel ?? { ad: "" }), ...p.otel } : k.otel });
  const otel = k.tur.startsWith("otel_");
  const sehir = k.tur === "otel_mekke" ? "mekke" : "medine";
  const g = geceSayisi(k.otel?.giris, k.otel?.cikis);
  const liste = oteller.filter((o) => o.sehir === sehir && (!otelAra || o.ad.toLocaleLowerCase("tr-TR").includes(otelAra.toLocaleLowerCase("tr-TR")))).slice(0, 40);
  return (
    <AltSayfa acik={!!kalem} kapat={kapat} baslik={KALEM_TURLERI[k.tur].label}>
      {otel ? (
        <>
          <Yazi tur="etiket">Otel</Yazi>
          {k.otel?.ad && !elle ? (
            <Kart style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 12 }}>
              <Yazi style={{ flex: 1, fontFamily: Y.yari }}>{k.otel.ad}</Yazi>
              <Dugme metin="Değiştir" kucuk tur="hafif" onPress={() => set({ otel: { ad: "", slug: undefined }, ad: KALEM_TURLERI[k.tur].label })} />
            </Kart>
          ) : elle ? (
            <>
              <Alan etiket="Otel adı (elle)" value={k.otel?.ad ?? ""} onChangeText={(v) => set({ otel: { ad: v, slug: undefined }, ad: v })} />
              <Dugme metin="Listeden seç" kucuk tur="ikincil" onPress={() => setElle(false)} />
            </>
          ) : (
            <>
              <Arama deger={otelAra} degisti={setOtelAra} yer={`${sehir === "mekke" ? "Mekke" : "Medine"} oteli ara`} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {liste.map((o) => <Cip key={o.slug} metin={`${o.ad}${o.kabe ? ` · ${o.kabe} m` : ""}`} secili={false} onPress={() => set({ otel: { slug: o.slug, ad: o.ad }, ad: o.ad })} />)}
              </View>
              <Dugme metin="Listede yok, elle yaz" kucuk tur="ikincil" onPress={() => setElle(true)} />
            </>
          )}
          <Alan etiket="Giriş (YYYY-AA-GG)" value={k.otel?.giris ?? ""} autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={(v) => {
            // Giriş değişince gece sayısı korunur, çıkış kayar (web ile aynı)
            const yeni = v.trim();
            set({ otel: { ad: k.otel?.ad ?? "", giris: yeni, ...(TARIH.test(yeni) && g ? { cikis: gunEkle(yeni, g) } : {}) } });
          }} />
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <Alan etiket="Gece" value={g ? String(g) : ""} keyboardType="number-pad" editable={TARIH.test(k.otel?.giris ?? "")} placeholder="—" onChangeText={(v) => { const n = Number(v); if (k.otel?.giris && TARIH.test(k.otel.giris) && n > 0) set({ otel: { ad: k.otel?.ad ?? "", cikis: gunEkle(k.otel.giris, n) } }); }} />
            </View>
            <View style={{ flex: 2 }}>
              <Alan etiket="Çıkış (YYYY-AA-GG)" value={k.otel?.cikis ?? ""} autoCapitalize="none" keyboardType="numbers-and-punctuation" onChangeText={(v) => set({ otel: { ad: k.otel?.ad ?? "", cikis: v.trim() } })} />
            </View>
          </View>
          {tarihTers(k.otel?.giris, k.otel?.cikis) ? <Yazi tur="kucuk" renk={R.kirmizi}>Çıkış girişten önce; otel 0 gece sayılıyor. Çıkışı düzeltin ya da gece sayısını yazın.</Yazi> : null}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Alan etiket="Oda" value={String(k.adet)} keyboardType="number-pad" onChangeText={(v) => set({ adet: Number(v) || 1 })} /></View>
            <View style={{ flex: 2 }}><Alan etiket="Oda tipi" value={k.otel?.oda ?? ""} placeholder="2 kişilik" onChangeText={(v) => set({ otel: { ad: k.otel?.ad ?? "", oda: v } })} /></View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Alan etiket="Gecelik satış $" value={k.birim ? String(k.birim) : ""} keyboardType="decimal-pad" onChangeText={(v) => set({ birim: sayi(v) })} /></View>
            <View style={{ flex: 1 }}><Alan etiket="Gecelik alış $" value={k.alis ? String(k.alis) : ""} keyboardType="decimal-pad" onChangeText={(v) => set({ alis: sayi(v) })} /></View>
          </View>
          <Alan etiket="Otel onay no (voucher'da görünür)" value={k.otel?.onayNo ?? ""} autoCapitalize="characters" onChangeText={(v) => set({ otel: { ad: k.otel?.ad ?? "", onayNo: v } })} />
        </>
      ) : (
        <>
          {k.tur === "tur" ? (
            <>
              <Yazi tur="etiket">Rota (müşteri durakları görür)</Yazi>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(["mekke", "medine"] as const).map((r) => <Cip key={r} metin={`${ZIYARET_ROTALARI[r].ad} (${durakSayisi(ZIYARET_ROTALARI[r])} durak)`} secili={k.rota === r} onPress={() => set({ rota: r, ad: ZIYARET_ROTALARI[r].ad, aciklama: undefined })} />)}
                <Cip metin="Özel tur" secili={!k.rota} onPress={() => set({ rota: undefined })} />
              </View>
            </>
          ) : null}
          <Alan etiket="Hizmet adı" value={k.ad} onChangeText={(v) => set({ ad: v })} />
          {k.tur !== "tur" || !k.rota ? <Alan etiket="Açıklama (müşteri görür)" value={k.aciklama ?? ""} onChangeText={(v) => set({ aciklama: v })} multiline /> : null}
          <Alan etiket={kisiBasi(k) ? "Kişi" : aracBasi(k) ? "Araç" : "Adet"} value={String(k.adet)} keyboardType="number-pad" onChangeText={(v) => set({ adet: Number(v) || 1 })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Alan etiket={`${kisiBasi(k) ? "Kişi başı" : aracBasi(k) ? "Araç başı" : "Birim"} satış $`} value={k.birim ? String(k.birim) : ""} keyboardType="decimal-pad" onChangeText={(v) => set({ birim: sayi(v) })} /></View>
            <View style={{ flex: 1 }}><Alan etiket="Toplam satış $" value={k.birim ? String(yuvarla(k.birim * k.adet)) : ""} keyboardType="decimal-pad" onChangeText={(v) => set({ birim: yuvarla(sayi(v) / Math.max(1, k.adet)) })} /></View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Alan etiket="Birim alış $" value={k.alis ? String(k.alis) : ""} keyboardType="decimal-pad" onChangeText={(v) => set({ alis: sayi(v) })} /></View>
            <View style={{ flex: 1 }}><Alan etiket="Toplam alış $" value={k.alis ? String(yuvarla(k.alis * k.adet)) : ""} keyboardType="decimal-pad" onChangeText={(v) => set({ alis: yuvarla(sayi(v) / Math.max(1, k.adet)) })} /></View>
          </View>
        </>
      )}
      <Kart style={{ flexDirection: "row", padding: 12 }}>
        <Yazi style={{ flex: 1 }}>Kalem toplamı</Yazi>
        <Yazi style={{ fontFamily: Y.ekstra }}>{usd(kalemToplam(k))}</Yazi>
      </Kart>
      <Dugme metin="Tamam" ikon="tik" onPress={() => kaydet(k)} />
      {sil ? <Dugme metin="Kalemi sil" tur="tehlike" onPress={sil} /> : null}
    </AltSayfa>
  );
}
