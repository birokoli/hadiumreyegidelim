// Daha: diğer bölümler (yetkiye göre) ve ayarlar. Masaüstüne özgü işler (SEO, içerik düzenleme…) web panelinde açılır.
import { Linking, View } from "react-native";
import { router } from "expo-router";
import { API_URL, SURUM } from "@/api/istemci";
import { useOturum } from "@/oturum/Oturum";
import { useOzet } from "@/veri/sorgular";
import { Ayrac, Baslik, Bolum, Ekran, Kart, Satir, Yazi } from "@/ui/temel";

type Oge = { ikon: string; baslik: string; alt?: string; yol?: string; web?: string; sayi?: number; yetki?: "orders" | "marketing" };

export default function Daha() {
  const { yetki, yonetici } = useOturum();
  const s = useOzet().data?.sayac;
  const gruplar: { baslik: string; ogeler: Oge[] }[] = [
    { baslik: "Satış", ogeler: [
      { ikon: "kabe", baslik: "Ramazan rezervasyonları", yol: "/ramazan", yetki: "orders" },
      { ikon: "kullanicilar", baslik: "Üyeler", yol: "/uyeler", yetki: "orders" },
      { ikon: "fiyat2", baslik: "Hizmet fiyatları", yol: "/fiyatlar", yetki: "orders" },
    ] },
    { baslik: "Pazarlama", ogeler: [
      { ikon: "yorum", baslik: "Yorumlar", yol: "/yorumlar", sayi: s?.yorum, yetki: "marketing" },
      { ikon: "icerik", baslik: "Influencer içerikleri", yol: "/influencer/icerikler", sayi: s?.icerik, yetki: "marketing" },
      { ikon: "davet", baslik: "Influencer'lar ve başvurular", yol: "/influencer/basvurular", sayi: s?.basvuru, yetki: "marketing" },
      { ikon: "kampanya2", baslik: "Kampanyalar", yol: "/kampanyalar", yetki: "marketing" },
      { ikon: "sohbet", baslik: "Destek mesajları", yol: "/destek", sayi: s?.destek, yetki: "marketing" },
      { ikon: "whatsapp", baslik: "WhatsApp konuşmaları", yol: "/whatsapp", sayi: s?.whatsapp, yetki: "marketing" },
    ] },
    { baslik: "Web panelinde", ogeler: [
      { ikon: "web", baslik: "SEO Masası", web: "/admin/seo", alt: "Masaüstünde daha rahat" },
      { ikon: "web", baslik: "Blog ve içerik", web: "/admin/content" },
      { ikon: "web", baslik: "Paketler ve sayfa metinleri", web: "/admin/packages" },
    ] },
  ];
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
                    <Satir ikon={o.ikon} baslik={o.baslik} alt={o.alt} rozet={o.sayi || undefined} onPress={() => (o.yol ? router.push(o.yol as never) : Linking.openURL(`${API_URL}${o.web}`))} />
                  </View>
                ))}
              </Kart>
            </Bolum>
          );
        })}
        <Kart style={{ padding: 0, overflow: "hidden" }}>
          <Satir ikon="ayarlar" baslik="Ayarlar" alt="Bildirimler, cihazlar, çıkış" onPress={() => router.push("/ayarlar")} />
        </Kart>
        <Yazi tur="kucuk" style={{ textAlign: "center" }}>Hadi Yönetim {SURUM}</Yazi>
      </Ekran>
    </View>
  );
}
