export type CampaignPackage = { days: string; double: string; triple: string; quad: string };
export type CampaignIncludedItem = { icon: string; label: string; detail: string };
export type CampaignFaq = { q: string; a: string };

export type EylulCampaignConfig = {
  seoTitle: string;
  seoDescription: string;
  heroImage: string;
  footerImage: string;
  badgeText: string;
  title: string;
  highlightedTitle: string;
  startingPrice: string;
  priceSuffix: string;
  departureOneLabel: string;
  departureOne: string;
  departureTwoLabel: string;
  departureTwo: string;
  dateSummary: string;
  capacity: string;
  heroNote: string;
  heroButton: string;
  reserveButton: string;
  whatsappMessage: string;
  packagesKicker: string;
  packagesTitle: string;
  packagesButton: string;
  roomDoubleLabel: string;
  roomTripleLabel: string;
  roomQuadLabel: string;
  packages: CampaignPackage[];
  childKicker: string;
  childTitle: string;
  childTwoToElevenLabel: string;
  childTwoToEleven: string;
  childZeroToTwoLabel: string;
  childZeroToTwo: string;
  includedKicker: string;
  includedTitle: string;
  includedItems: CampaignIncludedItem[];
  hotelDetail: string;
  notesTitle: string;
  notes: string[];
  notesButton: string;
  faqKicker: string;
  faqTitle: string;
  faqButton: string;
  faqs: CampaignFaq[];
  footerTitle: string;
  footerDescription: string;
  footerNote: string;
  footerButton: string;
  homeBadge: string;
  homeTitle: string;
  homeDescription: string;
  homeButton: string;
  homeFeatures: string[];
  readyCtaKicker: string;
  readyCtaTitle: string;
  readyCtaDescription: string;
  readyCtaNote: string;
  readyCtaButton: string;
  readyCtaImage: string;
  readyCtaWhatsappMessage: string;
  finalAdsBadge: string;
  finalAdsTitle: string;
  finalAdsDescription: string;
  finalAdsNote: string;
  finalAdsButton: string;
  finalAdsImage: string;
  finalAdsWhatsappMessage: string;
};

export const EYLUL_CAMPAIGN_SETTING_KEY = "EYLUL_CAMPAIGN_CONFIG";

