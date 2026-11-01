// Kampanya sayfaları (web: /admin/eylul-umresi): /eylul-umresi, /ilk-umrem, /hanim-umresi reklam sayfalarının bütün metinleri,
// fiyatları, paketleri, SSS'si ve ana sayfa kartının görünme tarihleri. Üç sayfa birlikte kaydedilir (sunucu kuralı).
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { NesneDuzenleyici } from "@/ui/NesneDuzenleyici";
import { Baslik, Bolum, Dugme, Ekran, Kart, Segment, Yazi, Yukleniyor, HataKutusu } from "@/ui/temel";
import { R } from "@/tema";

type Ayar = Record<string, unknown>;
type Veri = { ad1: Ayar; ad2: Ayar; ad3: Ayar };
const SAYFA = [{ deger: "ad1", etiket: "Eylül umresi", yol: "/eylul-umresi" }, { deger: "ad2", etiket: "İlk Umrem", yol: "/ilk-umrem" }, { deger: "ad3", etiket: "Hanım umresi", yol: "/hanim-umresi" }] as const;

const ETIKET: Record<string, string> = {
  seoTitle: "SEO başlığı", seoDescription: "SEO açıklaması", heroImage: "Giriş görseli", footerImage: "Alt görsel", badgeText: "Rozet yazısı",
  title: "Başlık", highlightedTitle: "Vurgulu başlık", startingPrice: "Başlangıç fiyatı", priceSuffix: "Fiyat eki", departureOneLabel: "1. kalkış etiketi",
  departureOne: "1. kalkış", departureTwoLabel: "2. kalkış etiketi", departureTwo: "2. kalkış", dateSummary: "Tarih özeti", capacity: "Kontenjan",
  heroNote: "Giriş notu", heroButton: "Giriş düğmesi", reserveButton: "Rezervasyon düğmesi", whatsappMessage: "WhatsApp mesajı",
  packagesKicker: "Paketler üst yazı", packagesTitle: "Paketler başlığı", packagesButton: "Paketler düğmesi", roomDoubleLabel: "2 kişilik oda etiketi",
  roomTripleLabel: "3 kişilik oda etiketi", roomQuadLabel: "4 kişilik oda etiketi", packages: "Paketler", days: "Süre", double: "2 kişilik", triple: "3 kişilik", quad: "4 kişilik",
  childKicker: "Çocuk üst yazı", childTitle: "Çocuk başlığı", childTwoToElevenLabel: "2–11 yaş etiketi", childTwoToEleven: "2–11 yaş fiyatı",
  childZeroToTwoLabel: "0–2 yaş etiketi", childZeroToTwo: "0–2 yaş fiyatı", includedKicker: "Dahil üst yazı", includedTitle: "Dahil başlığı",
  includedItems: "Dahil olanlar", icon: "İkon", label: "Etiket", detail: "Ayrıntı", hotelDetail: "Otel ayrıntısı", notesTitle: "Notlar başlığı", notes: "Notlar",
  notesButton: "Notlar düğmesi", faqKicker: "SSS üst yazı", faqTitle: "SSS başlığı", faqButton: "SSS düğmesi", faqs: "Sık sorulan sorular", q: "Soru", a: "Cevap",
  footerTitle: "Alt başlık", footerDescription: "Alt açıklama", footerNote: "Alt not", footerButton: "Alt düğme", homeBadge: "Ana sayfa rozeti",
  homeVisibleFrom: "Ana sayfada görünme başlangıcı (YYYY-AA-GG)", homeVisibleUntil: "Ana sayfada görünme bitişi (YYYY-AA-GG)", homeTitle: "Ana sayfa başlığı",
  homeDescription: "Ana sayfa açıklaması", homeButton: "Ana sayfa düğmesi", homeFeatures: "Ana sayfa maddeleri", readyCtaKicker: "Hazır çağrı üst yazı",
  readyCtaTitle: "Hazır çağrı başlığı", readyCtaDescription: "Hazır çağrı açıklaması", readyCtaNote: "Hazır çağrı notu", readyCtaButton: "Hazır çağrı düğmesi",
  readyCtaImage: "Hazır çağrı görseli", readyCtaWhatsappMessage: "Hazır çağrı WhatsApp mesajı", finalAdsBadge: "Son reklam rozeti", finalAdsTitle: "Son reklam başlığı",
  finalAdsDescription: "Son reklam açıklaması", finalAdsNote: "Son reklam notu", finalAdsButton: "Son reklam düğmesi", finalAdsImage: "Son reklam görseli",
  finalAdsWhatsappMessage: "Son reklam WhatsApp mesajı",
};
const GRUP: { baslik: string; alanlar: string[] }[] = [
  { baslik: "Giriş", alanlar: ["badgeText", "title", "highlightedTitle", "startingPrice", "priceSuffix", "heroImage", "heroNote", "heroButton", "reserveButton", "whatsappMessage"] },
  { baslik: "Tarihler", alanlar: ["departureOneLabel", "departureOne", "departureTwoLabel", "departureTwo", "dateSummary", "capacity"] },
  { baslik: "Paketler ve fiyatlar", alanlar: ["packagesKicker", "packagesTitle", "packagesButton", "roomDoubleLabel", "roomTripleLabel", "roomQuadLabel", "packages", "childKicker", "childTitle", "childTwoToElevenLabel", "childTwoToEleven", "childZeroToTwoLabel", "childZeroToTwo"] },
  { baslik: "Dahil olanlar ve notlar", alanlar: ["includedKicker", "includedTitle", "includedItems", "hotelDetail", "notesTitle", "notes", "notesButton"] },
  { baslik: "Sık sorulan sorular", alanlar: ["faqKicker", "faqTitle", "faqButton", "faqs"] },
  { baslik: "Ana sayfa kartı", alanlar: ["homeBadge", "homeVisibleFrom", "homeVisibleUntil", "homeTitle", "homeDescription", "homeButton", "homeFeatures"] },
  { baslik: "Sayfa sonu", alanlar: ["readyCtaKicker", "readyCtaTitle", "readyCtaDescription", "readyCtaNote", "readyCtaButton", "readyCtaImage", "readyCtaWhatsappMessage", "finalAdsBadge", "finalAdsTitle", "finalAdsDescription", "finalAdsNote", "finalAdsButton", "finalAdsImage", "finalAdsWhatsappMessage", "footerTitle", "footerDescription", "footerNote", "footerButton", "footerImage"] },
  { baslik: "SEO", alanlar: ["seoTitle", "seoDescription"] },
];

