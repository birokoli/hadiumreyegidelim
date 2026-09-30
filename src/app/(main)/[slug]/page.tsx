import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BireyselUmreClient from "@/components/features/BireyselUmreClient";
import { turkeyCities, getTurkishCityBySlug, type TurkeyCity } from "@/lib/turkey-cities";
import { cityTravelFacts, nearestCities, type Region } from "@/lib/city-geo";
import { DEFAULT_OG_IMAGE, metaDescription, pageTitle } from "@/lib/seo/meta";
import ContentPageView from "@/components/content/ContentPageView";
import { CONTENT_PAGES, getContentPage } from "@/content/pages";
import { pageTitles } from "@/content/pages/titles";
import { getSiteSettings } from "@/lib/site-settings";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";

type Props = {
  params: Promise<{ slug: string }>;
};

const SUFFIX = "-cikisli-bireysel-umre";

export function generateStaticParams() {
  return [
    ...turkeyCities.map((city) => ({ slug: `${city.slug}${SUFFIX}` })),
    // Rehber sayfalarının kişi ve zaman grupları kök adreste (/aile-umresi, /ekim-umresi)
    ...CONTENT_PAGES.filter((p) => ROOT_GROUPS.has(p.group)).map((p) => ({ slug: p.slug })),
  ];
}

const ROOT_GROUPS = new Set(["kisi", "zaman"]);
const rootContentPage = (slug: string) => {
  const p = getContentPage(slug);
  return p && ROOT_GROUPS.has(p.group) ? p : null;
};

// İstanbul'un iki havalimanından Cidde ve Medine'ye direkt tarifeli seferler var
const DIRECT_HUBS = new Set(["IST", "SAW"]);

// Bölgeye göre pratik not (genel bilgi; rakam veya kesin iddia içermez)
const REGION_NOTES: Record<Region, string> = {
  Marmara: "Marmara'dan yola çıkanlar için en geniş uçuş seçeneği İstanbul'daki iki havalimanındadır; kalkış saatini seçerken havalimanına ulaşım süresini ve trafik yoğunluğunu hesaba katın.",
  Ege: "Ege'den yola çıkanlar için İzmir ve bölgedeki diğer havalimanlarından kalkan uçuşlar çoğunlukla aktarmalıdır; aktarma süresi kısa olan seferler toplam yolculuğu belirgin biçimde kısaltır.",
  Akdeniz: "Akdeniz bölgesi Suudi Arabistan'a Türkiye'nin en yakın bölgelerinden biridir; yaz aylarında Mekke ve Medine'de sıcaklık çok yükseldiği için ibadet saatlerini sabah erken ve akşama planlamak rahatlatır.",
  "İç Anadolu": "İç Anadolu'dan yola çıkanlar Ankara, Kayseri, Konya ve Kapadokya havalimanlarını kullanabilir; bu havalimanlarından kalkışta aktarma noktası çoğunlukla İstanbul'dur.",
  Karadeniz: "Karadeniz'den yola çıkanlar için sahil havalimanlarındaki kalkışlar genellikle İstanbul ya da Ankara aktarmalıdır; kış aylarında hava koşulları uçuş saatlerini değiştirebildiği için aktarma arasına pay bırakın.",
  "Doğu Anadolu": "Doğu Anadolu'da kış aylarında kar ve sis uçuş saatlerini etkileyebilir; bu dönemde dönüş tarihine bir gün pay bırakmak ve aktarma süresi uzun seferleri seçmek planı güvenceye alır.",
  "Güneydoğu Anadolu": "Güneydoğu Anadolu Suudi Arabistan'a coğrafi olarak yakın olsa da uçuşların çoğu İstanbul ya da Ankara aktarmalıdır; aktarma süresi toplam yolculuk süresini belirler.",
};

const n = (x: number) => x.toLocaleString("tr-TR");

