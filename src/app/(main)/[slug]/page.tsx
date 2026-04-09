import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BireyselUmreClient from "@/components/features/BireyselUmreClient";
import { turkeyCities, getTurkishCityBySlug } from "@/lib/turkey-cities";

// Next 15 Dynamic Routing API
type Props = {
  params: Promise<{ slug: string }>;
};

// Ensure statically generated paths
export function generateStaticParams() {
  return turkeyCities.map((city) => ({
    slug: `${city.slug}-cikisli-bireysel-umre`,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug?.endsWith("-cikisli-bireysel-umre")) {
    return {};
  }
  
  const citySlug = resolvedParams.slug.replace("-cikisli-bireysel-umre", "");
  const city = getTurkishCityBySlug(citySlug);

  if (!city) {
    return {};
  }

  return {
    title: `${city.name} ${city.airportName} Çıkışlı VIP Bireysel Umre Turları 2026`,
    description: `${city.name} çıkışlı, doğrudan Kabe manzaralı lüks oteller ve VIP transfer seçenekleri ile ailenize özel VIP Bireysel Umre planınızı hemen oluşturun.`,
    alternates: {
      canonical: `https://hadiumreyegidelim.com/${resolvedParams.slug}`,
    },
  };
}

export default async function DynamicCityUmrahPage({ params }: Props) {
  const resolvedParams = await params;

  if (!resolvedParams.slug?.endsWith("-cikisli-bireysel-umre")) {
    notFound();
  }

  const citySlug = resolvedParams.slug.replace("-cikisli-bireysel-umre", "");
  const city = getTurkishCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${city.name} Çıkışlı VIP Aile Umresi`,
    "image": "https://hadiumreyegidelim.com/logo.png",
    "description": `${city.name} (${city.airportName}) çıkışlı uçuşlarla kalabalıklardan uzak, size özel VIP Bireysel Umre. Kabe manzaralı lüks oteller ve VIP karşılama detaylarıyla.`,
    "offers": {
      "@type": "Offer",
      "url": `https://hadiumreyegidelim.com/${resolvedParams.slug}`,
      "priceCurrency": "USD",
      "price": "1250",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "12"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <BireyselUmreClient 
      initialDepartureCity={city.airportCode} 
      title={`${city.name} Çıkışlı VIP Aile Umresi`} 
      subtitle={`${city.name} (${city.airportName}) uçuşlarıyla ailenize özel, standart programlardan bağımsız VIP Bireysel Umre deneyiminizi tasarlayın.`}
    >
      <section className="max-w-screen-xl mx-auto px-6 mt-32 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-gradient-to-br from-surface-container-lowest to-surface p-8 md:p-12 rounded-3xl border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          {/* Lüks Arka Plan Vurgusu */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <header className="mb-10 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4 border border-primary/20">
              {city.name} Özel - 2026 Sezonu
            </span>
            <h1 className="font-headline text-3xl md:text-5xl text-primary font-extrabold tracking-tight mb-6 leading-tight">
              {city.name} Çıkışlı <br className="hidden md:block"/> Özel Bireysel Umre
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto">
              {city.name} {city.airportName} kalkışlı esnek uçuşlarla; kalabalık kafilelere bağlı kalmadan, sadece aileniz ve size özel en konforlu Mekke ve Medine deneyimi.
            </p>
          </header>

          <article className="prose prose-slate max-w-none text-on-surface-variant text-base relative z-10">
            <h3 className="font-headline text-2xl text-primary mt-8 mb-4 border-b border-primary/10 pb-2">Neden {city.name} Bireysel Umresi?</h3>
            <p className="mb-6 leading-relaxed">
              <strong>Bireysel umre</strong>, Diyanet İşleri veya geleneksel tur şirketlerinin belirlediği standart gruplarla değil; vize, uçak, otel ve transfer süreçlerinizi tamamen kendi özel bütçenize göre tasarladığınız <strong>VIP ibadet</strong> seyahatidir. {city.name} ilinden çıkış yapacak misafirlerimiz, standart turların getirdiği yorucu programa ve 40-50 kişilik kafilelere tabi olmamak gibi büyük bir avantaja sahiptir.
            </p>

            <h3 className="font-headline text-2xl text-primary mt-8 mb-4 border-b border-primary/10 pb-2">{city.airportName} Gidiş-Dönüş Konforu</h3>
            <p className="mb-6 leading-relaxed">
              Konfigüratör üzerinden {city.airportName} çıkışlı en ucuz ve en direkt THY / Pegasus uçuşlarını saniyeler içerisinde listeleyebilir, Cidde veya Medine varışlı kombinasyonları dilediğiniz gibi esnetebilirsiniz. Özel bir havaalanı karşılaması (VIP Transfer) ve doğrudan Kabe manzaralı lüks otellerde konaklama imkanı ile {city.name}'dan başlayan manevi yolculuğunuzda maksimum konfor sağlanır.
            </p>

            <h3 className="font-headline text-2xl text-primary mt-8 mb-4 border-b border-primary/10 pb-2">Sıkça Sorulan Sorular</h3>
            
            <div className="space-y-4 my-8">
              <details className="group bg-surface/50 border border-primary/10 rounded-2xl open:bg-primary/5 transition-colors duration-300">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  {city.name} çıkışlı özel rehberlik hizmeti var mı?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Evet! {city.name}'dan giden misafirlerimizi Kutsal Topraklarda yalnız bırakmıyoruz. Sistemimiz içerisindeki <strong>Özel Rehber Ataması</strong> sayesinde, Mekke'deki özel din görevlimiz (hocamız) sizi otelinizden alır; ilk tavafı, sa'yınızı ve Mescid-i Haram idrakinizi sadece size veya ailenize özel refakat ederek tamamlar.
                </div>
              </details>
              
              <details className="group bg-surface/50 border border-primary/10 rounded-2xl open:bg-primary/5 transition-colors duration-300">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  {city.name} üzerinden gidişler için Vize nasıl alınır?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Suudi Arabistan'ın 1 yıllık çok girişli (Multiple Entry) Elektronik Turizm Vizesi sistemi ile vizenizi saatler içerisinde, oturduğunuz yerden pasaportunuza entegre ediyoruz. Diyanet veya herhangi bir acente onayı gerekmez.
                </div>
              </details>
            </div>
            
            <div className="bg-primary/5 rounded-2xl p-6 mt-10 border border-primary/20 backdrop-blur-sm">
              <p className="text-sm font-medium text-slate-600 italic flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <span>
                  <strong>VIP Uyarı:</strong> Yukarıdaki tasarlayıcı sistemimiz bir Proforma (Ön Tutar) belgesidir. {city.name} için uçuş fiyatları sürekli canlı borsa şeklinde dalgalandığı için, talebinizi oluşturduğunuz an çağrı merkezimiz güncel resmi fiyatla size dönüş yapacaktır.
                </span>
              </p>
            </div>
          </article>
        </div>
      </section>
    </BireyselUmreClient>
    </>
  );
}
