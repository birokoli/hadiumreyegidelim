// Teklif bağlantısının paylaşım önizlemesi (29 Ekim, kullanıcı: WhatsApp'ta kart boş çıkıyordu).
// /t/<token> veritabanına gidip bazen 5 sn'de açılıyor; WhatsApp beklemeyip kartı boş bırakıyor. Önizleme botları
// middleware'de sabit, önbellekli /teklif-onizleme sayfasına yönlenir; müşteri her zamanki teklif sayfasını görür.
// Metadata statik olmalı: generateMetadata etiketleri tanınmayan tarayıcılara <head> dışında akıtıyor.
// Önizlemede müşteri adı ve tutar yok.
import type { Metadata } from "next";

export const ONIZLEME_BOTU = /whatsapp|facebookexternalhit|facebookcatalog|meta-externalagent|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|skypeuripreview|viber|line\/|applebot|google-pagerenderer|embedly|iframely/i;

const baslik = "Umre teklifiniz hazır";
const aciklama = "Teklif detayını görmek için dokunun: oteller, dahil hizmetler, toplam ve ödeme planı.";
// Görsel sabit dosya (/og çıktısının kopyası): ilk istekte üretilmesi 2 sn sürüyor, WhatsApp beklemeden kartı boş bırakıyordu
const gorsel = "/teklif-onizleme.jpg";

export const TEKLIF_ONIZLEME: Metadata = {
  title: "Umre teklifiniz",
  description: aciklama,
  robots: { index: false, follow: false },
  openGraph: { title: baslik, description: aciklama, type: "website", images: [{ url: gorsel, width: 1200, height: 630, alt: baslik }] },
  twitter: { card: "summary_large_image", title: baslik, description: aciklama, images: [gorsel] },
};