export const DEFAULT_EYLUL_CAMPAIGN: EylulCampaignConfig = {
  seoTitle: "Eylül Grup Umresi — 10, 15 ve 20 Günlük Programlar | HadiUmreyeGidelim",
  seoDescription: "15 veya 25 Eylül çıkışlı grup umresi. Kişi başı 1.250 USD'den başlayan fiyatlarla vize, uçak bileti, Kâbe'ye yürüme mesafesinde otel ve mübarek yerler turu dahil.",
  heroImage: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=2600&auto=format&fit=crop",
  footerImage: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=2600&auto=format&fit=crop",
  badgeText: "SINIRLI KONTENJAN — 15 VEYA 25 EYLÜL ÇIKIŞLI",
  title: "Eylül",
  highlightedTitle: "Grup Umresi",
  startingPrice: "$1.250",
  priceSuffix: "/ kişi başı",
  departureOneLabel: "1. Çıkış",
  departureOne: "15 Eylül",
  departureTwoLabel: "2. Çıkış",
  departureTwo: "25 Eylül",
  dateSummary: "15 veya 25 Eylül · 10, 15 veya 20 Gün",
  capacity: "35",
  heroNote: "Grup umresi · Toplam 35 kişilik kontenjan",
  heroButton: "WhatsApp'a Yaz",
  reserveButton: "Yer Ayırt",
  whatsappMessage: "Merhaba, 15 veya 25 Eylül çıkışlı grup umresi kampanyası hakkında bilgi almak istiyorum.",
  packagesKicker: "Program Seçenekleri",
  packagesTitle: "Kişi Başı Umre Fiyatları",
  packagesButton: "Paket Hakkında Bilgi Al",
  roomDoubleLabel: "2 Kişilik Oda",
  roomTripleLabel: "3 Kişilik Oda",
  roomQuadLabel: "4 Kişilik Oda",
  packages: [
    { days: "10 Günlük Umre", double: "$1.350", triple: "$1.300", quad: "$1.250" },
    { days: "15 Günlük Umre", double: "$1.400", triple: "$1.350", quad: "$1.300" },
    { days: "20 Günlük Umre", double: "$1.500", triple: "$1.450", quad: "$1.400" },
  ],
  childKicker: "Çocuk Fiyatları",
  childTitle: "Çocuklar İçin Kişi Başı Ücretler",
  childTwoToElevenLabel: "2–11 Yaş Çocuk",
  childTwoToEleven: "$1.000",
  childZeroToTwoLabel: "0–2 Yaş Çocuk",
  childZeroToTwo: "$750",
  includedKicker: "Pakete Dahil",
  includedTitle: "Her Şey Düşünüldü",
  includedItems: [
    { icon: "flight", label: "Gidiş – Dönüş Uçak Bileti", detail: "Pakete dahil" },
    { icon: "badge", label: "Umre Vizesi", detail: "Pakete dahil" },
    { icon: "hotel", label: "Otel Konaklaması", detail: "Kâbe'ye yürüme mesafesinde" },
    { icon: "mosque", label: "Tüm Mübarek Yerler Turu", detail: "Program dahilinde" },
  ],
  hotelDetail: "Kâbe'ye yürüme mesafesinde",
  notesTitle: "Fiyat ve Kontenjan Notu",
  notes: ["Bütün fiyatlar kişi başı ücrettir.", "Program grup umresidir ve toplam kontenjan 35 kişidir.", "Otel Kâbe'ye yürüme mesafesindedir."],
  notesButton: "Fiyat Hesaplat",
  faqKicker: "Sıkça Sorulan Sorular",
  faqTitle: "Aklınızdaki Sorular",
  faqButton: "Sorunuzu Sorun",
  faqs: [
    { q: "Uçak bileti ve vize dahil mi?", a: "Evet. Gidiş–dönüş uçak bileti ve umre vizesi belirtilen kişi başı paket fiyatlarına dahildir." },
    { q: "Otel Kâbe'ye ne kadar uzaklıkta?", a: "Konaklama yapılacak otel Kâbe'ye yürüme mesafesindedir." },
    { q: "Fiyatlar oda başına mı, kişi başına mı?", a: "Bütün fiyatlar kişi başı ücretlerdir. Yetişkin fiyatı, tercih edilen program süresine ve oda tipine göre belirlenir." },
    { q: "Kontenjan kaç kişi?", a: "Bu grup umresi için toplam kontenjan 35 kişidir." },
  ],
  footerTitle: "15 veya 25 Eylül Çıkışlı",
  footerDescription: "Kişi başı $1.250 ile manevi yolculuğunuzu şimdi planlayın.",
  footerNote: "Grup umresi · Toplam 35 kişilik kontenjan",
  footerButton: "WhatsApp'a Yaz",
  homeBadge: "35 KİŞİLİK KONTENJAN · 15 VEYA 25 EYLÜL",
  homeTitle: "Eylül Grup Umresi — Kişi Başı $1.250'den",
  homeDescription: "10, 15 veya 20 günlük programlar · Vize, uçak bileti, otel ve tüm mübarek yerler turu dahil.",
  homeButton: "Kampanyayı İncele",
  homeFeatures: ["Kâbe'ye Yürüme Mesafesinde Otel", "Vize Dahil", "Uçak Bileti Dahil", "Mübarek Yerler Turu Dahil"],
  readyCtaKicker: "İlk Manevi Yolculuğunuz",
  readyCtaTitle: "İlk Umrem Kampanyası",
  readyCtaDescription: "İlk kez umreye gidecek misafirlerimiz için hazırlık aşamasından ibadetlerin tamamlanmasına kadar rehberli ve güvenli bir program.",
  readyCtaNote: "İlk kez umreye gideceklere özel rehberlik",
  readyCtaButton: "İlk Umrem İçin Bilgi Al",
  readyCtaImage: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1600&auto=format&fit=crop",
  readyCtaWhatsappMessage: "Merhaba, İlk Umrem Kampanyası hakkında bilgi almak istiyorum.",
  finalAdsBadge: "HANIMLARA ÖZEL MANEVİ YOLCULUK",
  finalAdsTitle: "Hanım Umresi Kampanyası",
  finalAdsDescription: "Hanım misafirlerimize özel, huzurlu ve güvenli grup düzeniyle manevi yolculuğunuzu birlikte planlayalım.",
  finalAdsNote: "Program detayları ve müsait tarihler için bize ulaşın",
  finalAdsButton: "Hanım Umresi İçin Bilgi Al",
  finalAdsImage: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop",
  finalAdsWhatsappMessage: "Merhaba, Hanım Umresi Kampanyası hakkında bilgi almak istiyorum.",
};

export function parseEylulCampaign(value?: string | null): EylulCampaignConfig {
  if (!value) return DEFAULT_EYLUL_CAMPAIGN;
  try {
    const parsed = JSON.parse(value) as Partial<EylulCampaignConfig> & { includedServices?: string[] };
    const legacyIncluded = Array.isArray(parsed.includedServices)
      ? parsed.includedServices.map((label, index) => ({ ...DEFAULT_EYLUL_CAMPAIGN.includedItems[index], label }))
      : undefined;
    return {
      ...DEFAULT_EYLUL_CAMPAIGN,
      ...parsed,
      packages: Array.isArray(parsed.packages) && parsed.packages.length
        ? parsed.packages.slice(0, 3).map((item, index) => ({ ...DEFAULT_EYLUL_CAMPAIGN.packages[index], ...item }))
        : DEFAULT_EYLUL_CAMPAIGN.packages,
      includedItems: Array.isArray(parsed.includedItems) && parsed.includedItems.length
        ? parsed.includedItems.map((item, index) => ({ ...DEFAULT_EYLUL_CAMPAIGN.includedItems[index], ...item }))
        : legacyIncluded || DEFAULT_EYLUL_CAMPAIGN.includedItems,
      notes: Array.isArray(parsed.notes) && parsed.notes.length ? parsed.notes.filter(Boolean) : DEFAULT_EYLUL_CAMPAIGN.notes,
      faqs: Array.isArray(parsed.faqs) && parsed.faqs.length ? parsed.faqs.map((item) => ({ q: item.q || "", a: item.a || "" })) : DEFAULT_EYLUL_CAMPAIGN.faqs,
      homeFeatures: Array.isArray(parsed.homeFeatures) && parsed.homeFeatures.length ? parsed.homeFeatures.filter(Boolean) : DEFAULT_EYLUL_CAMPAIGN.homeFeatures,
    };
  } catch {
    return DEFAULT_EYLUL_CAMPAIGN;
  }
}
