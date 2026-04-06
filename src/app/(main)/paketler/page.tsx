import React from "react";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import BrandImageFallback from "@/components/ui/BrandImageFallback";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayrıcalıklı Umre Paketleri 2026 | Hadi Umre'ye Gidelim",
  description: "Manevi yolculuğunuzu konfor ve huzur içinde geçirebilmeniz için her detayı düşünülmüş, VIP transferli ve özel rehberli Umre tur seçenekleri.",
  alternates: {
    canonical: "/paketler"
  }
};

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="pt-20">
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Mekke Manzarası"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-8">
          <div className="max-w-2xl">
            <span className="text-tertiary-fixed-dim font-label text-sm tracking-[0.2em] font-bold uppercase mb-4 block drop-shadow-md">Size Özel Tasarlandı</span>
            <h1 className="font-headline text-5xl md:text-7xl text-white font-bold leading-[1.1] mb-6 drop-shadow-lg">
              Ayrıcalıklı<br />Umre Paketleri
            </h1>
            <p className="font-body text-xl text-white/90 leading-relaxed font-light max-w-xl border-l-4 border-tertiary-fixed-dim pl-6 drop-shadow-md">
              Manevi yolculuğunuzu konfor ve huzur içinde geçirebilmeniz için her detayı düşünülmüş, özenle hazırlanmış tur seçenekleri.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl text-primary font-bold mb-4">Müsait Turlarımız</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Vize, konaklama, transfer ve manevi rehberlik dahil tüm süreçleri sizin yerinize yönetiyoruz.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-8">
            {packages.map((pkg: any) => {
              let includes: string[] = [];
              if (pkg.includes) {
                try { includes = JSON.parse(pkg.includes); } catch(e){}
              }

              return (
                <div key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col xl:flex-row border border-outline-variant/10 relative">
                  {pkg.isPopular && (
                    <div className="absolute top-6 left-6 z-20 bg-secondary text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      En Çok Tercih Edilen
                    </div>
                  )}
                  
                  <div className="xl:w-2/5 aspect-[4/3] xl:aspect-auto relative overflow-hidden bg-primary flex flex-col items-center justify-center">
                    {pkg.imageUrl ? (
                      <img src={pkg.imageUrl} alt={pkg.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <BrandImageFallback icon="mosque" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded inline-flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">schedule</span> {pkg.duration}
                      </span>
                    </div>
                  </div>

                  <div className="xl:w-3/5 p-8 md:p-10 flex flex-col">
                    <h3 className="text-2xl font-headline font-bold text-primary mb-3">{pkg.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
                      {pkg.description ? pkg.description.split('|||ITINERARY|||')[0] : ''}
                    </p>
                    
                    {includes.length > 0 && (
                      <div className="mb-8 bg-surface-container-low p-6 rounded-2xl">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold mb-4 block">Pakete Dahil Hizmetler</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                          {includes.slice(0, 6).map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-primary font-medium">
                              <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                              <span className="truncate leading-tight">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between border-t border-outline-variant/10 pt-6 mt-auto gap-6 sm:gap-0">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1">Tur Süresi</span>
                        <div className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">schedule</span>
                          {pkg.duration}
                        </div>
                      </div>
                      <Link href={`/paketler/${pkg.slug}`} className="w-full sm:w-auto bg-primary text-white font-bold tracking-wide px-8 py-3.5 rounded-xl hover:bg-primary-container hover:text-primary active:scale-95 transition-all text-sm flex justify-center items-center gap-2 shadow-lg shadow-primary/20">
                        Turu İncele <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
          
          {packages.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center border border-outline-variant/10 shadow-sm mt-8">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">inventory_2</span>
              <h3 className="text-2xl font-headline text-primary font-bold mb-2">Henüz Paket Bulunmuyor</h3>
              <p className="text-on-surface-variant max-w-lg mx-auto">Şu an için yayında olan bir umre paketi bulunmuyor. Tur planlamalarımız devam etmektedir, lütfen daha sonra tekrar kontrol edin.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
