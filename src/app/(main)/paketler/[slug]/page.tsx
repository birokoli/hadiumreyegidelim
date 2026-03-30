import React from 'react';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrandImageFallback from '@/components/ui/BrandImageFallback';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
  });
  if (!pkg) return { title: 'Bulunamadı' };
  return { title: `${pkg.title} | Hadi Umreye` };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
  });

  if (!pkg || !pkg.published) {
    notFound();
  }

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

  return (
    <main className="pt-20 bg-surface-container-lowest min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end pb-16 px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {pkg.imageUrl ? (
            <img
              alt={pkg.title}
              className="w-full h-full object-cover absolute inset-0"
              src={pkg.imageUrl}
            />
          ) : (
             <BrandImageFallback icon="mosque" iconSize={8} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            {pkg.isPopular && (
              <span className="bg-secondary text-primary font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 shadow-xl">
                En Çok Tercih Edilen
              </span>
            )}
            <h1 className="font-headline text-5xl md:text-7xl text-white font-bold leading-tight mb-6">{pkg.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-2 bg-white/20 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                {pkg.duration}
              </span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
             <Link href={`/paketler/${pkg.slug}/checkout`} className="bg-primary hover:bg-white hover:text-primary text-white px-10 py-5 rounded-xl font-bold tracking-widest text-sm uppercase shadow-2xl transition-all flex items-center justify-center gap-3">
                HEMEN YER AYIRTIN
                <span className="material-symbols-outlined">arrow_forward</span>
             </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-screen-xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Column: Description & Includes */}
        <div className="lg:col-span-2 space-y-16">
          <div>
            <h2 className="text-3xl font-headline font-bold text-primary mb-6">Paket Bilgileri</h2>
            <div className="text-on-surface-variant font-light leading-relaxed text-[17px] whitespace-pre-wrap">
              {mainDesc}
            </div>
          </div>
          
          {itinerary.length > 0 && (
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary mb-8 mt-12">Kronolojik Harita</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                {itinerary.map((item, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low border-4 border-white text-secondary font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm">
                      {item.day}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-3xl shadow-sm border border-outline-variant/10 group-hover:shadow-md group-hover:border-primary/20 transition-all">
                      <div className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">Gün {item.day}</div>
                      <h4 className="text-lg font-bold text-primary mb-2 font-headline">{item.title}</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {includes.length > 0 && (
            <div className="bg-white p-10 rounded-3xl border border-outline-variant/10 shadow-sm">
              <h3 className="text-xl font-headline font-bold text-primary mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
                Fiyata Dahil Olan Hizmetler
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-secondary-dark font-medium">
                     <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">check_circle</span>
                     <span className="leading-snug text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Call To Action Sticky Card */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 sticky top-32 shadow-xl shadow-primary/5">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase block mb-3">Durum</span>
            <div className="text-3xl font-headline font-bold text-primary mb-6">
              Müsait
            </div>
            
            <p className="text-sm text-on-surface-variant mb-10 leading-relaxed font-light">
              Manevi tasarım, konaklama, transfer ve rehberlik detayları tamamen size özel organize edilmektedir. Katılım durumunuzu netleştirmek ve paket detaylarını konuşmak için bizimle iletişime geçin.
            </p>

            <Link href={`/paketler/${pkg.slug}/checkout`} className="w-full bg-primary text-white font-bold tracking-widest text-sm px-6 py-4 rounded-xl hover:bg-primary-container hover:text-primary shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mb-4">
               REZERVASYON YAP
               <span className="material-symbols-outlined text-[20px]">airplane_ticket</span>
            </Link>
            
            <Link href="/iletisim" className="w-full bg-white border-2 border-primary/20 text-primary font-bold tracking-widest text-xs px-6 py-4 rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
               WHATSAPP İLE SOR
               <span className="material-symbols-outlined text-[18px]">chat</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="bg-white py-24 border-t border-outline-variant/10">
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="text-center mb-16">
               <span className="text-secondary font-label text-xs tracking-[0.2em] font-bold uppercase mb-4 block">Görsel Tur</span>
               <h2 className="text-4xl font-headline font-bold text-primary mb-4">Detay Galerisi</h2>
               <p className="text-on-surface-variant max-w-2xl mx-auto font-light text-lg">Paket dahilinde yararlanacağınız hizmetlerden ve ziyaret mekanlarından eşsiz kareler.</p>
            </div>
            
            {/* Intelligent Grid Layout for 1 to 5 images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
              {gallery.map((imgUrl, i) => {
                // Creates a nice mosaic if 5 images are present
                const isHero = i === 0 && gallery.length >= 3;
                return (
                  <div key={i} className={`rounded-3xl overflow-hidden shadow-md group relative ${isHero ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1 border border-outline-variant/10'}`}>
                    <img src={imgUrl} alt={`${pkg.title} Görsel ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
