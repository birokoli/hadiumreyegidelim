import Link from "next/link";
import type { Metadata } from "next";
import VisaApplicationForm from "@/components/visa/VisaApplicationForm";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import { pageTitle } from "@/lib/seo/meta";
import { SITE_URL } from "@/lib/seo/site";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero, Panel, Section } from "@/components/ui/kit";
import { getPageTexts } from "@/lib/page-texts";

export const metadata: Metadata = {
  title: pageTitle("Umre Vizesi Başvurusu: Online Başvuru"),
  description: "Umre vizesi başvurusu: kişi başı 140 USD, belgeleriniz tamamsa vize 2 iş saatinde çıkar. Formu doldurun, Suudi e-vizenizi sizin adınıza alalım.",
  alternates: { canonical: `${SITE_URL}/umre-vizesi/basvuru` },
};

const STEPS = [
  { t: "Formu doldurun", d: "Ad soyad, telefon, kişi sayısı ve planlanan gidiş tarihini yazın. Pasaport numarası istemiyoruz." },
  { t: "Sizi arıyoruz", d: "Ekibimiz telefon ya da WhatsApp üzerinden gereken belgeleri ve ödeme adımını bildirir." },
  { t: "Belgeleri güvenle iletin", d: "Pasaport sayfanızın ve vesikalık fotoğrafınızın görüntüsünü görüşmede belirttiğimiz güvenli kanaldan gönderirsiniz." },
  { t: "E-vizeniz gelir", d: "Başvurunuzu Suudi Arabistan'ın elektronik vize sistemi üzerinden yaparız; onaylanan e-vize size iletilir." },
];

const DOCS = [
  "Giriş tarihinden itibaren en az 6 ay geçerli pasaport",
  "Pasaportun fotoğraflı sayfasının net görüntüsü",
  "Yakın tarihli, beyaz fonlu vesikalık fotoğraf (dijital)",
  "İletişim bilgileri: telefon ve e-posta",
];

const FAQ = [
  { q: "Umre vizesi başvurusu nasıl yapılır?", a: "Bu sayfadaki ön başvuru formunu doldurmanız yeterli. Ekibimiz sizi arayarak gereken belgeleri bildirir; başvuruyu elektronik vize sistemi üzerinden sizin adınıza yaparız." },
  { q: "Umre vizesi başvurusu için hangi belgeler gerekir?", a: "Giriş tarihinden itibaren en az 6 ay geçerli pasaport, pasaportun fotoğraflı sayfasının görüntüsü, dijital vesikalık fotoğraf ve iletişim bilgileri gerekir." },
  { q: "Vize ücreti ve çıkış süresi ne kadar?", a: "Umre vizesi hizmetimizin ücreti kişi başı 140 USD'dir. Belgeleriniz eksiksiz ulaştıktan sonra vize 2 iş saati içinde çıkar. Umre paketimizi ya da bireysel umre planınızı bizden alırsanız vize işlemleri aynı planda yürütülür." },
  { q: "Pasaport bilgilerimi forma neden yazmıyorum?", a: "Kişisel verilerinizi korumak için formda pasaport numarası istemiyoruz. Belgeleri görüşmede belirttiğimiz güvenli kanaldan alırız." },
];

export default async function VisaApplicationPage() {
  const t = await getPageTexts("umre-vizesi-basvuru");
  const whatsappNumber = ((await getSiteSettings()).WHATSAPP_NUMBER || "905404010038").replace("+", "");
  const url = `${SITE_URL}/umre-vizesi/basvuru`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Service", name: "Umre vizesi başvurusu", serviceType: "Suudi Arabistan e-vize başvurusu", provider: { "@type": "TravelAgency", name: "Hadi Umreye Gidelim", url: SITE_URL }, areaServed: "TR", url, offers: { "@type": "Offer", price: "140", priceCurrency: "USD", description: "Kişi başı umre vizesi hizmeti; belgeler tamamsa 2 iş saatinde", url } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Umre vizesi", item: `${SITE_URL}/umre-vizesi` },
      { "@type": "ListItem", position: 3, name: "Başvuru", item: url },
    ] },
    webPageJsonLd({ url, name: "Umre vizesi başvurusu" }),
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        crumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Umre Vizesi", href: "/umre-vizesi" },
          { label: "Başvuru" },
        ]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
        aside={
          <Panel tone="white" className="p-6 md:p-8">
            <VisaApplicationForm whatsappNumber={whatsappNumber} />
          </Panel>
        }
      />

      <Section tone="white">
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary mb-4">{t("steps_title")}</h2>
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-white font-bold flex items-center justify-center">{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-on-surface">{s.t}</span>
                    <span className="block text-[15px] text-on-surface-variant mt-0.5">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-headline text-2xl font-bold text-primary mb-4">{t("docs_title")}</h2>
            <ul className="space-y-2 pl-5 list-disc marker:text-primary text-on-surface-variant">
              {DOCS.map((d) => <li key={d}>{d}</li>)}
            </ul>
            <p className="mt-3 text-sm text-on-surface-variant">
              Vize türü, geçerlilik ve kalış süresi için <Link href="/umre-vizesi" className="text-primary font-semibold underline underline-offset-4">umre vizesi rehberimize</Link> bakabilirsiniz.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-4">{t("faq_title")}</h2>
            <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
              {FAQ.map((f) => (
                <div key={f.q} className="py-5">
                  <h3 className="font-semibold text-lg text-on-surface">{f.q}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[15px] text-on-surface-variant">
              Vizeyle birlikte konaklama da planlamak için <Link href="/bireysel-umre" className="text-primary font-semibold underline underline-offset-4">bireysel umre tasarlayıcısını</Link> kullanabilirsiniz.
            </p>
            <PageTrust className="mt-8" />
          </div>
        </div>
      </Section>
    </main>
  );
}
