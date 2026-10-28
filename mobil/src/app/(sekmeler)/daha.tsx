// Daha: web admin panelinin menüsünün tamamı (src/components/admin/HubTabs.tsx ile aynı sıra). Uygulamanın kendi ekranı
// olanlar o ekranda açılır; diğerleri admin sayfası olarak uygulamanın içinde, aynı oturumla (panel.tsx).
import { View } from "react-native";
import { router } from "expo-router";
import { SURUM } from "@/api/istemci";
import { useOturum } from "@/oturum/Oturum";
import { useOzet } from "@/veri/sorgular";
import { Ayrac, Baslik, Bolum, Ekran, Kart, Satir, Yazi } from "@/ui/temel";

type Yetki = "dashboard" | "orders" | "operations" | "content" | "marketing" | "settings" | "users";
type Oge = { ikon: string; baslik: string; yol?: string; web?: string; sayi?: number; yetki?: Yetki };

export default function Daha() {
  const { yetki, yonetici } = useOturum();
  const s = useOzet().data?.sayac;
  const gruplar: { baslik: string; ogeler: Oge[] }[] = [
    { baslik: "Genel", ogeler: [{ ikon: "izgara", baslik: "Dashboard", web: "/admin", yetki: "dashboard" }] },
    { baslik: "Satış", ogeler: [
      { ikon: "gelen", baslik: "Talepler ve iletişim", yol: "/talepler", sayi: s?.yeniTalep, yetki: "orders" },
      { ikon: "eposta", baslik: "Müşteri havuzu", yol: "/talepler?sekme=havuz", yetki: "orders" },
      { ikon: "kullanicilar", baslik: "Üyeler", yol: "/uyeler", yetki: "orders" },
      { ikon: "kampanya2", baslik: "Üye kampanyaları", web: "/admin/uye-kampanyalari", yetki: "orders" },
      { ikon: "paket", baslik: "Siparişler", web: "/admin/orders", yetki: "orders" },
      { ikon: "kullanici", baslik: "CRM", yol: "/talepler?sekme=crm", yetki: "orders" },
      { ikon: "dosya", baslik: "Satış masası", yol: "/satis", yetki: "orders" },
      { ikon: "kabe", baslik: "Ramazan 2027", yol: "/ramazan", yetki: "orders" },
    ] },
    { baslik: "Ürün ve fiyat", ogeler: [
      { ikon: "paket", baslik: "Paketler", web: "/admin/packages", yetki: "operations" },
      { ikon: "belge2", baslik: "Hizmet kütüphanesi", web: "/admin/fiyat-teklifleri/hizmetler", yetki: "orders" },
      { ikon: "fiyat2", baslik: "Aylık fiyatlar", yol: "/fiyatlar", yetki: "orders" },
      { ikon: "arti", baslik: "Ek hizmetler", web: "/admin/services", yetki: "operations" },
      { ikon: "rehber", baslik: "Rehberler", web: "/admin/guides", yetki: "operations" },
      { ikon: "otel", baslik: "Otel rehberi", web: "/admin/otel-rehberi", yetki: "operations" },
    ] },
    { baslik: "Blog", ogeler: [
      { ikon: "kalem", baslik: "Yazılar", web: "/admin/content", yetki: "content" },
      { ikon: "yapayzeka", baslik: "Konu kuyruğu", web: "/admin/blog-kuyrugu", yetki: "content" },
      { ikon: "etiket", baslik: "Kategoriler", web: "/admin/categories", yetki: "content" },
      { ikon: "kullanici", baslik: "Yazarlar", web: "/admin/authors", yetki: "content" },
    ] },
    { baslik: "Site", ogeler: [
      { ikon: "belge", baslik: "Sayfa metinleri", web: "/admin/sayfa-metinleri", yetki: "content" },
      { ikon: "bilgi2", baslik: "Yardım merkezi", web: "/admin/yardim-merkezi", yetki: "content" },
      { ikon: "rehber", baslik: "Rehber sayfaları", web: "/admin/content/rehber", yetki: "content" },
      { ikon: "kampanya2", baslik: "Kampanya sayfaları", web: "/admin/eylul-umresi", yetki: "content" },
      { ikon: "yorum", baslik: "Yorumlar", yol: "/yorumlar", sayi: s?.yorum, yetki: "marketing" },
    ] },
    { baslik: "Influencer", ogeler: [
      { ikon: "ara2", baslik: "Adaylar", web: "/admin/influencer-adaylari", yetki: "marketing" },
      { ikon: "davet", baslik: "Influencerlar ve başvurular", yol: "/influencer/basvurular", sayi: s?.basvuru, yetki: "marketing" },
      { ikon: "icerik", baslik: "İçerik onayı", yol: "/influencer/icerikler", sayi: s?.icerik, yetki: "marketing" },
      { ikon: "link", baslik: "Affiliate", web: "/admin/affiliate", yetki: "marketing" },
      { ikon: "kampanya", baslik: "Kampanyalar", yol: "/kampanyalar", yetki: "marketing" },
    ] },
    { baslik: "Görünürlük", ogeler: [
      { ikon: "ara2", baslik: "SEO Masası", web: "/admin/seo", yetki: "marketing" },
      { ikon: "yapayzeka", baslik: "AI Görünürlük", web: "/admin/ai-visibility", yetki: "marketing" },
      { ikon: "izgara", baslik: "Analytics", web: "/admin/analytics", yetki: "dashboard" },
      { ikon: "belge", baslik: "Yapay zekâ kayıtları", web: "/admin/ai-logs", yetki: "dashboard" },
    ] },
    { baslik: "Sohbetler", ogeler: [
      { ikon: "sohbet", baslik: "Canlı destek", yol: "/destek", sayi: s?.destek, yetki: "marketing" },
      { ikon: "whatsapp", baslik: "WhatsApp konuşmaları", yol: "/whatsapp", sayi: s?.whatsapp, yetki: "marketing" },
      { ikon: "ayarlar", baslik: "WhatsApp AI ayarları", web: "/admin/whatsapp-ai", yetki: "marketing" },
    ] },
    { baslik: "Sistem", ogeler: [
      { ikon: "ayarlar", baslik: "Site ayarları", web: "/admin/settings", yetki: "settings" },
      { ikon: "kullanicilar", baslik: "Kullanıcılar", web: "/admin/users", yetki: "users" },
      { ikon: "kamera", baslik: "Medya", web: "/admin/media", yetki: "content" },
    ] },
  ];
  const ac = (o: Oge) => (o.yol ? router.push(o.yol as never) : router.push({ pathname: "/panel", params: { yol: o.web!, baslik: o.baslik } }));
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
                    <Satir ikon={o.ikon} baslik={o.baslik} rozet={o.sayi || undefined} onPress={() => ac(o)} />
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
