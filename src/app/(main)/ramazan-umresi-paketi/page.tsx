// Ramazan 2027 umre paketi (25 Ekim, kullanıcı): Safwah Al Talayie, 30 / 15 / 10 / 5 Ramazan; doğrudan rezervasyon.
// Fiyat ve oda kuralı: src/lib/ramazan/paketler.ts. Müsaitlik sayfada istemci tarafında da tazelenir (/api/ramazan).
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import { cairo } from "@/components/home/fonts";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";
import MobileActionBar from "@/components/layout/MobileActionBar";
import RamazanRezervasyon from "@/components/ramazan/RamazanRezervasyon";
import { Arrow, Breadcrumb, Faq, faqJsonLd } from "@/components/ui/kit";
import { otelGalerisi } from "@/lib/hotels/galeri";
import { ramazanDurumu } from "@/lib/ramazan";
import { RAMAZAN } from "@/lib/ramazan/paketler";
import { getSiteSettings } from "@/lib/site-settings";
import { ogGorsel } from "@/lib/seo/og";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 60;

const BASLIK = "Ramazan Umresi Paketi 2027 · Safwah Al Talayie · Vize Dahil";
const ACIKLAMA = "Ramazan 2027'de Mekke'de 30, 15, 10 ya da 5 gece: Safwah Al Talayie'de sahur ve iftar dahil konaklama, umre vizesi ve Cidde ↔ Mekke transfer. Tarihinizi seçin, yerinizi hemen ayırın.";

export const metadata: Metadata = {
  title: BASLIK,
  description: ACIKLAMA,
  alternates: { canonical: "/ramazan-umresi-paketi" },
  openGraph: { images: [ogGorsel("ramazan-umresi", BASLIK, "Ramazan umresi 2027")] },
};

const DAHIL: { icon: HugIconName; baslik: string; metin: string }[] = [
  { icon: "vize", baslik: "Umre vizesi", metin: "E-vize ve zorunlu sağlık sigortası. Belgeler tamamsa 2 iş saatinde." },
  { icon: "otel", baslik: "Otel, sahur ve iftar dahil", metin: `${RAMAZAN.otelAdi}; Harem'e ücretsiz servis.` },
  { icon: "transfer", baslik: "Özel araçla transfer", metin: "Cidde Havalimanı → otel → havalimanı, Toyota Camry." },
  { icon: "takvim", baslik: "Ramazan'ın tamamı ya da bir kısmı", metin: "30, 15, 10 ya da 5 gece; 7 Şubat – 9 Mart 2027." },
];

const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