/** "İstanbul'dan", "Ankara'dan", "Iğdır'dan" (ünlü uyumu + sertleşme) */
function ablative(name: string) {
  const vowels = name.toLocaleLowerCase("tr").match(/[aeıioöuü]/g) ?? ["a"];
  const last = vowels[vowels.length - 1];
  const hard = /[çfhkpsştÇFHKPSŞT]$/.test(name);
  const back = "aıou".includes(last);
  return `${name}'${hard ? "t" : "d"}${back ? "an" : "en"}`;
}

/** "Ankara'ya", "İzmir'e", "Kars'a", "Rize'ye" */
function dative(name: string) {
  const lower = name.toLocaleLowerCase("tr");
  const vowels = lower.match(/[aeıioöuü]/g) ?? ["a"];
  const back = "aıou".includes(vowels[vowels.length - 1]);
  const endsVowel = /[aeıioöuü]$/.test(lower);
  return `${name}'${endsVowel ? "y" : ""}${back ? "a" : "e"}`;
}

function buildCityContent(city: TurkeyCity) {
  const facts = cityTravelFacts(city.slug);
  const from = ablative(city.name);
  const direct = DIRECT_HUBS.has(city.airportCode);
  const sharedWith = turkeyCities.filter((c) => c.airportCode === city.airportCode && c.slug !== city.slug).map((c) => c.name);
  const neighbours = nearestCities(city.slug, 4)
    .map((x) => ({ ...x, city: getTurkishCityBySlug(x.slug) }))
    .filter((x): x is typeof x & { city: TurkeyCity } => Boolean(x.city));

  const routeText = direct
    ? `${city.airportName} (${city.airportCode}) üzerinden Cidde ve Medine'ye direkt seferler bulunur; aktarma gerekmez.`
    : `${city.airportName} (${city.airportCode}) kalkışlı yolculukta Cidde ya da Medine'ye çoğunlukla aktarmalı gidilir; direkt sefer olup olmadığını tarih seçtiğinizde uçuş listesinde görürsünüz.`;

  const faq = [
    {
      q: `${from} umreye nasıl gidilir?`,
      a: `${from} umre yolculuğu genellikle ${city.airportName} (${city.airportCode}) kalkışıyla başlar. ${routeText} Varış için Cidde (Mekke'ye yakın) ya da Medine seçilebilir; program sırasını iniş yapılan şehre göre kurarız.`,
    },
    facts && {
      q: `${from} Cidde'ye uçuş kaç saat sürer?`,
      a: `${city.name} ile Cidde arası kuş uçuşu yaklaşık ${n(facts.toJeddah)} km'dir; direkt bir uçuş yaklaşık ${facts.jeddahFlight} sürer. Medine'ye kuş uçuşu mesafe yaklaşık ${n(facts.toMedina)} km, direkt uçuş süresi yaklaşık ${facts.medinaFlight}. Aktarmalı seferlerde toplam süre bekleme süresine göre uzar; kesin süre seçtiğiniz sefere bağlıdır.`,
    },
    {
      q: `${city.name} çıkışlı umrede vize ve rehberlik nasıl ayarlanır?`,
      a: `${city.name} çıkışlı yolcuların umre vizesi işlemlerini biz yürütüyoruz; pasaport bilgileriniz yeterlidir. Mekke ve Medine'de ilahiyatçı rehber eşliği isteğe bağlıdır ve tasarlayıcıda rehberlik adımından seçilir.`,
    },
  ].filter(Boolean) as { q: string; a: string }[];

  return { facts, from, direct, sharedWith, neighbours, routeText, faq };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = rootContentPage(slug);
  if (content) {
    return {
      title: pageTitle(content.title),
      description: content.description,
      alternates: { canonical: `https://hadiumreyegidelim.com/${content.slug}` },
      openGraph: { title: content.title, description: content.description, type: "article", images: [DEFAULT_OG_IMAGE] },
    };
  }
  if (!slug?.endsWith(SUFFIX)) return {};
  const city = getTurkishCityBySlug(slug.replace(SUFFIX, ""));
  if (!city) return {};
  const facts = cityTravelFacts(city.slug);

  return {
    title: pageTitle(`${city.name} Çıkışlı Bireysel Umre 2026`),
    description: metaDescription(
      facts
        ? `${city.name} çıkışlı umre: ${city.airportCode} kalkış, Cidde'ye yaklaşık ${n(facts.toJeddah)} km, direkt uçuşla yaklaşık ${facts.jeddahFlight}. Otel, uçuş ve vizeyi tek planda seçin.`
        : `${city.name} çıkışlı umre: ${city.airportName} (${city.airportCode}) kalkışlı uçuş, otel, vize ve transferi tek planda seçin.`,
    ),
    alternates: { canonical: `https://hadiumreyegidelim.com/${slug}` },
  };
}

