import React from "react";
import Link from "next/link";
import Image from "next/image";
import BrandImageFallback from "@/components/ui/BrandImageFallback";
import UmrePlanner from "@/components/home/UmrePlanner";
import UmrahSteps from "@/components/home/UmrahSteps";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { Metadata } from "next";
import { DEFAULT_HANIM_UMRESI_CAMPAIGN, DEFAULT_ILK_UMREM_CAMPAIGN, EYLUL_CAMPAIGN_SETTING_KEY, HANIM_UMRESI_CAMPAIGN_SETTING_KEY, ILK_UMREM_CAMPAIGN_SETTING_KEY, parseEylulCampaign } from "@/lib/eylul-campaign";

export const metadata: Metadata = {
  title: { absolute: "Bireysel Umre 2026: Kendi Umreni Tasarla | Hadi Umre'ye Gidelim" },
  description: "Diyanet turlarına veya kafilelere bağlı kalmadan, 2026 Özel Bireysel Umre ve VIP Aile umresi planlama platformu. En ucuz fiyatlar ve butik hizmet.",
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;


// Ana sayfadaki SSS; FAQPage şeması da buradan üretilir (sayfadaki metinle birebir aynı olmalı)
const HOME_FAQ = [
  {
    q: "Bireysel umre vizesi nasıl alınır?",
    a: "Otel konaklamanız ve uçuşunuz belirlendikten sonra, acente garantörlüğü ile Nusuk sistemi üzerinden 24 saat içinde adınıza e-vize tanımlanır. Klasik turların evrak yüküyle uğraşmanız gerekmez.",
  },
  {
    q: "Kafileye katılmadan kendi programıyla umre yapılabilir mi?",
    a: "Evet. Ailenizle kendi programınızla umre planlayabilirsiniz. Fiyat konfigüratörümüzde Kâbe manzaralı otelleri bütçenize göre seçer, umrenizi kendiniz tasarlarsınız. Bu sistem klasik paketlere göre %30'a varan tasarruf sağlar.",
  },
  {
    q: "Bireysel umrede rehberlik veriliyor mu?",
    a: "Evet. Bireysel gitmek rehbersiz kalmak demek değildir. Mekke ve Medine'deki özel ilahiyatçı rehberlerimiz karşılamada ve tavaf, sa'y gibi ibadetlerde size birebir eşlik eder.",
  },
  {
    q: "Umre için hangi aylar daha uygun fiyatlıdır?",
    a: "Umre fiyatları döneme göre değişir. Şevval ayı ve Kurban Bayramı sonrası (eylül ve ekim) fiyatların en düşük olduğu dönemdir. Konfigüratörümüzdeki fiyat takviminden uygun tarihleri görebilirsiniz.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", TRY: "₺", SAR: "SAR" };

/** Hızlı erişim sekmeleri (ikonlar satır içi SVG: simge yazı tipine bağlı değil) */
const QUICK_LINKS: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/paketler", label: "Umre paketleri", icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></> },
  { href: "/bireysel-umre", label: "Bireysel umre", icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></> },
  { href: "/umre-vizesi", label: "Umre vizesi", icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 17h6" /></> },
  { href: "/bireysel-umre", label: "Otel ve konaklama", icon: <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M8 7h4M8 11h4M8 15h4M3 21h18" /></> },
  { href: "/hizmetler", label: "Transfer ve tren", icon: <><path d="M5 17h14v-5l-2-5H7l-2 5v5zM5 12h14" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></> },
  { href: "/rehberlik", label: "Rehberlik", icon: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></> },
  { href: "/ilk-umrem", label: "İlk umrem", icon: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z" /> },
  { href: "/hanim-umresi", label: "Hanım umresi", icon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /> },
];

const Arrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.64l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
);

function SectionHead({ kicker, title, href, linkLabel }: { kicker: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">{kicker}</p>
        <h2 className="mt-1.5 font-headline text-2xl md:text-3xl text-primary font-bold">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline underline-offset-4">
          {linkLabel} <Arrow />
        </Link>
      )}
    </div>
  );
}

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ${CURRENCY_SYMBOL[currency] ?? currency}`;
}

export default async function Home() {
  // Veritabanına ulaşılamazsa sayfa yine açılsın (boş paket/blog listesiyle)
  const [latestBlogs, featuredPackages, settings] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { authorModel: { select: { name: true } } },
    }),
    prisma.package.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    getSiteSettings(),
  ]).catch((e) => {
    console.error("Ana sayfa verisi alınamadı:", e);
    return [[], [], {} as Record<string, string>] as const;
  });
  const eylulCampaign = parseEylulCampaign(settings[EYLUL_CAMPAIGN_SETTING_KEY]);
  const ilkUmremCampaign = parseEylulCampaign(settings[ILK_UMREM_CAMPAIGN_SETTING_KEY], DEFAULT_ILK_UMREM_CAMPAIGN);
  const hanimCampaign = parseEylulCampaign(settings[HANIM_UMRESI_CAMPAIGN_SETTING_KEY], DEFAULT_HANIM_UMRESI_CAMPAIGN);

  const home_banner_image = settings.home_banner_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCeWn_hW89LbHLjNkEyCjXnO56IpdLz_zRwB9BvtIjHV_CSU9n_ADpxoS-K9Y4UqzQtVdJ9tM238gIiQ3fIEgF50wPqba1ofx6HeAab2E8EYwvLnq_w13P3UCdpuZloJ2P_FBbqiM4ZrKqELKyG3sgBrj2SCUi6yLGc39nIApI_ip6uasqiKaUGRcpE7WnqmMcqOZVc-CUXOaphNXOHK18KEZCYKehmVy4cZRQP0tk7_PHK5iJh4cVmqsN9DeHNleLOmi97WPx_9Gw";
  const heroVideo = settings.HOME_HERO_VIDEO?.trim() || "";
  const home_banner_title = settings.HERO_TITLE || "Ruhunuzun Ritmini Kalabalıklara Teslim Etmeyin.";
  const home_banner_subtitle = settings.HERO_DESC || "Ailenize ve Size Özel Butik Umre Deneyimi.";
  const whatsappNumber = settings.WHATSAPP_NUMBER ? settings.WHATSAPP_NUMBER.replace('+', '') : "905404010038";

  const homeToursKicker = settings.HOME_TOURS_KICKER || "Kişiselleştirilmiş Lüks Turlar";
  const homeToursTitle = settings.HOME_TOURS_TITLE || "Müsait & VIP Paketlerimiz";
  const homeStepsKicker = settings.HOME_STEPS_KICKER || "Adım Adım Yolculuk";
  const homeStepsTitle = settings.HOME_STEPS_TITLE || "Maneviyat Yolunda Hazırlığınız Nasıl Başlar?";
  const homeBlogKicker = settings.HOME_BLOG_KICKER || "İlham Kaynağı";
  const homeBlogTitle = settings.HOME_BLOG_TITLE || "Manevi Rehberlik Blogu";
  const homeFaqTitle = settings.HOME_FAQ_TITLE || "Bireysel Umre Rehberi: 2026 Vize ve Detaylar";
  const homeFaqDesc = settings.HOME_FAQ_DESC || "Kafilelere bağlı kalmadan kendi imkanlarıyla bireysel umre yapmak isteyenlerin en çok sorduğu sorular.";

  // "En çok tercih edilen" rozeti yalnızca bir pakette
  const popularPackageId = featuredPackages.find((p) => p.isPopular)?.id;

  const steps = [
    { n: "1", title: "Tasarla", text: "Tarihi, otel tercihini ve Mekke–Medine gün sayısını seçin." },
    { n: "2", title: "Teklif al", text: "Seçimlerinize göre hazırlanan teklifi WhatsApp'tan alın." },
    { n: "3", title: "Yola çık", text: "Vize, otel ve transfer ayarlanır; yolculuk boyunca yanınızdayız." },
  ];

  return (
    <>
      {/* ─── Hero + planlayıcı ─────────────────────────────── */}
      <section className="relative z-20 w-full pt-28 pb-16 md:pt-32 md:pb-12 md:min-h-[620px] md:flex md:flex-col md:justify-end">
        <div className="absolute inset-0 overflow-hidden">
          <Image alt="Kabe ve Mescid-i Haram" className="object-cover object-bottom" src={home_banner_image} fill priority fetchPriority="high" sizes="100vw" quality={80} />
          {heroVideo && (
            // Döngü video; görsel altta kalır (video yüklenene kadar ve "hareketi azalt" açıksa görünür)
            <video className="hero-video absolute inset-0 w-full h-full object-cover object-bottom" autoPlay muted loop playsInline preload="auto" poster={home_banner_image} aria-hidden="true">
              <source src={heroVideo} type={heroVideo.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"} />
            </video>
          )}
          <div className="absolute inset-0 bg-[#001944]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001944]/40 via-transparent to-[#001944]/70" />
        </div>
        <div className="relative w-full max-w-screen-xl mx-auto px-4 md:px-8">
          <h1 className="font-headline text-white font-bold tracking-tight max-w-3xl">
            <span className="block font-body text-[12px] md:text-[13px] font-semibold tracking-[0.2em] uppercase text-white/75 mb-3">Bireysel Umre 2026</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl leading-[1.12] text-balance">{home_banner_title}</span>
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/85 max-w-2xl">{home_banner_subtitle}</p>
          <div className="mt-7 md:mt-9">
            <UmrePlanner whatsappNumber={whatsappNumber} />
          </div>
        </div>
      </section>

      {/* ─── Hızlı erişim ──────────────────────────────────── */}
      <nav aria-label="Hızlı erişim" className="w-full bg-white border-b border-outline-variant/20">
        <ul className="max-w-screen-xl mx-auto px-2 md:px-6 flex lg:justify-center overflow-x-auto [scrollbar-width:none]">
          {QUICK_LINKS.map((q) => (
            <li key={q.label} className="shrink-0">
              <Link href={q.href} className="group flex flex-col items-center gap-1.5 px-4 md:px-5 py-4 text-on-surface-variant hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-6 h-6 transition-transform group-hover:-translate-y-0.5">{q.icon}</svg>
                <span className="text-[12px] font-semibold whitespace-nowrap">{q.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── Kampanya bandı ────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pt-10 md:pt-12">
        <Link href="/eylul-umresi" data-press className="group relative flex flex-col md:flex-row md:items-center gap-5 overflow-hidden rounded-2xl bg-primary text-white p-6 md:p-7">
          <div className="absolute inset-y-0 right-0 w-1/2 hidden md:block">
            <img src={eylulCampaign.heroImage} alt="" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent" />
          </div>
          <div className="relative flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c9a96e]">{eylulCampaign.homeBadge}</p>
            <h2 className="mt-1.5 font-headline text-xl md:text-2xl font-bold">{eylulCampaign.homeTitle}</h2>
            <p className="mt-1 text-sm text-white/75 max-w-xl">{eylulCampaign.homeDescription}</p>
          </div>
          <span className="relative shrink-0 inline-flex items-center gap-2 bg-white text-primary font-bold text-sm px-5 py-3 rounded-xl group-hover:bg-[#c9a96e] transition-colors">
            {eylulCampaign.homeButton} <Arrow />
          </span>
        </Link>
      </section>

      {/* ─── Paketler ──────────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead kicker={homeToursKicker} title={homeToursTitle} href="/paketler" linkLabel="Tüm paketler" />
        {featuredPackages.length === 0 ? (
          <p className="py-10 text-center text-sm text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl">Bu sezonun paketleri güncelleniyor.</p>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none]">
            {featuredPackages.map((pkg) => (
              <Link key={pkg.id} href={`/paketler/${pkg.slug}`} data-reveal className="group snap-start shrink-0 w-[80%] sm:w-[55%] md:w-auto flex flex-col bg-white rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_18px_40px_-20px_rgba(0,25,68,0.4)] transition-shadow">
                <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
                  {pkg.imageUrl ? (
                    <Image src={pkg.imageUrl} alt={pkg.title} fill sizes="(max-width: 768px) 80vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <BrandImageFallback icon="mosque" iconSize={3} />
                  )}
                  <span className="absolute top-3 left-3 bg-white/95 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg">{pkg.duration}</span>
                  {pkg.id === popularPackageId && <span className="absolute top-3 right-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">En çok tercih edilen</span>}
                </div>
                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <h3 className="font-headline text-lg font-bold text-primary leading-snug line-clamp-2">{pkg.title}</h3>
                  <p className="mt-1.5 text-[13px] text-on-surface-variant line-clamp-2">{pkg.description ? pkg.description.split('|||ITINERARY|||')[0] : ''}</p>
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    {pkg.price > 0 ? (
                      <p className="text-[12px] text-on-surface-variant">Başlangıç<span className="block font-headline text-xl font-bold text-primary">{formatPrice(pkg.price, pkg.currency)}</span></p>
                    ) : <span />}
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary group-hover:gap-2 transition-all">İncele <Arrow /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Nasıl çalışır ─────────────────────────────────── */}
      <section className="w-full bg-white border-y border-outline-variant/20">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 md:py-12 grid md:grid-cols-[0.8fr_2fr] gap-8 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">{homeStepsKicker}</p>
            <h2 className="mt-1.5 font-headline text-2xl md:text-[28px] leading-tight text-primary font-bold">{homeStepsTitle}</h2>
          </div>
          <ol className="grid sm:grid-cols-3 gap-4">
            {steps.map((st) => (
              <li key={st.n} className="flex gap-3">
                <span className="w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">{st.n}</span>
                <span>
                  <span className="block font-semibold text-on-surface">{st.title}</span>
                  <span className="block text-[13px] text-on-surface-variant mt-0.5">{st.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Umre adımları ─────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead kicker="Adım adım" title="Umre nasıl yapılır?" href="/ilk-umrem" linkLabel="İlk umrem rehberi" />
        <UmrahSteps />
      </section>

      {/* ─── Kampanyalar ───────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pb-12 md:pb-16 grid md:grid-cols-2 gap-4 md:gap-5">
        {[
          { c: ilkUmremCampaign, href: "/ilk-umrem" },
          { c: hanimCampaign, href: "/hanim-umresi" },
        ].map(({ c, href }) => (
          <Link key={href} href={href} data-reveal className="group relative overflow-hidden rounded-2xl min-h-[220px] flex items-end p-6 text-white">
            <img src={c.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001944]/95 via-[#001944]/55 to-[#001944]/10" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{c.homeBadge}</p>
              <h2 className="mt-1 font-headline text-xl md:text-2xl font-bold">{c.homeTitle}</h2>
              <p className="mt-1 text-sm text-white/80 line-clamp-2 max-w-md">{c.homeDescription}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">{c.homeButton} <Arrow /></span>
            </div>
          </Link>
        ))}
      </section>

      {/* ─── Blog ──────────────────────────────────────────── */}
      <section className="w-full bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <SectionHead kicker={homeBlogKicker} title={homeBlogTitle} href="/blog" linkLabel="Tüm yazılar" />
          {latestBlogs.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl bg-white">Henüz yayınlanmış yazı yok.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {latestBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} data-reveal className="group flex gap-4 sm:flex-col bg-white rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_18px_40px_-20px_rgba(0,25,68,0.35)] transition-shadow p-3 sm:p-0">
                  <div className="relative w-24 h-24 sm:w-auto sm:h-auto sm:aspect-[16/9] shrink-0 rounded-xl sm:rounded-none overflow-hidden bg-surface-container-low">
                    {blog.imageUrl ? (
                      <Image src={blog.imageUrl} alt={blog.title} fill sizes="(max-width: 640px) 96px, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <BrandImageFallback icon="menu_book" iconSize={2} />
                    )}
                  </div>
                  <div className="min-w-0 sm:p-5 flex flex-col">
                    <p className="text-[12px] text-on-surface-variant">
                      {new Date(blog.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {blog.authorModel?.name ? ` · ${blog.authorModel.name}` : ""}
                    </p>
                    <h3 className="mt-1 font-headline text-base md:text-lg font-bold text-primary leading-snug line-clamp-2 group-hover:underline underline-offset-4">{blog.title}</h3>
                    <p className="hidden sm:block mt-1.5 text-[13px] text-on-surface-variant line-clamp-2">{blog.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── SSS ───────────────────────────────────────────── */}
      <section className="w-full max-w-screen-md mx-auto px-4 md:px-8 py-12 md:py-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary text-center">{homeFaqTitle}</h2>
        <p className="mt-2 text-sm text-on-surface-variant text-center">{homeFaqDesc}</p>
        <div className="mt-7 divide-y divide-outline-variant/30 border-y border-outline-variant/30">
          {HOME_FAQ.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <h3 className="font-semibold text-[15px] md:text-base text-on-surface group-open:text-primary">{item.q}</h3>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-primary shrink-0 transition-transform group-open:rotate-45"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
              </summary>
              <p className="pb-4 -mt-1 text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </section>
    </>
  );
}
