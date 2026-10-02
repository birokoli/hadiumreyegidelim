// Bireysel umre planlayıcısı (v2): kendi kataloğumuz ve aylık fiyatlarımızla. Eski adımlı tasarlayıcı ve
// /bireysel-umre/yeni önizlemesi buraya kalıcı yönlenir (2 Ekim 2026).
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { Container, Faq, faqJsonLd, PageHero, Section, SectionHead, Steps } from "@/components/ui/kit";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import PlannerV2 from "@/components/planner/PlannerV2";
import { getCatalog, monthsFrom, monthLabel, paymentSettingsFrom } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { VEHICLE_IMAGES_SETTING_KEY, parseVehicleImages } from "@/lib/catalog/transfers";

export const metadata: Metadata = {
  title: "Bireysel Umre Planlayıcı 2026: Otel, Transfer ve Vize Fiyatı",
  description: "Bireysel umrenizi kendiniz planlayın: tarihleri, Mekke ve Medine otelini, transferi ve e-vizeyi seçin, toplam fiyatı anında görün. Planı gönderin, kesin teklifi iletelim.",
  alternates: { canonical: "/bireysel-umre" },
};

const STEPS = [
  { title: "Tarih ve kişi", text: "Giriş-çıkış tarihlerini, Mekke ve Medine gece sayısını, yetişkin, çocuk ve bebek sayısını seçin." },
  { title: "Otel, transfer, vize", text: "Mekke ve Medine otelinizi listeden seçin; transferi ve Suudi Arabistan e-vizesini ekleyin ya da çıkarın." },
  { title: "Fiyatı görün, gönderin", text: "Toplam fiyat o ayın güncel fiyatlarıyla anında hesaplanır. Planı gönderin, ekibimiz kesin teklifi iletsin." },
];

// Metin ile şema aynı diziden üretilir
const FAQ = [
  { q: "Bireysel umre nedir?", a: "Bireysel umre, sabit tarihli bir gruba katılmadan; tarihlerinizi, Mekke ve Medine otelinizi, transferinizi ve vizenizi kendinizin seçtiği umredir. Bu sayfadaki planlayıcıda hepsini seçip toplam fiyatı görebilirsiniz." },
  { q: "Bireysel umre fiyatı nasıl hesaplanır?", a: "Otel fiyatları 1 oda, 1 gece içindir (giriş 16.00, ertesi gün çıkış 11.00). Bir odada en fazla 4 kişi kalır: 1–4 kişi 1 oda, 5–8 kişi 2 oda. Otel tutarı gecelik fiyat × gece sayısı × oda sayısıdır. Transfer araç ya da kişi başı, vize kişi başı eklenir. Fiyatlar seçtiğiniz ayın güncel fiyatlarıdır; IBAN ve kartla ödeme tutarları ayrıca gösterilir." },
  { q: "Umre vizesi fiyata dahil mi?", a: "İsterseniz eklenir. Suudi Arabistan e-vize kişi başı 140 USD'dir; belgeleriniz tamamsa vizeniz 2 iş saati içinde çıkar. Vizeniz varsa planlayıcıda \"Vizem var\" seçeneğini işaretlemeniz yeterli." },
  { q: "Uçak bileti planlayıcıda var mı?", a: "Hayır. Uçak biletinizi kendiniz alırsınız; planlayıcı giriş-çıkış tarihlerinize göre konaklama, transfer, vize ve ek hizmetleri hesaplar." },
  { q: "Bebekle gidersem oda sayısı değişir mi?", a: "Hayır. 0–2 yaş bebekler otele bildirilmez ve oda sayısına girmez; bebek başına gecelik beşik ücreti eklenir." },
  { q: "Planı gönderdikten sonra ne oluyor?", a: "Planınız ekibimize ulaşır; otel müsaitliğini kontrol edip kesin teklifi ve ödeme bilgisini WhatsApp üzerinden iletiriz. Plan göndermek ödeme yükümlülüğü doğurmaz." },
];

export default async function BireyselUmrePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const query = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const [catalog, settings] = await Promise.all([getCatalog(), getSiteSettings().catch(() => ({} as Record<string, string>))]);
  const months = monthsFrom().map((m) => ({ value: m, label: monthLabel(m) }));
  const whatsappNumber = (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "");
  const url = `${SITE_URL}/bireysel-umre`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Bireysel Umre", item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Bireysel umre planlama",
      serviceType: "Bireysel umre: otel, transfer, vize ve rehberlik",
      areaServed: [{ "@type": "City", name: "Mekke" }, { "@type": "City", name: "Medine" }],
      provider: { "@type": "TravelAgency", name: "Hadi Umreye Gidelim", url: SITE_URL },
      url,
    },
    faqJsonLd(FAQ),
    webPageJsonLd({ url, name: "Bireysel Umre Planlayıcı 2026" }),
  ];

  return (
    <main className="bg-surface pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Bireysel Umre" }]}
        kicker="Bireysel umre 2026"
        title="Umrenizi planlayın, fiyatı hemen görün"
        lead="Tarihlerinizi, Mekke ve Medine otelinizi, transferinizi ve vizenizi seçin; seçtiğiniz ayın güncel fiyatıyla toplamı görün. Planı gönderin, kesin teklifi ekibimiz iletsin."
      />
      <Container>
        <PlannerV2 catalog={catalog} months={months} whatsappNumber={whatsappNumber} payment={paymentSettingsFrom(settings)} query={query} todayYmd={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" })} vehicleImages={parseVehicleImages(settings[VEHICLE_IMAGES_SETTING_KEY])} />
      </Container>

      <Section>
        <SectionHead kicker="Nasıl çalışır?" title="Üç adımda bireysel umre planı" />
        <Steps items={STEPS} />
      </Section>

      <Section tone="white">
        <div className="max-w-screen-md mx-auto">
          <SectionHead kicker="Sık sorulanlar" title="Bireysel umre hakkında sorular" />
          <Faq items={FAQ} />
          <PageTrust className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
