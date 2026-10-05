import { getPageTexts } from "@/lib/page-texts";
import { packageDisplayPrices } from "@/lib/pricing/package-server";
import { SITE_URL } from "@/lib/seo/site";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@/components/home/HeroVideo";
import { Arrow, Badge, CardFooter, EmptyState, Faq, faqJsonLd, MediaCard, PostCard, SectionHead, Steps } from "@/components/ui/kit";
import UmrePlanner from "@/components/home/UmrePlanner";
import UmrahSteps from "@/components/home/UmrahSteps";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { Metadata } from "next";
import { DEFAULT_HANIM_UMRESI_CAMPAIGN, DEFAULT_ILK_UMREM_CAMPAIGN, EYLUL_CAMPAIGN_SETTING_KEY, HANIM_UMRESI_CAMPAIGN_SETTING_KEY, ILK_UMREM_CAMPAIGN_SETTING_KEY, isHomeCardLive, parseEylulCampaign } from "@/lib/eylul-campaign";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import { getApprovedReviews } from "@/lib/reviews";
import ReviewCard from "@/components/reviews/ReviewCard";
import Accent from "@/components/home/Accent";
import NiyetBand from "@/components/home/NiyetBand";
import { cairo, ruqaa } from "@/components/home/fonts";

// Başlıkta *vurgu* yoksa son kelime serif italik vurgulanır (MBD ritmi); admin metninde *…* ile seçilebilir
const accented = (title: string) => (title.includes("*") ? title : title.replace(/(\S+)\s*$/, "*$1*"));