export default async function DynamicCityUmrahPage({ params }: Props) {
  const { slug } = await params;
  const content = rootContentPage(slug);
  if (content) {
    const whatsappNumber = ((await getSiteSettings()).WHATSAPP_NUMBER || "905404010038").replace("+", "");
    return <ContentPageView page={content} whatsappNumber={whatsappNumber} relatedTitles={pageTitles()} />;
  }
  if (!slug?.endsWith(SUFFIX)) notFound();
  const city = getTurkishCityBySlug(slug.replace(SUFFIX, ""));
  if (!city) notFound();

  const { facts, from, direct, sharedWith, neighbours, routeText, faq } = buildCityContent(city);

  // Yapılandırılmış veri: hizmet + sayfadaki SSS (uydurma puan/yorum yok)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${city.name} Çıkışlı Bireysel Umre`,
      serviceType: "Bireysel umre planlama",
      areaServed: { "@type": "City", name: city.name },
      provider: { "@type": "TravelAgency", name: "Hadi Umreye Gidelim", url: "https://hadiumreyegidelim.com" },
      url: `https://hadiumreyegidelim.com/${slug}`,
    },
    webPageJsonLd({ url: `https://hadiumreyegidelim.com/${slug}`, name: `${city.name} Çıkışlı Bireysel Umre` }),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const infoRows: { label: string; value: string }[] = [
    { label: "Kalkış havalimanı", value: `${city.airportName} (${city.airportCode})` },
    ...(facts
      ? [
          { label: "Cidde'ye kuş uçuşu", value: `yaklaşık ${n(facts.toJeddah)} km` },
          { label: "Medine'ye kuş uçuşu", value: `yaklaşık ${n(facts.toMedina)} km` },
          { label: "Tahmini direkt uçuş (Cidde)", value: `yaklaşık ${facts.jeddahFlight}` },
          { label: "Bölge", value: `${facts.region}` },
        ]
      : []),
    { label: "Aktarma", value: direct ? "Direkt sefer var" : "Çoğunlukla aktarmalı" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BireyselUmreClient
        initialDepartureCity={city.airportCode}
        initialDepartureLabel={`${city.airportName} (${city.airportCode})`}
        title={`${city.name} Çıkışlı Bireysel Umre`}
        subtitle={`${city.airportName} (${city.airportCode}) kalkışlı uçuş, Mekke ve Medine otelleri, vize ve transferi ${city.name} için tek planda tasarlayın.`}
      >
        <section className="max-w-screen-xl mx-auto px-4 md:px-6 mt-24 relative z-10">
          <div className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <header className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">{facts ? `${facts.region} · ${city.airportCode}` : city.airportCode}</p>
              <h2 className="mt-2 font-headline text-2xl md:text-4xl text-primary font-bold leading-tight">{from} umre yolculuğu</h2>
              <p className="mt-3 text-on-surface-variant text-base md:text-lg max-w-3xl leading-relaxed">
                {city.name} çıkışlı bireysel umrede yolculuk {city.airportName} ({city.airportCode}) kalkışıyla başlar.{" "}
                {facts && <>{city.name} ile Cidde arası kuş uçuşu yaklaşık {n(facts.toJeddah)} km, Medine arası yaklaşık {n(facts.toMedina)} km&apos;dir. </>}
                {routeText}
              </p>
            </header>

            <dl className="grid grid-cols-2 md:grid-cols-3 gap-px bg-outline-variant/20 rounded-2xl overflow-hidden border border-outline-variant/20">
              {infoRows.map((r) => (
                <div key={r.label} className="bg-white p-4 md:p-5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{r.label}</dt>
                  <dd className="mt-1 text-[15px] font-semibold text-on-surface">{r.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 grid md:grid-cols-2 gap-8 text-on-surface-variant leading-relaxed">
              <div>
                <h3 className="font-headline text-xl text-primary font-bold mb-3">{city.name} için yolculuk planı</h3>
                <ol className="space-y-3 list-decimal pl-5 marker:text-primary marker:font-bold">
                  <li>Tasarlayıcıda kalkış olarak {city.airportName} ({city.airportCode}) seçili gelir; gidiş tarihini seçtiğinizde {city.airportCode} kalkışlı uçuşlar listelenir.</li>
                  <li>{direct ? `${city.airportCode} kalkışında Cidde'ye ya da Medine'ye direkt uçabilirsiniz.` : `${city.airportCode} kalkışında aktarma süresi kısa olan seferi seçmek, ${city.name} ile Mekke arasındaki toplam yolculuğu kısaltır.`}</li>
                  <li>Cidde&apos;ye inerseniz program Mekke ile, Medine&apos;ye inerseniz Medine ile başlar; {city.name} dönüşünü de aynı mantıkla ters sırada planlarız.</li>
                </ol>
                {sharedWith.length > 0 && (
                  <p className="mt-4 text-sm">
                    Aynı havalimanından {city.name} dışında {sharedWith.join(", ")} yolcuları da uçar.
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-headline text-xl text-primary font-bold mb-3">{facts ? `${facts.region} bölgesinden yola çıkarken` : "Yola çıkarken"}</h3>
                <p>{facts ? REGION_NOTES[facts.region] : REGION_NOTES.Marmara}</p>
                <p className="mt-3 text-sm">
                  Umre vizesi için <Link href="/umre-vizesi" className="text-primary font-semibold underline underline-offset-4">umre vizesi</Link> sayfasına, ibadet adımları için <Link href="/ilk-umrem" className="text-primary font-semibold underline underline-offset-4">ilk umrem rehberine</Link> bakabilirsiniz.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-headline text-xl text-primary font-bold mb-4">{city.name} çıkışlı umre hakkında sorular</h3>
              <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
                {faq.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                      <h2 className="font-semibold text-base text-on-surface group-open:text-primary">{f.q}</h2>
                      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-primary shrink-0 transition-transform group-open:rotate-45"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                    </summary>
                    <p className="pb-4 -mt-1 text-sm text-on-surface-variant leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {neighbours.length > 0 && (
              <nav aria-label={`${city.name} yakınındaki iller`} className="mt-10">
                <h3 className="font-headline text-lg text-primary font-bold mb-3">{city.name} yakınındaki iller</h3>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {neighbours.map((x) => (
                    <li key={x.slug}>
                      <Link href={`/${x.slug}${SUFFIX}`} className="block rounded-xl border border-outline-variant/30 px-4 py-3 hover:border-primary/50 transition-colors">
                        <span className="block font-semibold text-on-surface">{x.city.name} çıkışlı umre</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">{dative(city.name)} yaklaşık {n(x.km)} km · {x.city.airportCode}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <PageTrust className="mt-8" />
            <p className="mt-2 text-xs text-on-surface-variant">
              Mesafeler il merkezleri arası kuş uçuşu, uçuş süreleri direkt uçuş için yaklaşık hesaplardır. Fiyat ve sefer bilgisi tarih seçildiğinde güncel olarak listelenir; kesin teklif WhatsApp üzerinden iletilir.
            </p>
          </div>
        </section>
      </BireyselUmreClient>
    </>
  );
}
