// Daha: web admin panelinin menüsünün tamamı (src/components/admin/HubTabs.tsx ile aynı sıra). Hepsi uygulamanın kendi ekranı;
// web paneline yönlendirme yok (1 Kasım, kullanıcı: "siteye yönlendiriyor, bunu görmek istemiyorum").
import { View } from "react-native";
import { router } from "expo-router";
import { SURUM } from "@/api/istemci";
import { useOturum } from "@/oturum/Oturum";
import { useOzet } from "@/veri/sorgular";
import { Ayrac, Baslik, Bolum, Ekran, Kart, Satir, Yazi } from "@/ui/temel";

type Yetki = "dashboard" | "orders" | "operations" | "content" | "marketing" | "settings" | "users";
type Oge = { ikon: string; baslik: string; alt?: string; yol: string; sayi?: number; yetki?: Yetki };

export default function Daha() {
  const { yetki, yonetici } = useOturum();
  const s = useOzet().data?.sayac;
  const gruplar: { baslik: string; ogeler: Oge[] }[] = [
    { baslik: "Genel", ogeler: [{ ikon: "izgara", baslik: "Raporlar", alt: "Satış, ciro, kâr, site sayaçları", yol: "/raporlar", yetki: "dashboard" }] },
    { baslik: "Satış", ogeler: [
      { ikon: "gelen", baslik: "Talepler ve iletişim", yol: "/talepler", sayi: s?.yeniTalep, yetki: "orders" },
      { ikon: "eposta", baslik: "Müşteri havuzu", yol: "/talepler?sekme=havuz", yetki: "orders" },
      { ikon: "kullanicilar", baslik: "Üyeler", yol: "/uyeler", yetki: "orders" },
      { ikon: "kampanya2", baslik: "Üye kampanyaları", yol: "/pazarlama/uye-kampanyalari", yetki: "orders" },
      { ikon: "paket", baslik: "Siparişler", yol: "/site/siparisler", yetki: "orders" },
      { ikon: "kullanici", baslik: "CRM", yol: "/talepler?sekme=crm", yetki: "orders" },
      { ikon: "dosya", baslik: "Satış masası", yol: "/satis", yetki: "orders" },
      { ikon: "kabe", baslik: "Ramazan 2027", yol: "/ramazan", yetki: "orders" }
    ] },
    { baslik: "Ürün ve fiyat", ogeler: [
      { ikon: "paket", baslik: "Paketler", yol: "/site/paketler", yetki: "operations" },
      { ikon: "belge2", baslik: "Hizmet kütüphanesi", yol: "/fiyat/kutuphane", yetki: "orders" },
      { ikon: "fiyat2", baslik: "Aylık fiyatlar", yol: "/fiyatlar", yetki: "orders" },
      { ikon: "arti", baslik: "Ek hizmetler", yol: "/site/ek-hizmetler", yetki: "operations" },
      { ikon: "rehber", baslik: "Rehberler", yol: "/site/rehberler", yetki: "operations" },
      { ikon: "otel", baslik: "Otel rehberi", yol: "/site/otel-rehberi", yetki: "operations" }
    ] },
    { baslik: "Blog", ogeler: [
      { ikon: "kalem", baslik: "Yazılar", yol: "/blog", yetki: "content" },
      { ikon: "yapayzeka", baslik: "Konu kuyruğu", yol: "/blog/kuyruk", yetki: "content" },
      { ikon: "etiket", baslik: "Kategoriler", yol: "/site/kategoriler", yetki: "content" },
      { ikon: "kullanici", baslik: "Yazarlar", yol: "/site/yazarlar", yetki: "content" }
    ] },
    { baslik: "Site", ogeler: [
      { ikon: "belge", baslik: "Sayfa metinleri", yol: "/site/sayfa-metinleri", yetki: "content" },
      { ikon: "bilgi2", baslik: "Yardım merkezi (SSS)", yol: "/site/sayfa/sss", yetki: "content" },
      { ikon: "rehber", baslik: "Rehber sayfaları", yol: "/site/rehber-sayfalari", yetki: "content" },
      { ikon: "kampanya2", baslik: "Kampanya sayfaları", yol: "/site/kampanya-sayfalari", yetki: "content" },
      { ikon: "yorum", baslik: "Yorumlar", yol: "/yorumlar", sayi: s?.yorum, yetki: "marketing" }
    ] },
    { baslik: "Influencer", ogeler: [
      { ikon: "ara2", baslik: "Adaylar", yol: "/pazarlama/adaylar", yetki: "marketing" },
      { ikon: "davet", baslik: "Influencerlar ve başvurular", yol: "/influencer/basvurular", sayi: s?.basvuru, yetki: "marketing" },
      { ikon: "icerik", baslik: "İçerik onayı", yol: "/influencer/icerikler", sayi: s?.icerik, yetki: "marketing" },
      { ikon: "link", baslik: "Affiliate", yol: "/pazarlama/affiliate", yetki: "marketing" },
      { ikon: "kampanya", baslik: "Kampanyalar", yol: "/kampanyalar", yetki: "marketing" }
    ] },
    { baslik: "Görünürlük", ogeler: [
      { ikon: "ara2", baslik: "SEO Masası", yol: "/pazarlama/seo", yetki: "marketing" },
      { ikon: "yapayzeka", baslik: "AI Görünürlük", yol: "/pazarlama/ai-gorunurluk", yetki: "marketing" }
    ] },
    { baslik: "Sohbetler", ogeler: [
      { ikon: "sohbet", baslik: "Canlı destek", yol: "/destek", sayi: s?.destek, yetki: "marketing" },
      { ikon: "whatsapp", baslik: "WhatsApp konuşmaları", yol: "/whatsapp", sayi: s?.whatsapp, yetki: "marketing" },
      { ikon: "ayarlar", baslik: "WhatsApp AI ayarları", yol: "/pazarlama/whatsapp-ai", yetki: "marketing" }
    ] },
    { baslik: "Sistem", ogeler: [
      { ikon: "ayarlar", baslik: "Site ayarları", yol: "/sistem/site-ayarlari", yetki: "settings" },
      { ikon: "kullanicilar", baslik: "Kullanıcılar", yol: "/site/kullanicilar", yetki: "users" },
      { ikon: "kamera", baslik: "Medya", yol: "/site/medya", yetki: "content" }
    ] }
    ];
  const ac = (o: Oge) => router.push(o.yol as never);
  return (
    <View style={{ flex: 1 }}>
      <Baslik baslik="Daha" alt={yonetici?.ad} />
      <Ekran>
        {gruplar.map((g) => {
          const ogeler = g.ogeler.filter((o) => !o.yetki || yetki(o.yetki));
          if (!ogeler.length) return null;
          return (
            <Bolum key={g.baslik} baslik={g.baslik}>
              <Kart style={{ padding: 0, overflow: "hidden" }}>
                {ogeler.map((o, i) => (
                  <View key={o.baslik}>
                    {i ? <Ayrac /> : null}
                    <Satir ikon={o.ikon} baslik={o.baslik} alt={o.alt} rozet={o.sayi || undefined} onPress={() => ac(o)} />
                  </View>
                ))}
              </Kart>
            </Bolum>
          );
        })}
        <Kart style={{ padding: 0, overflow: "hidden" }}>
          <Satir ikon="ayarlar" baslik="Uygulama ayarları" alt="Bildirimler, cihazlar, çıkış, güncelleme" onPress={() => router.push("/ayarlar")} />
        </Kart>
        <Yazi tur="kucuk" style={{ textAlign: "center" }}>Hadi Yönetim {SURUM}</Yazi>
      </Ekran>
    </View>
  );
}
