import { SITE_URL } from "@/lib/seo/site";
import { getPackagePricing } from "@/lib/pricing/package-server";
import PackageHotelPicker from "@/components/packages/PackageHotelPicker";
import React from 'react';
export const revalidate = 300;
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import BrandImageFallback from '@/components/ui/BrandImageFallback';
import { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, pageTitle } from "@/lib/seo/meta";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import { getSiteSettings } from "@/lib/site-settings";
import {
  Badge,
  ButtonLink,
  Faq,
  faqJsonLd,
  PageHero,
  Panel,
  PriceTag,
  Section,
} from '@/components/ui/kit';

// Next 16: boş generateStaticParams olmadan dinamik yol her istekte yeniden oluşturulur (no-store); boş liste
// sayfayı ilk istekte üretip önbelleğe alır (ISR). 6 Ekim denetimi: blog sayfaları 1,6–4,3 sn.
export async function generateStaticParams() {
  return [];
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
  }).catch(() => null);
  if (!pkg) return { title: 'Bulunamadı' };
  
  const shortDesc = pkg.description ? pkg.description.substring(0, 150) + "..." : "Sınırlı kontenjanlı, ayrıcalıklı Umre paketimizi keşfedin.";

  return { 
    title: pageTitle(pkg.title),
    description: shortDesc,
    alternates: {
      canonical: `/paketler/${slug}`
    },
    openGraph: {
      title: pkg.title,
      description: shortDesc,
      type: 'website',
      images: pkg.imageUrl ? [{ url: pkg.imageUrl }] : [DEFAULT_OG_IMAGE],
    }
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const whatsappNumber = ((await getSiteSettings().catch(() => ({} as Record<string, string>))).WHATSAPP_NUMBER || "905404010038").replace("+", "");
  const pkg = await prisma.package.findUnique({
    where: { slug },
  });

  if (!pkg || !pkg.published) {
    notFound();
  }

  // Şablonlu paket (ör. 10 gün Mekke): fiyat otele ve kişi sayısına göre hesaplanır; gösterilen "başlayan" fiyattır
  const pricing = await getPackagePricing(pkg.slug).catch(() => null);
  const price = pricing?.fromPrice ?? pkg.price;

  let includes: string[] = [];
  let mainDesc = pkg.description;
  let itinerary: any[] = [];
  
  if (pkg.description && pkg.description.includes('|||ITINERARY|||')) {
    const parts = pkg.description.split('|||ITINERARY|||');
    mainDesc = parts[0];
    try {
      itinerary = JSON.parse(parts[1]);
    } catch(e) {}
  }

  if (pkg.includes) {
    try { includes = JSON.parse(pkg.includes); } catch (e) {}
  }

  let gallery: string[] = [];
  if (pkg.gallery) {
    try { gallery = JSON.parse(pkg.gallery); } catch (e) {}
  }

  // Schema.org Markup for Google Discover & Search (E-E-A-T)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.title,
    description: mainDesc,
    image: pkg.imageUrl ? [pkg.imageUrl] : [],
    brand: {
      '@type': 'Brand',
      name: "Hadi Umreye Gidelim"
    },
    ...(price > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: String(price),
            priceCurrency: pkg.currency || 'USD',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/paketler/${pkg.slug}`,
          },
        }
      : {}),
  };

  // SSS paketin kendi verisinden
  const faq = [
    pkg.duration && { q: `${pkg.title} kaç gün sürer?`, a: `${pkg.title} programı ${pkg.duration} sürer. Günlük akış bu sayfadaki programda yer alır.` },
    includes.length > 0 && { q: `${pkg.title} fiyatına neler dahil?`, a: `Pakete dahil olanlar: ${includes.join(", ")}.` },
    { q: `${pkg.title} için nasıl rezervasyon yapılır?`, a: `Bu sayfadan ön rezervasyon talebi oluşturabilir ya da WhatsApp üzerinden tarih ve kişi sayısını iletebilirsiniz; güncel fiyat ve müsaitlik size yazılı olarak bildirilir.` },
  ].filter(Boolean) as { q: string; a: string }[];

  const faqSchema = faqJsonLd(faq);
  const pageJsonLd = webPageJsonLd({ url: `${SITE_URL}/paketler/${pkg.slug}`, name: pkg.title, dateModified: pkg.updatedAt.toISOString() });

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bireysel Umre Turları', item: `${SITE_URL}/bireysel-umre` },
      { '@type': 'ListItem', position: 3, name: pkg.title, item: `${SITE_URL}/paketler/${pkg.slug}` }
    ]
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, pageJsonLd]) }} />
      
      <PageHero
        crumbs={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Bireysel Turlar', href: '/bireysel-umre' },
          { label: pkg.title }
        ]}
        kicker={pkg.isPopular ? "En Çok Tercih Edilen" : "Umre Paketi"}
        title={pkg.title}
        lead={
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {pkg.duration && <Badge tone="primary">{pkg.duration}</Badge>}
            {price > 0 && <PriceTag amount={price} currency={pkg.currency} label="Başlangıç" />}
          </div>
        }
        aside={
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 shadow-md">
            {pkg.imageUrl ? (
              <Image
                src={pkg.imageUrl}
                alt={pkg.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            ) : (
              <BrandImageFallback icon="mosque" iconSize={5} />
            )}
          </div>
        }
      />

      <Section tone="muted">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Sol Kolon: Bilgiler, Harita, Dahil Hizmetler */}
          <div className="lg:col-span-2 space-y-8">
            <Panel tone="white">
              <h2 className="text-2xl font-headline font-bold text-primary mb-4">Paket Bilgileri</h2>
              <div className="text-on-surface-variant font-light leading-relaxed text-base whitespace-pre-wrap">
                {mainDesc}
              </div>
            </Panel>

            {itinerary.length > 0 && (
              <Panel tone="white">
                <h2 className="text-2xl font-headline font-bold text-primary mb-6">Kronolojik Harita</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                  {itinerary.map((item, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low border-4 border-white text-secondary font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm">
                        {item.day}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-sm border border-outline-variant/10 group-hover:shadow-md transition-all">
                        <div className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">Gün {item.day}</div>
                        <h4 className="text-base font-bold text-primary mb-1 font-headline">{item.title}</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {pricing && (
              <PackageHotelPicker title={pkg.title} preset={pricing.preset} catalog={pricing.catalog} month={pricing.month} monthLabel={pricing.monthLabel} packagePercent={pricing.packagePercent} whatsappNumber={whatsappNumber} />
            )}
            {includes.length > 0 && (
              <Panel tone="white">
                <h3 className="text-xl font-headline font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
                  Fiyata Dahil Olan Hizmetler
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-primary font-medium">
                      <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">check_circle</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>

          {/* Sağ Kolon: Rezervasyon ve WhatsApp Kartı */}
          <div className="lg:col-span-1">
            <Panel tone="white" className="sticky top-32 shadow-xl shadow-primary/5">
              <span className="text-xs font-bold text-primary/80 tracking-wider uppercase block mb-2">Kontenjan Durumu</span>
              <div className="text-2xl font-headline font-bold text-primary mb-4">
                Müsait
              </div>
              
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed font-light">
                Manevi tasarım, konaklama, transfer ve rehberlik detayları tamamen size özel organize edilmektedir. Katılım durumunuzu netleştirmek ve paket detaylarını konuşmak için bizimle iletişime geçin.
              </p>

              {price > 0 && (
                <div className="mb-6 p-4 bg-surface-container-low rounded-xl">
                  <PriceTag amount={price} currency={pkg.currency} label={pricing ? "Kişi başı, 2 kişi · başlayan" : "Kişi başı paket fiyatı"} />
                </div>
              )}

              <div className="space-y-3">
                {!pricing && (
                  <ButtonLink href={`/paketler/${pkg.slug}/checkout`} tone="primary" className="w-full">
                    REZERVASYON YAP
                  </ButtonLink>
                )}
                <ButtonLink href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba, "${pkg.title}" paketi hakkında bilgi almak istiyorum.`)}`} tone="whatsapp" className="w-full">
                  WHATSAPP İLE SOR
                </ButtonLink>
              </div>
            </Panel>
          </div>
        </div>
      </Section>

      {/* Galeri Bölümü */}
      {gallery.length > 0 && (
        <Section tone="white">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80 mb-2">Görsel Tur</p>
            <h2 className="text-3xl font-headline font-bold text-primary mb-3">Detay Galerisi</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-sm">Paket dahilinde yararlanacağınız hizmetlerden ve ziyaret mekanlarından eşsiz kareler.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[220px]">
            {gallery.map((imgUrl, i) => {
              const isHero = i === 0 && gallery.length >= 3;
              return (
                <div key={i} className={`rounded-2xl overflow-hidden shadow-sm group relative ${isHero ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1 border border-outline-variant/10'}`}>
                  <Image src={imgUrl} alt={`${pkg.title} Görsel ${i+1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* SSS Bölümü */}
      {faq.length > 0 && (
        <Section tone="muted">
          <div className="max-w-screen-md mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80 mb-2 text-center">Sık sorulanlar</p>
            <h2 className="text-2xl font-headline font-bold text-primary text-center mb-6">Paket Hakkında Sorular</h2>
            <Faq items={faq} />
            <PageTrust date={pkg.updatedAt} className="mt-8 text-center" />
          </div>
        </Section>
      )}
    </main>
  );
}
