// Raporlar (web: Dashboard + Analytics + Yapay zekâ kayıtları): satış dönüşümü, ciro, kâr, tahsilat (dosyalardan, ortak hesapla),
// aylık ciro grafiği, satış türü dağılımı, site sayaçları ve otomatik yazı kayıtları.
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { useDosyalar } from "@/veri/sorgular";
import { alisToplam, genelToplam, odenen, onaylandiMi, SATIS_TURLERI, toplam } from "@ortak/ortak";
import { Baslik, Bolum, Ekran, Kart, Rozet, Sayac, Segment, Yazi, Yukleniyor } from "@/ui/temel";
import { goreli, usd } from "@/ui/bicim";
import { BOSLUK, KOSE, R, Y } from "@/tema";

type Rapor = {
  talep: { son7: number; son30: number; okunmamis: number; toplam: number };
  icerik: { yayinda: number; taslak: number; son30: number; paket: number };
  siparis30: number;
  uye: { son30: number; toplam: number };
  ai: { tamamlanan: number; son: { id: string; topic: string | null; status: string; details: string | null; createdAt: string }[] };
};
const AY = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const ayAnahtar = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function Raporlar() {
  const s = useDosyalar();
  const r = useQuery({ queryKey: ["raporlar"], queryFn: () => istek<Rapor>("/api/mobil/raporlar") });
  const [donem, setDonem] = useState<"ay" | "3ay" | "yil" | "tum">("ay");
  const hesap = useMemo(() => {
    const dosyalar = (s.data?.dosyalar ?? []).filter((d) => d.status !== "iptal");
    const simdi = new Date();
    const bas = donem === "ay" ? new Date(simdi.getFullYear(), simdi.getMonth(), 1) : donem === "3ay" ? new Date(simdi.getFullYear(), simdi.getMonth() - 2, 1) : donem === "yil" ? new Date(simdi.getFullYear(), 0, 1) : new Date(0);
    const icinde = dosyalar.filter((d) => new Date(d.createdAt) >= bas);
    const satis = icinde.filter((d) => onaylandiMi(d.status));
    const ciro = satis.reduce((t, d) => t + genelToplam(d.data), 0);
    const kar = satis.reduce((t, d) => t + toplam(d.data) - alisToplam(d.data), 0);
    const tahsil = satis.reduce((t, d) => t + odenen(d.data), 0);
    const tur: Record<string, { adet: number; ciro: number }> = {};
    for (const d of satis) {
      const k = d.data.satisTuru ?? "01";
      tur[k] = { adet: (tur[k]?.adet ?? 0) + 1, ciro: (tur[k]?.ciro ?? 0) + genelToplam(d.data) };
    }
    const aylar = Array.from({ length: 6 }, (_, i) => ayAnahtar(new Date(simdi.getFullYear(), simdi.getMonth() - 5 + i, 1)));
    const aylik = aylar.map((m) => {
      const l = dosyalar.filter((d) => onaylandiMi(d.status) && ayAnahtar(new Date(d.createdAt)) === m);
      return { m, ciro: l.reduce((t, d) => t + genelToplam(d.data), 0), adet: l.length, talep: dosyalar.filter((d) => ayAnahtar(new Date(d.createdAt)) === m).length };
    });
    return { dosya: icinde.length, satis: satis.length, donusum: icinde.length ? Math.round((satis.length / icinde.length) * 100) : 0, ciro, kar, tahsil, kalan: ciro - tahsil, tur, aylik };
  }, [s.data, donem]);
  const enCok = Math.max(1, ...hesap.aylik.map((a) => a.ciro));
  const d = r.data;
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Raporlar" alt="Satış, site ve içerik" geri />
      {s.isPending && !s.data ? <Yukleniyor /> : (
        <Ekran yenile={() => { s.refetch(); r.refetch(); }} yenileniyor={s.isRefetching || r.isRefetching}>
          <Segment secenekler={[{ deger: "ay", etiket: "Bu ay" }, { deger: "3ay", etiket: "Son 3 ay" }, { deger: "yil", etiket: "Bu yıl" }, { deger: "tum", etiket: "Tümü" }]} deger={donem} degisti={setDonem} />
          <Bolum baslik="Satış">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
              <Sayac etiket="Açılan dosya" deger={hesap.dosya} ikon="dosya" />
              <Sayac etiket="Satış (onaylanan)" deger={hesap.satis} ikon="tik" ton="yesil" />
              <Sayac etiket="Dönüşüm" deger={`%${hesap.donusum}`} ikon="yenile" ton="kum" />
              <Sayac etiket="Ciro (KDV dahil)" deger={usd(hesap.ciro)} ikon="fiyat2" />
              <Sayac etiket="Kâr (KDV hariç)" deger={usd(hesap.kar)} ikon="fiyat2" ton="yesil" />
              <Sayac etiket="Tahsil edilen" deger={usd(hesap.tahsil)} ikon="odeme" />
              <Sayac etiket="Kalan alacak" deger={usd(hesap.kalan)} ikon="odeme" ton={hesap.kalan > 0 ? "turuncu" : "mavi"} />
            </View>
          </Bolum>
          <Bolum baslik="Son 6 ay ciro">
            <Kart style={{ gap: 10 }}>
              {hesap.aylik.map((a) => (
                <View key={a.m} style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Yazi tur="kucuk" style={{ flex: 1 }}>{`${AY[Number(a.m.slice(5)) - 1]} ${a.m.slice(2, 4)} · ${a.adet} satış / ${a.talep} dosya`}</Yazi>
                    <Yazi tur="kucuk" style={{ fontFamily: Y.kalin, color: R.yazi }}>{usd(a.ciro)}</Yazi>
                  </View>
                  <View style={{ height: 10, borderRadius: KOSE.hap, backgroundColor: R.maviZemin, overflow: "hidden" }}>
                    <View style={{ width: `${(a.ciro / enCok) * 100}%`, height: "100%", backgroundColor: R.lacivert, borderRadius: KOSE.hap }} />
                  </View>
                </View>
              ))}
            </Kart>
          </Bolum>
          {Object.keys(hesap.tur).length ? (
            <Bolum baslik="Satış türüne göre">
              <Kart style={{ gap: 8 }}>
                {Object.entries(hesap.tur).sort((a, b) => b[1].ciro - a[1].ciro).map(([k, v]) => (
                  <View key={k} style={{ flexDirection: "row", gap: 8 }}>
                    <Yazi style={{ flex: 1 }}>{SATIS_TURLERI[k as keyof typeof SATIS_TURLERI] ?? k}</Yazi>
                    <Yazi tur="kucuk">{`${v.adet} · ${usd(v.ciro)}`}</Yazi>
                  </View>
                ))}
              </Kart>
            </Bolum>
          ) : null}
          {d ? (
            <>
              <Bolum baslik="Site">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
                  <Sayac etiket="Talep (7 gün)" deger={d.talep.son7} ikon="gelen" />
                  <Sayac etiket="Talep (30 gün)" deger={d.talep.son30} ikon="gelen" />
                  <Sayac etiket="Okunmamış talep" deger={d.talep.okunmamis} ikon="gelen" ton={d.talep.okunmamis ? "kirmizi" : "mavi"} />
                  <Sayac etiket="Yeni üye (30 gün)" deger={d.uye.son30} ikon="kullanicilar" />
                  <Sayac etiket="Toplam üye" deger={d.uye.toplam} ikon="kullanicilar" />
                  <Sayac etiket="Paket siparişi (30 gün)" deger={d.siparis30} ikon="paket" />
                </View>
              </Bolum>
              <Bolum baslik="İçerik">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
                  <Sayac etiket="Yayındaki yazı" deger={d.icerik.yayinda} ikon="kalem" />
                  <Sayac etiket="Taslak" deger={d.icerik.taslak} ikon="kalem" ton="gri" />
                  <Sayac etiket="Son 30 günde yayın" deger={d.icerik.son30} ikon="kalem" ton="yesil" />
                  <Sayac etiket="Yayındaki paket" deger={d.icerik.paket} ikon="paket" />
                </View>
              </Bolum>
              <Bolum baslik={`Otomatik yazı kayıtları (${d.ai.tamamlanan} tamamlandı)`}>
                {d.ai.son.map((l) => (
                  <Kart key={l.id} style={{ gap: 4, padding: 12 }}>
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <Yazi style={{ flex: 1 }} satir={2}>{l.topic || "Konu yok"}</Yazi>
                      <Rozet metin={l.status} ton={l.status === "COMPLETED" ? "yesil" : l.status === "FAILED" || l.status === "ERROR" ? "kirmizi" : "turuncu"} />
                    </View>
                    <Yazi tur="kucuk">{goreli(l.createdAt)}</Yazi>
                    {l.details && l.status !== "COMPLETED" ? <Yazi tur="kucuk" satir={3}>{l.details}</Yazi> : null}
                  </Kart>
                ))}
              </Bolum>
            </>
          ) : null}
        </Ekran>
      )}
    </View>
  );
}
