import React from "react";
import { prisma } from "@/lib/prisma";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { type: 'asc' }
  });

  const settingsArray = await prisma.setting.findMany();
  const settings = settingsArray.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {} as Record<string, string>);
  const services_banner_image = settings.services_banner_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCuam-SRusysTmFa8cNfGO0nrUWU2b4lhRvrL1t5uRMO09KYGq46lqmXVR1RTQwnsytK6mpj41mpYDz4mnEykVU3E4_79ZFGw1a_ajWIITp0yX5hzJZwCg4c8E7HxHm5PJe8Jj-nfYiMyZynnNE7AWzy5NoYBmvwnuf46RLKc244lqWhr8dRzr0t2K_CwE-RI3yAUKAAHlgeYna0rO0M3jgOYeUYsFay6HDarHuq5VlPkAp591b0L4AtzHAraP1GcnhRYAXT9ea8ig";

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[700px] md:h-[870px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="VIP Transfer"
            className="w-full h-full object-cover"
            src={services_banner_image}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full">
          <div className="max-w-3xl">
            <span className="inline-block bg-tertiary-fixed-dim/20 px-5 py-2 rounded-full text-tertiary-fixed-dim font-label font-bold tracking-[0.2em] mb-6 uppercase text-sm border border-tertiary-fixed-dim/30 shadow-sm backdrop-blur-sm">
              Ayrıcalıklı Yolculuk
            </span>
            <h1 className="font-headline text-5xl md:text-7xl text-on-primary font-bold leading-tight mb-8 drop-shadow-lg">
              Kişiye Özel Konfor: <br />
              <span className="italic font-light opacity-90 drop-shadow-md">VIP Seyahat Deneyimi</span>
            </h1>
            <p className="text-white/85 text-xl md:text-2xl font-body leading-relaxed mb-12 max-w-2xl drop-shadow-sm">
              Kutsal topraklardaki her anınızın huzur ve ihtişam içinde geçmesi için tasarlanmış, sınır tanımayan bir hizmet anlayışı.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-10 py-5 rounded-xl font-bold text-lg hover:bg-tertiary-fixed hover:scale-[1.03] hover:shadow-2xl shadow-xl transition-all">
                Hizmeti Özelleştir
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-[1.03] transition-all shadow-xl">
                Kataloğu İncele
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details - Dynamic Services Grid */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl text-primary font-bold leading-[1.2]">
              Tüm Ayrıcalıklı Hizmetlerimiz
            </h2>
            <p className="text-on-surface-variant font-body text-xl mt-4">
              İbadetinize tam odaklanmanız için her detayı özenle düşündük.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map(service => (
              <div key={service.id} className="bg-surface-container-lowest rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-outline-variant/10 group flex flex-col h-full hover:-translate-y-2">
                <div className="w-16 h-16 bg-primary-container text-primary flex items-center justify-center rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">
                     {service.type === 'HOTEL' ? 'hotel' : service.type === 'FLIGHT' ? 'flight' : service.type === 'TRANSFER' ? 'directions_car' : 'extension'}
                  </span>
                </div>
                <h3 className="font-headline text-2xl text-primary font-bold mb-3">{service.name}</h3>
                <p className="text-on-surface-variant leading-relaxed font-body flex-grow mb-6">
                  {service.description}
                </p>
                <div className="border-t border-outline-variant/20 pt-6 mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest bg-surface-container py-1 px-3 rounded-md">{service.type}</span>
                  <span className="text-xl font-bold text-secondary">${service.price}</span>
                </div>
              </div>
            ))}
          </div>
          
          {services.length === 0 && (
             <p className="text-center text-outline italic py-20 bg-surface-container-low rounded-2xl">Şu an gösterilecek bir hizmet bulunmuyor. Lütfen admin panelinin Services kısmından yeni bir hizmet ekleyin.</p>
          )}
        </div>
      </section>

      {/* Trust Factor - Bento Grid */}
      <section className="py-24 md:py-32 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-6">Güven ve Şeffaflık</h2>
            <p className="text-on-surface-variant text-xl max-w-2xl mx-auto font-body">
              Sıfır bürokrasi ve tam garanti ile manevi yolculuğunuzun teminatıyız.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-surface-container-lowest p-12 rounded-3xl border-l-4 border-tertiary shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-8">
                <span className="material-symbols-outlined text-5xl" data-icon="verified_user">
                  verified_user
                </span>
              </div>
              <h3 className="font-headline text-3xl font-bold text-primary mb-4">Nusuk ve Vize Garantisi</h3>
              <p className="text-on-surface-variant text-lg font-body leading-relaxed">
                Resmi makamlarla olan doğrudan entegrasyonumuz sayesinde vize reddi riskini ortadan kaldırıyoruz.
              </p>
            </div>
            
            <div className="bg-surface-container-lowest p-12 rounded-3xl border-l-4 border-tertiary shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-8">
                <span className="material-symbols-outlined text-5xl" data-icon="speed">
                  speed
                </span>
              </div>
              <h3 className="font-headline text-3xl font-bold text-primary mb-4">Sıfır Bürokrasi</h3>
              <p className="text-on-surface-variant text-lg font-body leading-relaxed">
                Evrak işleriyle vakit kaybetmeyin. Dijital altyapımızla tüm süreci sizin adınıza yönetiyoruz.
              </p>
            </div>
            
            <div className="bg-surface-container-lowest p-12 rounded-3xl border-l-4 border-tertiary shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-8">
                <span className="material-symbols-outlined text-5xl" data-icon="auto_awesome">
                  auto_awesome
                </span>
              </div>
              <h3 className="font-headline text-3xl font-bold text-primary mb-4">Kişiye Özel Rota</h3>
              <p className="text-on-surface-variant text-lg font-body leading-relaxed">
                Sadece size özel duraklar ve ziyaret noktaları ile ibadetinizi kişiselleştirin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Editorial Style */}
      <section className="py-32 md:py-40 bg-primary text-on-primary relative overflow-hidden rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none mix-blend-overlay">
          <span className="material-symbols-outlined text-[40rem] leading-none absolute -right-20 -top-10" data-icon="temple_hindu">
            temple_hindu
          </span>
        </div>
        
        <div className="absolute top-0 left-0 w-1/3 h-full opacity-5 pointer-events-none mix-blend-overlay">
          <span className="material-symbols-outlined text-[30rem] leading-none absolute -left-20 top-20" data-icon="diamond">
            diamond
          </span>
        </div>

        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h2 className="font-headline text-5xl md:text-7xl font-bold mb-10 leading-[1.1] drop-shadow-md">
            Yolculuğunuz Sizin <br />
            <span className="italic text-tertiary-fixed-dim font-light">Ruhunuz Kadar Benzersiz</span> Olsun
          </h2>
          <p className="text-primary-fixed text-2xl mb-14 font-body font-light max-w-3xl mx-auto opacity-90 leading-relaxed">
            Tüm detayları sizin yerinize planlamamız için uzman danışmanlarımızla <strong className="font-bold text-white">7/24</strong> iletişime geçin.
          </p>
          <button className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-14 py-6 rounded-2xl font-bold text-2xl hover:bg-white hover:text-primary transition-all hover:scale-105 shadow-2xl active:scale-95">
            Hizmeti Özelleştir
          </button>
        </div>
      </section>
    </main>
  );
}
