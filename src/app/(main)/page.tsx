import React from "react";
import Link from "next/link";
import Image from "next/image";
import BrandImageFallback from "@/components/ui/BrandImageFallback";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;

export default async function Home() {
  const latestBlogs = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const featuredPackages = await prisma.package.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const settingsArray = await prisma.setting.findMany();
  const settings = settingsArray.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {} as Record<string, string>);

  const home_banner_image = settings.home_banner_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCeWn_hW89LbHLjNkEyCjXnO56IpdLz_zRwB9BvtIjHV_CSU9n_ADpxoS-K9Y4UqzQtVdJ9tM238gIiQ3fIEgF50wPqba1ofx6HeAab2E8EYwvLnq_w13P3UCdpuZloJ2P_FBbqiM4ZrKqELKyG3sgBrj2SCUi6yLGc39nIApI_ip6uasqiKaUGRcpE7WnqmMcqOZVc-CUXOaphNXOHK18KEZCYKehmVy4cZRQP0tk7_PHK5iJh4cVmqsN9DeHNleLOmi97WPx_9Gw";
  
  const home_banner_title = settings.HERO_TITLE || "Ruhunuzun Ritmini Kalabalıklara Teslim Etmeyin.";
  const home_banner_subtitle = settings.HERO_DESC || "Ailenize ve Size Özel Butik Umre Deneyimi.";
  const home_banner_tagline = settings.HERO_TAGLINE || "BOUTİQUE UMRE EXPERİENCE";
  
  const whatsappNumber = settings.WHATSAPP_NUMBER ? settings.WHATSAPP_NUMBER.replace('+', '') : "905404010038";
  const whatsappMessage = settings.WHATSAPP_MESSAGE ? encodeURIComponent(settings.WHATSAPP_MESSAGE) : "Merhaba, ana sayfanızdan ulaşıyorum, hizmetleriniz hakkında bilgi almak istiyorum.";

  const homeCta = settings.HOME_CTA || "NİYET ET VE PLANLA";
  const whatsappCta = settings.WHATSAPP_CTA || "WHATSAPP DANIŞMANLIK";

  const homeToursKicker = settings.HOME_TOURS_KICKER || "Kişiselleştirilmiş Lüks Turlar";
  const homeToursTitle = settings.HOME_TOURS_TITLE || "Müsait & VIP Paketlerimiz";
  const homeStepsKicker = settings.HOME_STEPS_KICKER || "Adım Adım Yolculuk";
  const homeStepsTitle = settings.HOME_STEPS_TITLE || "Maneviyat Yolunda Hazırlığınız Nasıl Başlar?";
  const homeBlogKicker = settings.HOME_BLOG_KICKER || "İlham Kaynağı";
  const homeBlogTitle = settings.HOME_BLOG_TITLE || "Manevi Rehberlik Blogu";
  const homeFaqTitle = settings.HOME_FAQ_TITLE || "Bireysel Umre Rehberi: 2026 Vize ve Detaylar";
  const homeFaqDesc = settings.HOME_FAQ_DESC || "Diyanet turlarına veya kafilelere bağlı kalmadan kendi imkanlarıyla bireysel umre nasıl yapılır merak eden misafirlerimiz için en çok sorulan soruları derledik. VIP ve Bireysel Umre paketleri hakkında detaylı bilgiye aşağıdan ulaşabilirsiniz.";

  return (
    <>
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            alt="Kabe Manzaralı VIP Butik Umre Deneyimi"
            className="object-cover"
            src={home_banner_image}
            fill
            priority
            sizes="100vw"
          />
          {/* Universal contrast overlay for user-uploaded images */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-8 text-center mt-12 md:mt-0">
          <div className="inline-block px-5 py-2 mb-8 rounded-full bg-white/10 border border-white/20 text-white font-label text-[10px] tracking-[0.3em] uppercase font-bold backdrop-blur-md shadow-xl">
            {home_banner_tagline}
          </div>
          <h1 className="font-headline text-5xl md:text-7xl text-white leading-[1.15] mb-8 max-w-4xl mx-auto font-bold tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <span className="sr-only">Bireysel Umre Turları ve Fiyatları 2026 </span>
            {home_banner_title}
          </h1>
          <p className="font-headline italic text-xl md:text-3xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md">
            {home_banner_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center">
            <Link href="/bireysel-umre" className="bg-primary text-white px-10 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-white hover:text-primary active:scale-95 transition-all">
              {homeCta}
            </Link>
            <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-white font-bold border border-transparent bg-[#25D366] px-8 py-5 rounded-2xl hover:bg-[#128C7E] hover:text-white transition-all uppercase tracking-widest text-xs shadow-xl">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                chat
              </span>
              {whatsappCta}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-16">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-start">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl" data-icon="task_alt">
                  task_alt
                </span>
              </div>
              <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Sıfır Bürokrasi
              </span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl" data-icon="verified_user">
                  verified_user
                </span>
              </div>
              <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Nusuk ve Vize Garantisi
              </span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl" data-icon="directions_car">
                  directions_car
                </span>
              </div>
              <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Özel VIP Transfer
              </span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl" data-icon="auto_stories">
                  auto_stories
                </span>
              </div>
              <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Birebir İlahiyatçı Rehber
              </span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl" data-icon="support_agent">
                  support_agent
                </span>
              </div>
              <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                7/24 WhatsApp Hizmeti
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Hazır Paketler Vitrini */}
      <section className="py-24 bg-surface-container-lowest relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3">
                {homeToursKicker}
              </span>
              <h2 className="font-headline text-4xl md:text-5xl text-primary font-bold">
                {homeToursTitle}
              </h2>
            </div>
            <Link href="/paketler" className="text-secondary font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-[10px] bg-secondary/10 px-6 py-3 rounded-xl hover:bg-secondary/20 shadow-sm border border-secondary/10">
              Tüm Paketleri Gör <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPackages.map((pkg: any) => (
              <div key={pkg.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col border border-outline-variant/10 hover:-translate-y-2 relative">
                {pkg.isPopular && (
                  <div className="absolute top-6 left-6 z-20 bg-secondary text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-lg border border-secondary/20 backdrop-blur-md">
                    En Çok Tercih Edilen
                  </div>
                )}
                <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-low flex items-center justify-center p-2">
                  {pkg.imageUrl ? (
                    <Image src={pkg.imageUrl} alt={pkg.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full rounded-2xl relative overflow-hidden">
                       <BrandImageFallback icon="mosque" iconSize={4} />
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-white/95 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {pkg.duration}
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <h3 className="text-2xl font-headline font-bold text-primary mb-4 line-clamp-2 group-hover:text-secondary transition-colors">{pkg.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 line-clamp-3">
                    {pkg.description ? pkg.description.split('|||ITINERARY|||')[0] : ''}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-outline-variant/10">
                    <Link href={`/paketler/${pkg.slug}`} className="w-full bg-primary text-white font-bold tracking-widest uppercase text-[11px] py-4 rounded-xl hover:bg-white hover:text-primary active:scale-95 transition-all flex justify-center items-center gap-3 shadow-md border border-transparent hover:border-outline-variant/20">
                      Paketi İncele <span className="material-symbols-outlined text-[16px]">touch_app</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {featuredPackages.length === 0 && (
              <div className="col-span-1 md:col-span-3 py-24 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-outline-variant/20 border-dashed">
                 <p className="text-outline text-sm tracking-widest uppercase font-bold">Bu sezona ait VIP paketlerimiz güncellenmektedir. Lütfen daha sonra tekrar kontrol ediniz.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-tertiary font-bold tracking-widest uppercase text-sm block mb-4">
                {homeStepsKicker}
              </span>
              <h2 className="font-headline text-3xl md:text-5xl text-primary font-bold">
                {homeStepsTitle}
              </h2>
            </div>
            <div className="text-on-surface-variant max-w-sm text-lg md:text-xl italic font-headline opacity-80 border-l-4 border-tertiary-fixed-dim pl-4">
              "Kalbinizdeki niyet, bizim için en değerli rotadır. Sizin için her detayı incelikle tasarlıyoruz."
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-outline-variant/50 z-0"></div>
            
            <div className="relative z-10 group bg-surface hover:-translate-y-2 transition-transform duration-500">
              <div className="mb-8 w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500 shadow-sm border border-outline-variant/20 group-hover:border-transparent">
                <span className="material-symbols-outlined text-4xl" data-icon="edit_note">
                  edit_note
                </span>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-headline font-bold text-outline">
                  01
                </span>
                <h3 className="text-2xl font-headline font-bold text-primary">
                  Tasarla
                </h3>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Kendi hızınıza, ailenizin ihtiyaçlarına ve manevi beklentilerinize uygun bir plan oluşturun. Otelden rehbere her şeyi siz seçin.
              </p>
            </div>
            
            <div className="relative z-10 group bg-surface hover:-translate-y-2 transition-transform duration-500">
              <div className="mb-8 w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500 shadow-sm border border-outline-variant/20 group-hover:border-transparent">
                <span className="material-symbols-outlined text-4xl" data-icon="description">
                  description
                </span>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-headline font-bold text-outline">
                  02
                </span>
                <h3 className="text-2xl font-headline font-bold text-primary">
                  Teklif Al
                </h3>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Seçtiğiniz kriterlere göre hazırlanan butik teklifimizi dakikalar içinde inceleyin. Şeffaf fiyatlandırma ile sürprizlere yer yok.
              </p>
            </div>
            
            <div className="relative z-10 group bg-surface hover:-translate-y-2 transition-transform duration-500">
              <div className="mb-8 w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-500 shadow-sm border border-outline-variant/20 group-hover:border-transparent">
                <span className="material-symbols-outlined text-4xl" data-icon="forum">
                  forum
                </span>
              </div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-headline font-bold text-outline">
                  03
                </span>
                <h3 className="text-2xl font-headline font-bold text-primary">
                  WhatsApp&apos;tan Kesinleştir
                </h3>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Tüm süreç boyunca yanınızda olan ekibimizle WhatsApp üzerinden iletişime geçin ve yolculuğunuzu güvenle başlatın.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-surface-container">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px] lg:h-[700px]">
            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-2xl shadow-lg bg-surface-container-lowest p-8 md:p-12 flex flex-col justify-end group">
              <img
                alt="Mekke Harem-i Şerif Manzaralı Lüks Otel Konaklaması"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                data-alt="Premium hotel room with Kaaba view"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM2RtX0vVPC6GWUcxcpANmI1T3BzAzzNPeVPKf-dR-u_LwaG8cumBNtYAPkiEqER-ZhV1pYbFj0S2-vbWUx_AKerRswdg-IL1_8lK1EcjdVInHH56psjjIb7G3mh6JLt5n5YyniTuAxY2PXnDLNQpGs4Nt1HVHUI3VUSBiyD8PsEMAvJv4kpHc3dIhrtt_MPJ2pMxbJ9PW1zw08Sy86J7Xl1jgMwwdqtmIASOrBSSA9IoSupMWkdRx47KjAXDjxjrNpK_c6Xeknhw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001944]/90 via-[#001944]/40 to-transparent"></div>
              <div className="relative z-10">
                <h4 className="font-headline text-3xl text-white font-bold mb-4 drop-shadow-md">
                  Harem-i Şerif Manzaralı İstirahat
                </h4>
                <p className="text-white/80 max-w-md text-sm leading-relaxed">
                  Kabe&apos;nin tam kalbinde, her anınızı ibadetle ve huzurla geçirebileceğiniz en prestijli konaklama seçenekleri.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-secondary/10 hover:bg-secondary/20 transition-colors rounded-2xl p-8 md:p-10 flex flex-col justify-center border-l-4 border-secondary shadow-sm">
              <span className="material-symbols-outlined text-secondary text-5xl mb-6" data-icon="menu_book">
                menu_book
              </span>
              <h4 className="font-headline text-2xl text-secondary font-bold mb-3">
                Manevi Rehberlik
              </h4>
              <p className="text-on-surface-variant text-sm">
                İlahiyatçı hocalarımız eşliğinde sadece ritüelleri değil, her bir adımın hikmetini öğrenerek gerçekleştirilen bir yolculuk.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 hover:-translate-y-1 shadow-sm transition-transform flex flex-col items-center text-center justify-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-4xl mb-4" data-icon="family_restroom">
                family_restroom
              </span>
              <h5 className="font-bold text-primary mb-2 text-lg">Aileye Özel</h5>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                Mahremiyet & Konfor
              </p>
            </div>

            <div className="bg-primary rounded-2xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.02] flex flex-col items-center text-center justify-center text-on-primary transition-all">
              <span className="material-symbols-outlined text-on-primary text-4xl mb-4" data-icon="diamond">
                diamond
              </span>
              <h5 className="font-bold mb-2 text-lg text-white">Butik Hizmet</h5>
              <p className="text-xs text-primary-fixed opacity-90 uppercase tracking-widest font-bold">
                Kişiye Özel Plan
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-surface relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-surface-container/50 to-transparent z-0"></div>
        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3">
                {homeBlogKicker}
              </span>
              <h2 className="font-headline text-4xl md:text-5xl text-primary font-bold">
                {homeBlogTitle}
              </h2>
            </div>
            <a href="/blog" className="text-secondary font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-[10px] bg-secondary/10 px-6 py-3 rounded-xl hover:bg-secondary/20 shadow-sm">
              Tüm Yazıları Gör <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <a href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-outline-variant/10 hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden bg-surface-container-low p-2">
                  {blog.imageUrl ? (
                    <Image src={blog.imageUrl} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full rounded-2xl relative overflow-hidden">
                       <BrandImageFallback icon="menu_book" iconSize={4} />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary shadow-sm border border-outline-variant/10">
                    {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <h3 className="font-headline text-2xl font-bold text-primary mb-4 leading-tight line-clamp-2 group-hover:text-secondary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 line-clamp-3">
                    {blog.description}
                  </p>
                  <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">edit_square</span> {blog.author}
                    </span>
                    <span className="text-white bg-secondary w-8 h-8 rounded-full flex items-center justify-center shadow-md group-hover:w-24 transition-all duration-300 overflow-hidden relative">
                      <span className="material-symbols-outlined text-[16px] absolute right-2">arrow_forward</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">Oku</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
            
            {latestBlogs.length === 0 && (
              <div className="col-span-1 md:col-span-3 py-24 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-outline-variant/20 border-dashed">
                 <p className="text-outline text-sm tracking-widest uppercase font-bold">Henüz yayınlanmış bir blog içeriği bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEO FAQ Section - Bireysel Umre Dominasyonu */}
      <section className="py-16 bg-surface-container-low border-t border-outline-variant/10">
        <div className="max-w-screen-md mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold text-primary mb-4">{homeFaqTitle}</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {homeFaqDesc}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-primary mb-3">1. Bireysel Umre Vizesi Nasıl Alınır? Zor Mu?</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Suudi Arabistan yönetimi artık <strong>bireysel umre vizesi</strong> alımını son derece kolaylaştırmıştır. Otel konaklamanız ve uçuşunuz belirlendikten sonra, acente garantörlüğü ile Nusuk sistemi üzerinden 24 saat içerisinde adınıza e-vize tanımlanır. Klasik turların evrak yüküyle uğraşmadan anında hazır olursunuz.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-primary mb-3">2. Diyanetsiz ve Tursuz "Kendi Başına Umre" Yapılabilir Mi?</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Evet, kesinlikle yapılabilir. Kalabalık kafilelere mahkum olmadan, ailenizle <strong>diyanetsiz umre turları</strong> planlamak en doğal hakkınızdır. Sistemimizde yer alan fiyat konfigüratörü ile Kabe manzaralı lüks otellerinizi tamamen kendi bütçenize göre seçer, "Kendi umrenizi kendiniz tasarlarsınız". Bu sistem klasik paketlere göre %30'a varan tasarruf sağlar.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-primary mb-3">3. Bireysel VIP Umre Turlarında Rehberlik Veriliyor Mu?</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Bireysel gitmeniz rehbersiz kalacağınız anlamına gelmez. Vize ve biletleriniz ayarlandıktan sonra, Mekke ve Medine'deki lokal <strong>özel ilahiyatçı rehberlerimiz</strong> karşılama ve ibadetlerinizi ifa etmeniz (Tavaf, Say) noktasında birebir size eşlik eder. 
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-primary mb-3">4. Hangi Aylar (Fırsat Sezonu) Umre İçin Daha Ucuzdur?</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                <strong>2026 Umre fiyatları</strong> döneme göre değişiklik gösterir. Özellikle Şevval ayı ve Kurban bayramı sonrası (Eylül, Ekim ayları) fiyatların en düşük olduğu "Yeşil Sezon"dur. Konfigüratörümüzdeki ısı haritasından bu takvimi görebilir ve çok ucuza VIP kalitesinde seyahat ayarlayabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
