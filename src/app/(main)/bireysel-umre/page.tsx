import React from "react";
import { Metadata } from "next";
import BireyselUmreClient from "@/components/features/BireyselUmreClient";

export const metadata: Metadata = {
  title: "2026 Bireysel Umre Tasarlayıcı — VIP Uçak + Otel + Vize + Özel Rehber",
  description: "Kendi Bireysel Umre planınızı oluşturun. 2026 en ucuz Mekke ve Medine uçak biletleri, Mescid-i Haram sıfır lüks oteller, Suudi e-vizesi ve VIP transfer seçenekleri.",
  alternates: {
    canonical: 'https://hadiumreyegidelim.com/bireysel-umre',
  },
};

export default function PlannerPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://hadiumreyegidelim.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Bireysel Umre Tasarlayıcı",
        "item": "https://hadiumreyegidelim.com/bireysel-umre"
      }
    ]
  };

  const productTourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "2026 Özel Bireysel Umre ve VIP Aile Paketleri",
    "description": "Mescid-i Haram ve Mescid-i Nebevi sıfır lüks oteller, 24 saatte Suudi e-vizesi, VIP transfer ve özel ilahiyatçı rehber eşliğinde kişiselleştirilmiş Umre organizasyonu.",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "1250",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "url": "https://hadiumreyegidelim.com/bireysel-umre"
    },
    "provider": {
      "@type": "Organization",
      "name": "Hadi Umre'ye Gidelim",
      "url": "https://hadiumreyegidelim.com"
    },
    "touristType": ["Bireysel Umre", "VIP Aile Umresi", "Diyanetsiz Umre"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Bireysel Umre yapabilmek için Suudi Vizesi nasıl alınır? (E-Vize / Nusuk)",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Suudi Arabistan'ın 1 yıllık çok girişli (Multiple Entry) Elektronik Turizm Vizesi (E-Visa) sistemi ile vizeniz dakikalar içerisinde alınır. Başvuru esnasında Umre yapacağım seçeneğini işaretlemek, size Suudi hükümeti tarafından tamamen yasal ve bağımsız bir bireysel umre yapma yetkisi verir."
        }
      },
      {
        "@type": "Question",
        "name": "2026 Bireysel Umre fiyatları nasıl hesaplanır? Kaç USD'den başlar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bireysel umre fiyatları kişi başı $1.250 USD'den başlamaktadır. Tasarım aracımız sayesinde uçak bileti, Mekke ve Medine otel seviyesi (3-4-5 Yıldız), Hızlı Tren (Haramain) ve VIP Transfer parametrelerini esnekçe seçerek bütçenizi kontrol edebilirsiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Mekke ve Medine'de ibadetlerim için rehber desteği alabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet! Sistemimizdeki Birebir İlahiyatçı Özel Rehber hizmeti sayesinde Mekke ve Medine'de hocamız sizi otelinizden alır, ilk tavafınızı, sa'yınızı ve Mescid-i Haram tanıtımınızı sadece ailenize özel refakat ederek tamamlar."
        }
      },
      {
        "@type": "Question",
        "name": "Diyanet turları olmadan kendi imkanlarıyla umre yapmak yasal mıdır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, tamamen yasaldır. Suudi Arabistan Krallığı'nın yeni vizyon projesi kapsamında turist vizeli veya e-vizeli tüm Müslümanlar acente bağımlılığı olmadan umre yapma hakkına sahiptir."
        }
      },
      {
        "@type": "Question",
        "name": "Mekke - Medine arası ulaşım ve VIP Transfer seçenekleri nelerdir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mekke ve Medine arasında Haramain Hızlı Treni (2 saat 20 dakika) veya GMC / Mercedes Vito gibi özel VIP araç transfer imkanları sunulmaktadır."
        }
      }
    ]
  };

  return (
    <BireyselUmreClient title="2026 Bireysel Umre Turları ve VIP Tasarlayıcı" subtitle="Manevi rotanızı kalabalık tur şirketlerinden bağımsız, ailenize özel VIP detaylarla tasarlayın.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productTourSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="max-w-screen-xl mx-auto px-6 mt-32 relative z-10">
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-outline-variant/15 shadow-sm">
          <header className="mb-10 text-center">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase">
              2026 ÖZEL BİREYSEL UMRE REHBERİ
            </div>
            <h1 className="font-headline text-3xl md:text-5xl text-primary font-bold tracking-tight mb-4">
              Bireysel Umre Turları ve Fiyatları 2026: Özgürlüğünüzü Keşfedin
            </h1>
            <p className="text-on-surface-variant font-body max-w-3xl mx-auto text-base">
              Kalabalık 40-50 kişilik kafilelere bağlı kalmadan, kişi başı <strong>$1.250 USD'den başlayan</strong> şeffaf bütçe ile sadece ailenize özel Mekke ve Medine ibadet rehberi.
            </p>
          </header>

          <article className="prose prose-slate max-w-none text-on-surface-variant space-y-6">
            <h2 className="font-headline text-2xl md:text-3xl text-primary mt-8 mb-4">
              Bireysel Umre Nedir? (E-Vize ve Nusuk İle Diyanetsiz Umre)
            </h2>
            <p className="mb-6 leading-relaxed">
              <strong>Bireysel umre</strong>, Diyanet İşleri veya geleneksel tur şirketlerinin belirlediği sabit tarihlere ve kalabalık gruplara mahkum olmadan; vize, uçak bileti, Mekke oteli, Medine konaklaması ve VIP transfer süreçlerinizi tamamen kendi özel bütçenize ve zamanınıza göre tasarladığınız <strong>kişiselleştirilmiş ibadet seyahatidir</strong>. Özellikle yaşlı ebeveynleri ile seyahat eden aileler veya çocuklu aileler için grubun temposuna uymak yerine kendi ritminde ibadet etmek büyük bir lükstür.
            </p>

            {/* Inclusions & Highlights Grid for LLM Extractability */}
            <div className="my-8 grid grid-cols-1 md:grid-cols-4 gap-4 not-prose">
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">badge</span>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">24 Saatte Suudi E-Vize</h4>
                <p className="text-xs text-slate-500 mt-1">1 Yıllık çok girişli tamamen yasal turistik umre vizesi.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-emerald-600 text-3xl mb-2">hotel</span>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Kâbe'ye Yürüme Mesafesi</h4>
                <p className="text-xs text-slate-500 mt-1">Mescid-i Haram ve Mescid-i Nebevi sıfır lüks oteller.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-amber-600 text-3xl mb-2">school</span>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Birebir Özel İlahiyatçı</h4>
                <p className="text-xs text-slate-500 mt-1">Mekke ve Medine'de ailenize özel manevi rehberlik.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-indigo-600 text-3xl mb-2">directions_car</span>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">VIP Ulaşım & Hızlı Tren</h4>
                <p className="text-xs text-slate-500 mt-1">GMC / Vito ile havalimanı ve Haramain tren transferi.</p>
              </div>
            </div>

            <h2 className="font-headline text-2xl md:text-3xl text-primary mt-10 mb-4">
              2026 Bireysel Umre Fiyat Karşılaştırma Tablosu
            </h2>
            <div className="overflow-x-auto not-prose my-6">
              <table className="w-full text-left border-collapse bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                <thead>
                  <tr className="bg-primary text-white text-xs uppercase tracking-wider">
                    <th className="p-4">Hizmet Kalemi</th>
                    <th className="p-4">Geleneksel Tur Şirketleri</th>
                    <th className="p-4">Hadi Umreye Gidelim (Bireysel Umre)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  <tr>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">Grup Sayısı</td>
                    <td className="p-4 text-slate-500">40 – 50 Kişilik Otobüs Grubu</td>
                    <td className="p-4 font-bold text-emerald-600">Sadece Aileniz / Kişiye Özel</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">Başlangıç Fiyatı</td>
                    <td className="p-4 text-slate-500">$1.500 - $1.800 (Yüksek Komisyon)</td>
                    <td className="p-4 font-bold text-emerald-600">$1.250 USD / Kişi Başı</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">Otel Konumu</td>
                    <td className="p-4 text-slate-500">Servisli / Uzak Oteller</td>
                    <td className="p-4 font-bold text-emerald-600">Kâbe'ye Yürüme Sıfır Mesafede</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">Manevi Rehberlik</td>
                    <td className="p-4 text-slate-500">Gruba Ortak Genel Rehber</td>
                    <td className="p-4 font-bold text-emerald-600">Ailenize Özel İlahiyatçı Rehber</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="font-headline text-2xl md:text-3xl text-primary mt-10 mb-4">
              Sıkça Sorulan Sorular (GEO / Yapısal Veri Destekli)
            </h2>

            <div className="space-y-4 my-8 not-prose">
              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Bireysel Umre yapabilmek için Suudi Vizesi nasıl alınır? (E-Vize / Nusuk)
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Suudi Arabistan'ın 1 yıllık çok girişli Elektronik Turizm Vizesi (E-Visa) sistemi ile vizeniz dakikalar içerisinde temin edilir. Başvuru esnasında "Umre yapacağım" seçeneğini işaretlemek size yasal bireysel umre hakkı kazandırır. Diyanet onayı gerekmez.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  2026 Bireysel Umre fiyatları nasıl hesaplanır? Kaç USD'den başlar?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Bireysel umre fiyatları kişi başı <strong>$1.250 USD'den</strong> başlamaktadır. Yukarıdaki Umre Tasarlama Aracı (Konfigüratör) sayesinde uçuş, Mekke oteli, Medine oteli, Hızlı Tren ve VIP Transfer seçeneklerini belirleyip anında proforma fiyat çıkarabilirsiniz.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Mekke ve Medine'de ibadetlerim için rehber desteği alabilir miyim?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Evet! Özel İlahiyatçı Rehber atamamız sayesinde Mekke'de ve Medine'de hocamız sizi otelinizden alır; ilk tavafınızı, sa'yınızı ve Mescid-i Haram tanıtımınızı sadece ailenize özel refakat ederek tamamlar.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Diyanet turları olmadan kendi imkanlarıyla umre yapmak yasal mıdır?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Evet, tamamen yasaldır. Suudi Arabistan Krallığı'nın yeni kuralları gereğince e-vize alan tüm Müslümanlar acente veya grup bağımlılığı olmadan umre ibadetini gerçekleştirebilir.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Mekke - Medine arası ulaşım ve VIP Transfer seçenekleri nelerdir?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Mekke ve Medine arasında Haramain Hızlı Treni (2 saat 20 dakika) veya GMC / Mercedes Vito gibi özel VIP konforlu araç transfer imkanları sunulmaktadır.
                </div>
              </details>
            </div>
          </article>
        </div>
      </section>
    </BireyselUmreClient>
  );
}