export const metadata: Metadata = {
  title: { absolute: "Bireysel Umre 2026 | Hadi Umreye Gidelim" },
  description: "Bireysel umre 2026: tarihinizi, Mekke ve Medine otelinizi ve gün sayısını siz seçin; vize, uçuş ve transfer tek planda. Teklifi WhatsApp'tan alın.",
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;


// Ana sayfadaki SSS; FAQPage şeması da buradan üretilir (sayfadaki metinle birebir aynı olmalı)
const HOME_FAQ = [
  {
    q: "Bireysel umre vizesi nasıl alınır?",
    a: "Umre, Suudi Arabistan'ın turist e-vizesiyle yapılır. Başvurunuzu biz yaparız: belgeleriniz eksiksiz ulaştıktan sonra vize 2 iş saati içinde çıkar; hizmet ücreti kişi başı 140 USD'dir.",
  },
  {
    q: "Kafileye katılmadan kendi programıyla umre yapılabilir mi?",
    a: "Evet. Tarihi, Mekke ve Medine otelini ve gün sayısını kendiniz seçerek ailenizle kendi programınızla umre yapabilirsiniz. Vize, otel, transfer ve hızlı tren aynı planda ayarlanır.",
  },
  {
    q: "Bireysel umrede rehberlik veriliyor mu?",
    a: "Evet. Bireysel gitmek rehbersiz kalmak demek değildir. Mekke ve Medine'deki özel ilahiyatçı rehberlerimiz karşılamada ve tavaf, sa'y gibi ibadetlerde size birebir eşlik eder.",
  },
  {
    q: "Umre için hangi aylar daha uygun fiyatlıdır?",
    a: "Umre fiyatları döneme göre değişir; Ramazan ve sömestr gibi yoğun dönemlerde oteller pahalanır, yoğunluğun düştüğü aylarda fiyatlar daha uygundur. Seçtiğiniz tarih için güncel fiyatı planlayıcıdan teklif alarak öğrenebilirsiniz.",
  },
];

const homeFaqJsonLd = faqJsonLd(HOME_FAQ);


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




export default async function Home() {
  const [t, reviewTexts, reviews] = await Promise.all([getPageTexts("anasayfa"), getPageTexts("yorumlar"), getApprovedReviews()]);
  // Veritabanına ulaşılamazsa sayfa yine açılsın (boş paket/blog listesiyle)
  const [latestBlogs, rawFeatured, settings] = await Promise.all([
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
  const featuredPackages = await packageDisplayPrices([...rawFeatured]).catch(() => [...rawFeatured]);
  const eylulCampaign = parseEylulCampaign(settings[EYLUL_CAMPAIGN_SETTING_KEY]);
  const ilkUmremCampaign = parseEylulCampaign(settings[ILK_UMREM_CAMPAIGN_SETTING_KEY], DEFAULT_ILK_UMREM_CAMPAIGN);
  const hanimCampaign = parseEylulCampaign(settings[HANIM_UMRESI_CAMPAIGN_SETTING_KEY], DEFAULT_HANIM_UMRESI_CAMPAIGN);

  // Varsayılan kapak: ana sayfa videosunun ilk karesi (eskiden 512 px'lik geçici bir Google görseli büyütülüyordu)
  const home_banner_image = settings.home_banner_image || "/images/hero-kabe.jpg";
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
    <main id="main-content" className={`home-v2 ${cairo.variable} ${ruqaa.variable}`}>
      {/* ─── Hero + planlayıcı ─────────────────────────────── */}
      <section className="relative z-20 w-full pt-28 pb-16 md:pt-32 md:pb-12 md:min-h-[620px] md:flex md:flex-col md:justify-end">
        <div className="absolute inset-0 overflow-hidden">
          <Image alt="Kabe ve Mescid-i Haram" className="object-cover object-bottom" src={home_banner_image} fill priority fetchPriority="high" sizes="100vw" quality={75} />
          {heroVideo && (
            // Döngü video yalnızca geniş ekranda ve sayfa yüklendikten sonra; altta kapak görseli kalır
            <HeroVideo src={heroVideo} poster={`/_next/image?url=${encodeURIComponent(home_banner_image)}&w=1920&q=75`} />
          )}
          <div className="absolute inset-0 bg-[#12295a]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#12295a]/40 via-transparent to-[#12295a]/75" />
        </div>
        <div className="on-dark relative w-full max-w-screen-xl mx-auto px-4 md:px-8">
          <p aria-hidden className="hat text-[var(--h-sand)] text-2xl md:text-3xl mb-2 text-left" style={{ direction: "rtl", unicodeBidi: "plaintext" }}>لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ</p>
          <h1 className="font-headline text-white font-bold tracking-tight max-w-3xl">
            <span className="block font-body text-[12px] md:text-[13px] font-semibold tracking-[0.2em] uppercase text-white/75 mb-3">{t("kicker")}</span>
            <span className="block text-3xl sm:text-4xl md:text-[56px] leading-[1.08] text-balance"><Accent text={accented(home_banner_title)} /></span>
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

      {/* ─── Kampanya bandı (admin'deki yayın tarihleri arasında) ─── */}
      {isHomeCardLive(eylulCampaign) && <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pt-10 md:pt-12">
        <Link href="/eylul-umresi" data-press className="group relative flex flex-col md:flex-row md:items-center gap-5 overflow-hidden rounded-2xl bg-primary text-white p-6 md:p-7">
          <div className="absolute inset-y-0 right-0 w-1/2 hidden md:block">
            {eylulCampaign.heroImage && <Image src={eylulCampaign.heroImage} alt="" fill sizes="(min-width: 1280px) 640px, 50vw" className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" />}
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
      </section>}

      {/* ─── Paketler ──────────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead kicker={homeToursKicker} title={<Accent text={accented(homeToursTitle)} />} href="/paketler" linkLabel="Tüm paketler" />
        {featuredPackages.length === 0 ? (
          <EmptyState>Bu sezonun paketleri güncelleniyor.</EmptyState>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none]">
            {featuredPackages.map((pkg) => (
              <MediaCard
                key={pkg.id}
                href={`/paketler/${pkg.slug}`}
                className="snap-start shrink-0 w-[80%] sm:w-[55%] md:w-auto"
                title={pkg.title}
                description={pkg.description ? pkg.description.split('|||ITINERARY|||')[0] : undefined}
                image={pkg.imageUrl}
                sizes="(max-width: 768px) 80vw, 33vw"
                topLeft={<Badge>{pkg.duration}</Badge>}
                topRight={pkg.id === popularPackageId ? <Badge tone="primary">En çok tercih edilen</Badge> : undefined}
                footer={<CardFooter price={pkg.price} currency={pkg.currency} />}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Nasıl çalışır ─────────────────────────────────── */}
      <section className="w-full bg-warm">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 md:py-12 grid md:grid-cols-[0.8fr_2fr] gap-8 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">{homeStepsKicker}</p>
            <h2 className="mt-1.5 font-headline text-2xl md:text-[32px] leading-tight text-primary font-bold"><Accent text={accented(homeStepsTitle)} /></h2>
          </div>
          <Steps items={steps} />
        </div>
      </section>

      {/* ─── Umre adımları ─────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHead kicker="Adım adım" title={<Accent text="Umre *nasıl yapılır?*" />} href="/ilk-umrem" linkLabel="İlk umrem rehberi" />
        <UmrahSteps />
      </section>

      {/* ─── Koyu bant: planlayıcıya çağrı ───────────────────── */}
      <NiyetBand />

      {/* ─── Kampanyalar ───────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pb-12 md:pb-16 grid md:grid-cols-2 gap-4 md:gap-5">
        {[
          { c: ilkUmremCampaign, href: "/ilk-umrem" },
          { c: hanimCampaign, href: "/hanim-umresi" },
        ].filter(({ c }) => isHomeCardLive(c)).map(({ c, href }) => (
          <Link key={href} href={href} data-reveal className="group relative overflow-hidden rounded-2xl min-h-[220px] flex items-end p-6 text-white">
            {c.heroImage && <Image src={c.heroImage} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />}
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

      {/* ─── Yorumlar (admin → Yorumlar; metinler Sayfa Metinleri → Yorumlar) ─── */}
      {reviews.length > 0 && (
        <section className="w-full bg-soft">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
            <SectionHead kicker={reviewTexts("kicker")} title={<Accent text={accented(reviewTexts("title"))} />} href="/yorumlar" linkLabel={reviewTexts("link")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {reviews.slice(0, 6).map((r) => <ReviewCard key={r.id} r={r} clamp />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── Blog ──────────────────────────────────────────── */}
      <section className="w-full bg-sky">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <SectionHead kicker={homeBlogKicker} title={<Accent text={accented(homeBlogTitle)} />} href="/blog" linkLabel="Tüm yazılar" />
          {latestBlogs.length === 0 ? (
            <EmptyState onWhite>Henüz yayınlanmış yazı yok.</EmptyState>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {latestBlogs.map((blog) => (
                <PostCard key={blog.id} href={`/blog/${blog.slug}`} title={blog.title} description={blog.description} image={blog.imageUrl} date={blog.createdAt} author={blog.authorModel?.name} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── SSS ───────────────────────────────────────────── */}
      <section className="w-full max-w-screen-md mx-auto px-4 md:px-8 py-12 md:py-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary text-center"><Accent text={accented(homeFaqTitle)} /></h2>
        <p className="mt-2 text-sm text-on-surface-variant text-center">{homeFaqDesc}</p>
        <div className="mt-7"><Faq items={HOME_FAQ} /></div>
        <PageTrust className="mt-6 text-center" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([homeFaqJsonLd, webPageJsonLd({ url: `${SITE_URL}/`, name: "Bireysel Umre 2026" })]) }} />
      </section>
    </main>
  );
}