export default function KampanyaSayfalari() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["kampanya-sayfalari"], queryFn: () => istek<Veri>("/api/admin/eylul-campaign") });
  const [taslak, setTaslak] = useState<Veri | null>(null);
  const [sayfa, setSayfa] = useState<"ad1" | "ad2" | "ad3">("ad2");
  const [grup, setGrup] = useState(GRUP[0].baslik);
  const [mesgul, setMesgul] = useState(false);
  useEffect(() => { if (q.data && !taslak) setTaslak(q.data); }, [q.data, taslak]);
  const degisti = !!taslak && !!q.data && JSON.stringify(taslak) !== JSON.stringify(q.data);
  const kaydet = async () => {
    if (!taslak) return;
    setMesgul(true);
    try {
      await istek("/api/admin/eylul-campaign", { govde: taslak });
      await qc.invalidateQueries({ queryKey: ["kampanya-sayfalari"] });
      setTaslak(null);
      Alert.alert("Kaydedildi", "Kampanya sayfaları sitede güncellendi.");
    } catch (e) {
      Alert.alert("Kaydedilemedi", e instanceof Error ? e.message : "");
    } finally {
      setMesgul(false);
    }
  };
  const g = GRUP.find((x) => x.baslik === grup) ?? GRUP[0];
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Kampanya sayfaları" alt={SAYFA.find((s) => s.deger === sayfa)?.yol} geri />
      <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
        <Segment secenekler={SAYFA.map((s) => ({ deger: s.deger, etiket: s.etiket }))} deger={sayfa} degisti={setSayfa} />
        <Segment secenekler={GRUP.map((x) => ({ deger: x.baslik, etiket: x.baslik }))} deger={grup} degisti={setGrup} />
      </View>
      {q.isPending || !taslak ? (q.error ? <View style={{ padding: 16 }}><HataKutusu hata={q.error} tekrar={q.refetch} /></View> : <Yukleniyor />) : (
        <Ekran>
          <Bolum baslik={g.baslik}>
            <Kart style={{ gap: 12 }}>
              <NesneDuzenleyici nesne={taslak[sayfa]} etiket={ETIKET} alanlar={g.alanlar} degisti={(n) => setTaslak({ ...taslak, [sayfa]: n })} />
            </Kart>
          </Bolum>
          <Yazi tur="kucuk" renk={R.metin}>Fiyat alanına "Bilgi Al" yazarsanız sayfada fiyat yerine bu yazı çıkar.</Yazi>
        </Ekran>
      )}
      {degisti ? (
        <View style={{ padding: 16, backgroundColor: R.kart, borderTopWidth: 1, borderTopColor: R.cizgi, flexDirection: "row", gap: 8 }}>
          <Dugme metin="Vazgeç" tur="ikincil" onPress={() => setTaslak(q.data ?? null)} style={{ flex: 1 }} />
          <Dugme metin="Kaydet ve yayınla" ikon="tik" yukleniyor={mesgul} onPress={kaydet} style={{ flex: 2 }} />
        </View>
      ) : null}
    </View>
  );
}
