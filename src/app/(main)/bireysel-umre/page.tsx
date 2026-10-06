// Bireysel umre planlayıcısı (v2): kendi kataloğumuz ve aylık fiyatlarımızla. Eski adımlı tasarlayıcı ve
// /bireysel-umre/yeni önizlemesi buraya kalıcı yönlenir (2 Ekim 2026).
import type { Metadata } from "next";
import HugIcon from "@/components/icons/HugIcon";
import { SITE_URL } from "@/lib/seo/site";
import { ButtonLink, Container, Faq, faqJsonLd, PageHero, Panel, Section, SectionHead, Steps } from "@/components/ui/kit";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import PlannerV2 from "@/components/planner/PlannerV2";
import { getCatalog, monthsFrom, monthLabel, paymentSettingsFrom } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { VEHICLE_IMAGES_SETTING_KEY, parseVehicleImages } from "@/lib/catalog/transfers";
import { getPageTexts } from "@/lib/page-texts";

export const metadata: Metadata = {
  title: "Bireysel Umre 2026: Planla, Fiyatı Gör",
  description: "Tarihleri, Mekke ve Medine otelini, transferi ve e-vizeyi seçin; bireysel umre fiyatını anında görün. Planı gönderin, kesin teklifi iletelim.",
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

const COMPARISON = {
  bireysel: {
    title: "Bireysel Umre",
    desc: "Ailenize ve bütçenize özel esnek planlama",
    items: [
      "Tarih esnekliği: İstediğiniz gün gidin, istediğiniz kadar kalın",
      "Otel seçimi: Harem'e yakınlık ve bütçenize göre otelinizi kendiniz seçin",
      "Özel transfer: Havalimanı ve şehirler arası ulaşımda sadece ailenize özel araç",
      "Rehberlik isteğe bağlı: Mekke ve Medine'de Türkçe rehber eşliği ekleyebilirsiniz",
    ],
  },
  grup: {
    title: "Grup Umresi",
    desc: "Sabit takvimli ve toplu kafile programları",
    items: [
      "Sabit tarihler: Acente tarafından önceden belirlenmiş tur takvimine uyma zorunluluğu",
      "Standart otel: Grubun konakladığı otel seçeneğiyle sınırlı olma",
      "Otobüs transferi: Tüm kafileyle birlikte toplu otobüs transferleri",
      "Sabit akış: Grup temposuna bağlı günlük ziyaret ve hareket programı",
    ],
  },
};

export default async function BireyselUmrePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = await getPageTexts("bireysel-umre");
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
        crumbs={[{ label: t("crumb_home"), href: "/" }, { label: t("crumb_title") }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
      />
      <Container>
        <PlannerV2 catalog={catalog} months={months} whatsappNumber={whatsappNumber} payment={paymentSettingsFrom(settings)} query={query} todayYmd={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" })} vehicleImages={parseVehicleImages(settings[VEHICLE_IMAGES_SETTING_KEY])} />
      </Container>

      <Section>
        <SectionHead kicker={t("steps_kicker")} title={t("steps_title")} />
        <Steps items={STEPS} />
      </Section>

      
      <Section tone="muted">
        <SectionHead kicker={t("comp_kicker")} title={t("comp_title")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Panel tone="primary" className="p-6 md:p-8">
            <h3 className="font-headline text-xl font-bold">{COMPARISON.bireysel.title}</h3>
            <p className="text-xs text-white/80 mt-1 mb-4">{COMPARISON.bireysel.desc}</p>
            <ul className="space-y-3">
              {COMPARISON.bireysel.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/95 leading-relaxed">
                  <HugIcon name="onay" size={18} className="text-amber-300 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel tone="white" className="p-6 md:p-8 border border-outline-variant/30">
            <h3 className="font-headline text-xl font-bold text-on-surface">{COMPARISON.grup.title}</h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">{COMPARISON.grup.desc}</p>
            <ul className="space-y-3">
              {COMPARISON.grup.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface-variant leading-relaxed">
                  <HugIcon name="bilgi" size={18} className="text-outline shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <ButtonLink href="/umre-vizesi" tone="secondary">Umre Vizesi</ButtonLink>
          <ButtonLink href="/hizmetler" tone="secondary">Hizmetlerimiz</ButtonLink>
          <ButtonLink href="/umre-rehberi/bireysel-umre-mi-turla-umre-mi" tone="secondary">Karşılaştırma Rehberi</ButtonLink>
          <ButtonLink href="/ilk-umrem" tone="secondary">İlk Umrem</ButtonLink>
        </div>
      </Section>

      <Section tone="white">
        <div className="max-w-screen-md mx-auto">
          <SectionHead kicker={t("faq_kicker")} title={t("faq_title")} />
          <Faq items={FAQ} />
          <PageTrust className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