export default async function Page() {
  const [durum, settings] = await Promise.all([ramazanDurumu().catch(() => null), getSiteSettings()]);
  const whatsapp = (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "");
  const galeri = otelGalerisi(RAMAZAN.otelSlug);
  const tumFiyatlar = durum?.secenekler.flatMap((s) => s.fiyatlar.map((f) => f.kisiBasiUsd)) ?? [];
  const enDusuk = tumFiyatlar.length ? Math.min(...tumFiyatlar) : null;
  const waGenel = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Merhaba, Ramazan 2027 umre paketi hakkında bilgi almak istiyorum.")}`;

  const sss = [
    { q: "Fiyata neler dahil?", a: `Umre vizesi (e-vize ve zorunlu sağlık sigortası), ${RAMAZAN.otelAdi} otelinde sahur ve iftar dahil konaklama, Cidde Havalimanı ile otel arasında gidiş-dönüş transfer (Toyota Camry, özel araç). Uçak bileti dahil değildir.` },
    { q: "Tarihler nasıl belirleniyor?", a: "Otel 7 Şubat 2027 akşamı giriş, 9 Mart 2027 sabahı çıkış olmak üzere 30 gece ayrıldı. Bu süre 5'er gecelik bölümlere ayrılır: 30 Ramazan bütün ayı, 15 Ramazan ilk ya da ikinci yarıyı, 10 Ramazan üç bölümden birini, 5 Ramazan altı bölümden birini kapsar. Hicri takvim hilale göre kesinleştiği için Ramazan'ın ilk günü bir gün kayabilir; otel tarihleri değişmez." },
    { q: "Oda başkalarıyla paylaşılıyor mu?", a: "Hayır. Seçtiğiniz tarihlerde oda yalnızca sizin grubunuza ayrılır. Oda 4 kişiliktir; 2, 3 ya da 4 kişi kalabilirsiniz. Oda bedeli aynı kaldığı için kişi sayısı arttıkça kişi başı fiyat düşer." },
    { q: "Rezervasyon nasıl kesinleşiyor?", a: `Formu gönderdiğinizde yeriniz hemen ayrılır ve size bir rezervasyon kodu verilir. Ödeme bilgilerini WhatsApp'tan iletiriz; ödeme ${RAMAZAN.odemeSaat} saat içinde yapılmazsa yer serbest kalır.` },
    { q: "Neden bazı tarihler kapalı görünüyor?", a: "Odalarımız sınırlıdır. Bir tarih aralığı dolduğunda o seçenek kapanır; yeni yer açıldığında sayfada yeniden görünür." },
    { q: "Fiyatlar hangi para birimiyle?", a: "Fiyatlar ABD doları üzerindendir ve kişi başı son fiyattır; ödeme yönteminden bağımsız olarak aynıdır." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: BASLIK,
    description: ACIKLAMA,
    image: galeri[0] ? [`${SITE_URL}${galeri[0].src}`] : [],
    brand: { "@type": "Brand", name: "Hadi Umreye Gidelim" },
    ...(enDusuk && tumFiyatlar.length
      ? { offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: String(enDusuk), highPrice: String(Math.max(...tumFiyatlar)), offerCount: String(tumFiyatlar.length), url: `${SITE_URL}/ramazan-umresi-paketi` } }
      : {}),
  };

  return (
    <main id="main-content" className={`home-v2 ${cairo.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, faqJsonLd(sss)]) }} />

      {/* ─── Üst ─── */}
      <section className="bg-deep on-dark relative overflow-hidden pt-24 text-white md:pt-32">
        <span aria-hidden className="hat pointer-events-none absolute -right-6 bottom-0 select-none text-[9rem] leading-none text-white/[0.05] md:text-[14rem]">رمضان</span>
        <div className="relative mx-auto grid max-w-screen-xl gap-8 px-4 pb-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:pb-16">
          <div>
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/90">
              <Breadcrumb items={[{ label: "Anasayfa", href: "/" }, { label: "Paketler", href: "/paketler" }, { label: "Ramazan umresi 2027" }]} />
            </div>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--h-sand)]">Ramazan umresi 2027 · Vize dahil</p>
            <h1 className="mt-2 font-headline text-[34px] font-bold leading-[1.08] md:text-[52px]">
              <Accent text="Ramazan'ı *Mekke'de* geçirin" />
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/80 md:text-[17px]">
              {`${RAMAZAN.otelAdi} otelinde sahur ve iftar dahil konaklama, umre vizesi ve Cidde ↔ Mekke transfer. Ramazan'ın tamamı ya da 15, 10, 5 gecesi; 2, 3 ya da 4 kişilik oda.`}
            </p>
            {enDusuk && (
              <div className="mt-6">
                <p className="text-[12px] text-white/70">Kişi başı, 5 gece · 4 kişilik oda</p>
                <p className="font-headline text-[42px] font-bold leading-none text-white md:text-[52px]">{usd(enDusuk)}<span className="text-[18px] font-semibold text-white/70">&apos;dan</span></p>
              </div>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#rezervasyon" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[var(--h-sand)] px-6 text-[15px] font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                Yerinizi ayırın <Arrow />
              </a>
              <a href={waGenel} target="_blank" rel="noopener" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-white/30 px-5 text-[15px] font-semibold text-white transition hover:bg-white/10">
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp&apos;tan sorun
              </a>
            </div>
          </div>
          {galeri[0] && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              <Image src={galeri[0].src} alt={galeri[0].alt} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
              <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-[12px] font-bold text-primary">{RAMAZAN.otelAdi}</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── Dahil olanlar ─── */}
      <section className="mx-auto max-w-screen-xl px-4 pt-10 md:px-8 md:pt-14">
        <h2 className="font-headline text-[24px] font-bold text-primary md:text-[30px]"><Accent text="Fiyata *neler* dahil?" /></h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {DAHIL.map((d) => (
            <div key={d.baslik} className="rounded-2xl border border-outline-variant/30 bg-white p-4">
              <HugIcon name={d.icon} size={30} className="text-primary" />
              <p className="mt-3 text-[15px] font-bold leading-snug text-on-surface">{d.baslik}</p>
              <p className="mt-1 text-[13px] leading-snug text-on-surface-variant">{d.metin}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-on-surface-variant">Dahil değil: uçak bileti, Medine ziyareti ve kişisel harcamalar.</p>
      </section>

      {/* ─── Rezervasyon ─── */}
      <section id="rezervasyon" className="scroll-mt-20 bg-warm mt-10 py-10 md:mt-14 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-primary/70">Rezervasyon</p>
          <h2 className="mt-1 font-headline text-[26px] font-bold leading-tight text-primary md:text-[34px]"><Accent text="Tarihinizi seçin, yerinizi *ayırın*" /></h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-on-surface-variant">
            Odalarımız sınırlı. Formu gönderdiğiniz anda yeriniz ayrılır; ödeme bilgilerini WhatsApp&apos;tan iletiriz. Ödeme {RAMAZAN.odemeSaat} saat içinde yapılmazsa yer serbest kalır.
          </p>
          <div className="mt-6">
            <RamazanRezervasyon ilk={durum?.secenekler ?? null} whatsapp={whatsapp} />
          </div>
        </div>
      </section>

      {/* ─── Otel ─── */}
      <section className="mx-auto max-w-screen-xl px-4 py-10 md:px-8 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-primary/70">Konaklama</p>
            <h2 className="mt-1 font-headline text-[24px] font-bold text-primary md:text-[30px]">{RAMAZAN.otelAdi}</h2>
          </div>
          <Link href={`/oteller/${RAMAZAN.otelSlug}`} className="shrink-0 pb-1 text-[13px] font-semibold text-primary">Otel sayfası →</Link>
        </div>
        {galeri.length > 0 && (
          <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:px-0 [&::-webkit-scrollbar]:hidden">
            {galeri.map((g) => (
              <div key={g.src} className="relative aspect-[4/3] w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl bg-surface-container-low md:w-auto">
                <Image src={g.src} alt={g.alt} fill sizes="(min-width: 768px) 20vw, 72vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Süreç ─── */}
      <section className="bg-soft py-10 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <h2 className="font-headline text-[24px] font-bold text-primary md:text-[30px]"><Accent text="Nasıl *ilerliyor?*" /></h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-4 md:gap-4">
            {[
              ["Seçin", "Paketi, tarihleri ve oda tipini seçin."],
              ["Yerinizi ayırın", "Yolcu adlarını yazıp gönderin; yeriniz hemen ayrılır."],
              [`${RAMAZAN.odemeSaat} saatte ödeyin`, "Ödeme bilgilerini WhatsApp'tan iletiriz; ödemeyle kesinleşir."],
              ["Yola çıkın", "Vizeniz hazırlanır; Cidde'de sizi karşılarız."],
            ].map(([b, m], i) => (
              <li key={b} className="flex gap-3 rounded-2xl bg-white p-4 md:flex-col">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[50%] bg-primary text-[15px] font-bold text-white">{i + 1}</span>
                <span>
                  <span className="block text-[16px] font-bold text-on-surface">{b}</span>
                  <span className="mt-0.5 block text-[14px] leading-snug text-on-surface-variant">{m}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── SSS ─── */}
      <section className="mx-auto max-w-screen-md px-4 py-10 md:px-8 md:py-16">
        <h2 className="text-center font-headline text-[24px] font-bold text-primary md:text-[30px]"><Accent text="Sık sorulan *sorular*" /></h2>
        <div className="mt-6"><Faq items={sss} /></div>
        <p className="mt-6 text-center text-[12px] text-on-surface-variant">Ramazan 2027 · Uçak bileti dahil değildir.</p>
      </section>

      <MobileActionBar
        etiket="Kişi başı · 4 kişi"
        fiyat={enDusuk ? `${usd(enDusuk)}'dan` : null}
        alt="Vize, otel, transfer dahil"
        dugme="Yerinizi ayırın"
        href="#rezervasyon"
        whatsapp={waGenel}
      />
    </main>
  );
}
