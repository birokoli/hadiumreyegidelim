// Bugün: yetkiye göre sayaçlar (dokununca ilgili liste), yaklaşan yolculuklar ve teklif bekleyen talepler.
import { View } from "react-native";
import { router } from "expo-router";
import { useOturum } from "@/oturum/Oturum";
import { useOzet } from "@/veri/sorgular";
import { asamaLabel } from "@ortak/ortak";
import { Baslik, Bolum, Bos, Ekran, HataKutusu, Kart, Rozet, Satir, Ayrac, Sayac, Yazi, Yukleniyor } from "@/ui/temel";
import { goreli, tarih } from "@/ui/bicim";
import { BOSLUK, R } from "@/tema";

const selam = () => {
  const s = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hour12: false }).format(new Date()));
  return s < 5 ? "İyi geceler" : s < 12 ? "Günaydın" : s < 18 ? "İyi günler" : "İyi akşamlar";
};

export default function Bugun() {
  const { yonetici } = useOturum();
  const q = useOzet();
  const o = q.data;
  const d = o?.sayac.dosya ?? {};

  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik={`${selam()}, ${yonetici?.ad?.split(" ")[0] ?? ""}`} alt={new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Istanbul" })} />
      {q.isPending && !o ? (
        <Yukleniyor />
      ) : (
        <Ekran yenile={q.refetch} yenileniyor={q.isRefetching}>
          {q.error && !o ? <HataKutusu hata={q.error} tekrar={q.refetch} /> : null}
          {o?.yetkiler.siparis ? (
            <Bolum baslik="Satış">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
                <Sayac etiket="Yeni talep" deger={o.sayac.yeniTalep} ikon="gelen" ton={o.sayac.yeniTalep ? "kirmizi" : "mavi"} onPress={() => router.push("/talepler")} />
                <Sayac etiket="Teklif bekliyor" deger={d.talep ?? 0} ikon="dosya" ton={d.talep ? "turuncu" : "mavi"} onPress={() => router.push({ pathname: "/satis", params: { asama: "talep" } })} />
                <Sayac etiket="Teklif gönderildi" deger={d.teklif ?? 0} ikon="gonder2" onPress={() => router.push({ pathname: "/satis", params: { asama: "teklif" } })} />
                <Sayac etiket="Ödeme bekliyor" deger={d.onaylandi ?? 0} ikon="odeme" ton={d.onaylandi ? "kum" : "mavi"} onPress={() => router.push({ pathname: "/satis", params: { asama: "onaylandi" } })} />
                <Sayac etiket="Ramazan rezervasyonu" deger={o.sayac.ramazanAktif} ikon="kabe" ton="kum" onPress={() => router.push("/ramazan")} />
                <Sayac etiket="Yeni üye (7 gün)" deger={o.sayac.yeniUye} ikon="kullanicilar" onPress={() => router.push("/uyeler")} />
              </View>
            </Bolum>
          ) : null}

          {o?.yetkiler.pazarlama ? (
            <Bolum baslik="Onay ve mesajlar">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: BOSLUK.m }}>
                <Sayac etiket="Yorum onayı" deger={o.sayac.yorum} ikon="yorum" ton={o.sayac.yorum ? "turuncu" : "mavi"} onPress={() => router.push("/yorumlar")} />
                <Sayac etiket="Influencer içeriği" deger={o.sayac.icerik} ikon="icerik" ton={o.sayac.icerik ? "turuncu" : "mavi"} onPress={() => router.push("/influencer/icerikler")} />
                <Sayac etiket="Başvuru" deger={o.sayac.basvuru} ikon="davet" ton={o.sayac.basvuru ? "turuncu" : "mavi"} onPress={() => router.push("/influencer/basvurular")} />
                <Sayac etiket="Destek mesajı" deger={o.sayac.destek} ikon="sohbet" ton={o.sayac.destek ? "kirmizi" : "mavi"} onPress={() => router.push("/destek")} />
                <Sayac etiket="WhatsApp devri" deger={o.sayac.whatsapp} ikon="whatsapp" ton={o.sayac.whatsapp ? "kirmizi" : "yesil"} onPress={() => router.push("/whatsapp")} />
              </View>
            </Bolum>
          ) : null}

          {o?.yetkiler.siparis ? (
            <Bolum baslik="Yaklaşan yolculuklar (30 gün)">
              {o.yaklasan.length ? (
                <Kart style={{ padding: 0, overflow: "hidden" }}>
                  {o.yaklasan.map((y, i) => (
                    <View key={y.no}>
                      {i ? <Ayrac /> : null}
                      <Satir
                        ikon="ucak2"
                        baslik={y.musteri}
                        alt={`${y.no} · ${tarih(y.gidis)} · ${asamaLabel(y.status)}`}
                        sag={<Rozet metin={y.kalan === 0 ? "Bugün" : `${y.kalan} gün`} ton={y.kalan! <= 3 ? "kirmizi" : y.kalan! <= 7 ? "turuncu" : "mavi"} />}
                        onPress={() => router.push(`/satis/${y.no}`)}
                      />
                    </View>
                  ))}
                </Kart>
              ) : (
                <Kart><Bos ikon="ucak2" baslik="30 gün içinde yolculuk yok" /></Kart>
              )}
            </Bolum>
          ) : null}

          {o?.bekleyenTeklif.length ? (
            <Bolum baslik="Teklif bekleyen talepler">
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {o.bekleyenTeklif.map((t, i) => (
                  <View key={t.no}>
                    {i ? <Ayrac /> : null}
                    <Satir ikon="dosya" baslik={t.musteri} alt={`${t.no} · ${goreli(t.tarih)}`} onPress={() => router.push(`/satis/${t.no}`)} />
                  </View>
                ))}
              </Kart>
            </Bolum>
          ) : null}
          {o && !o.yetkiler.siparis && !o.yetkiler.pazarlama ? <Yazi tur="kucuk" renk={R.metin}>Hesabınızın satış ve pazarlama yetkisi yok.</Yazi> : null}
        </Ekran>
      )}
    </View>
  );
}
