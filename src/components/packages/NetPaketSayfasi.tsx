// Net fiyatlı paket sayfası (20 Ekim, kullanıcı: "gecelik ve kişi farklılıkları olacak, sayfa tasarımını hazırla, reklam çıkacağız").
// Reklamdan gelen ziyaretçi için: üstte vitrin fiyatı ve dahil olanlar, ortada gece × kişi fiyat hesaplayıcısı, sonra otel, süreç ve SSS.
// Telefonda altta sabit fiyat çubuğu. Fiyat modeli: src/lib/pricing/net-paket.ts
import Image from "next/image";
import Link from "next/link";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import { cairo } from "@/components/home/fonts";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";
import MobileActionBar from "@/components/layout/MobileActionBar";
import NetFiyatHesaplayici from "@/components/packages/NetFiyatHesaplayici";
import { Arrow, Breadcrumb, Faq, faqJsonLd } from "@/components/ui/kit";
import type { CatalogItem } from "@/lib/catalog";
import { otelGalerisi } from "@/lib/hotels/galeri";
import type { NetFiyat, NetPaket } from "@/lib/pricing/net-paket";
import { SITE_URL } from "@/lib/seo/site";

const dahil = (otelAdi: string, cfg: NetPaket): { icon: HugIconName; baslik: string; metin: string }[] => [
  { icon: "vize", baslik: "Umre vizesi", metin: "E-vize ve zorunlu sağlık sigortası. Belgeler tamamsa 2 iş saatinde." },
  { icon: "otel", baslik: cfg.yemek ? `Otel, ${cfg.yemek}` : "Otel konaklaması", metin: `${otelAdi}; ${cfg.otelNotu}.` },
  { icon: "transfer", baslik: "Özel araçla transfer", metin: "Cidde Havalimanı → otel → havalimanı, Toyota Camry." },
  { icon: "kabe", baslik: "Mekke ziyaret turu", metin: "Cebel-i Nur, Sevr, Arafat ve Mina." },
];

export default function NetPaketSayfasi({ pkg, cfg, tablo, otel, whatsapp, ay }: {
  pkg: { slug: string; title: string; description: string };
  cfg: NetPaket;
  tablo: NetFiyat[];
  otel: CatalogItem | null;
  whatsapp: string;
  ay: string;
}) {
  const vitrin = tablo.find((t) => t.gece === cfg.vitrin.gece && t.kisi === cfg.vitrin.kisi) ?? tablo[0];
  const enDusuk = tablo.reduce((a, b) => (b.kisiBasiUsd < a.kisiBasiUsd ? b : a), tablo[0]);
  const otelAdi = otel?.name ?? pkg.title;
  // Ek almayan kalıp ("… otelinde"): otel adına göre 'de/'da/'te ayrımı gerekmesin
  const konaklama = cfg.yemek ? `${otelAdi} otelinde ${cfg.yemek} konaklama` : `${otelAdi} otelinde konaklama (yemek hariç)`;
  const DAHIL = dahil(otelAdi, cfg);
  const galeri = otelGalerisi(cfg.hotelSlug);
  const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0$`;
  const waGenel = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Merhaba, "${pkg.title}" hakkında bilgi almak istiyorum.\nKaç gece: \nKaç kişi: \nTarih: `)}`;

  const sss = [
    { q: "Fiyata neler dahil?", a: `Umre vizesi (e-vize ve zorunlu sağlık sigortası), ${konaklama}, Cidde Havalimanı'nda karşılama, havalimanı ile otel arasındaki gidiş-dönüş transferleri (Toyota Camry, özel araç) ve Mekke ziyaret turu. Uçak bileti dahil değildir.` },
    { q: "Fiyata ek bir ücret çıkar mı?", a: "Hayır. Sayfadaki fiyat kişi başı son fiyattır ve ödeme yönteminden bağımsız olarak aynıdır. Uçak bileti dahil değildir." },
    { q: "Fiyat neden kişi sayısına göre değişiyor?", a: "Oda ve araç fiyatı kişi sayısından bağımsızdır; aynı odada ve aynı araçta kalan kişi sayısı arttıkça kişi başına düşen pay azalır. Fiyatlar 2, 3 ya da 4 kişinin aynı odada kalmasına göredir." },
    { q: "Fiyatlar hangi para birimiyle?", a: "Fiyatlar ABD doları üzerindendir." },
    { q: "Uçak bileti dahil mi?", a: "Uçak bileti pakete dahil değildir. Vize başvurusu için gidiş-dönüş biletiniz gerekir; biletinizi aldıktan sonra bize iletmeniz yeterli." },
    { q: "Nasıl rezervasyon yapılır?", a: "Gece ve kişi sayısını seçip \"Bu fiyatla teklif al\" düğmesine dokunun; seçiminiz WhatsApp mesajına eklenir. Tarihinize göre müsaitliği ve kesin fiyatı yazılı olarak iletiriz." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    description: pkg.description,
    image: galeri[0] ? [`${SITE_URL}${galeri[0].src}`] : [],
    brand: { "@type": "Brand", name: "Hadi Umreye Gidelim" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: String(enDusuk.kisiBasiUsd),
      highPrice: String(Math.max(...tablo.map((t) => t.kisiBasiUsd))),
      offerCount: String(tablo.length),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/paketler/${pkg.slug}`,
    },
  };

  return (
    <main id="main-content" className={`home-v2 ${cairo.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, faqJsonLd(sss)]) }} />

      {/* ─── Üst: vitrin ─── */}
      <section className="bg-deep on-dark relative overflow-hidden pt-24 text-white md:pt-32">
        <span aria-hidden className="hat pointer-events-none absolute -right-6 bottom-0 select-none text-[9rem] leading-none text-white/[0.05] md:text-[14rem]">عمرة</span>
        <div className="relative mx-auto grid max-w-screen-xl gap-8 px-4 pb-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:pb-16">
          <div>
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/90">
              <Breadcrumb items={[{ label: "Anasayfa", href: "/" }, { label: "Paketler", href: "/paketler" }, { label: otelAdi }]} />
            </div>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--h-sand)]">Mekke umre paketi · Vize dahil</p>
            <h1 className="mt-2 font-headline text-[34px] font-bold leading-[1.08] md:text-[52px]">
              <Accent text={`Vize, otel ve transfer *tek fiyatta*`} />
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/80 md:text-[17px]">
              {konaklama}, havalimanında karşılama, özel araçla transferler ve Mekke ziyaret turu. 4, 6, 8 ya da 9 gece; 2, 3 ya da 4 kişi.
            </p>
            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <p className="text-[12px] text-white/70">Kişi başı, {vitrin.kisi} kişi · {vitrin.gece} gece</p>
                <p className="font-headline text-[42px] font-bold leading-none text-white md:text-[52px]">{usd(vitrin.kisiBasiUsd)}<span className="text-[18px] font-semibold text-white/70">&apos;dan</span></p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#fiyat" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[var(--h-sand)] px-6 text-[15px] font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                Fiyatınızı hesaplayın <Arrow />
              </a>
              <a href={waGenel} target="_blank" rel="noopener" className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-white/30 px-5 text-[15px] font-semibold text-white transition hover:bg-white/10">
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp&apos;tan sorun
              </a>
            </div>
          </div>
          {galeri[0] && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              <Image src={galeri[0].src} alt={galeri[0].alt} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
              <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-[12px] font-bold text-primary">{otelAdi}</span>
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
        <p className="mt-3 text-[13px] text-on-surface-variant">Dahil değil: uçak bileti{cfg.yemek ? "" : ", yemekler"}, Medine ziyareti ve kişisel harcamalar.</p>
      </section>

      {/* ─── Fiyat hesaplayıcı ─── */}
      <section id="fiyat" className="scroll-mt-20 bg-warm mt-10 py-10 md:mt-14 md:py-16">
        <div className="mx-auto grid max-w-screen-xl gap-8 px-4 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-primary/70">Fiyat hesaplayıcı</p>
            <h2 className="mt-1 font-headline text-[26px] font-bold leading-tight text-primary md:text-[34px]"><Accent text="Gecenizi ve kişi sayınızı *seçin*" /></h2>
            <p className="mt-3 text-[15px] leading-relaxed text-on-surface-variant">
              Oda ve araç bütün grubun; kişi sayısı arttıkça kişi başı fiyat düşer. En uygun seçenek {enDusuk.kisi} kişi, {enDusuk.gece} gece: kişi başı {usd(enDusuk.kisiBasiUsd)}.
            </p>
            <ul className="mt-5 hidden space-y-2 text-[14px] text-on-surface md:block">
              <li>✓ Vize, otel ve transfer dahil</li>
              <li>✓ Kişi başı son fiyat</li>
              <li>✓ Seçiminiz WhatsApp mesajına hazır eklenir</li>
            </ul>
          </div>
          <NetFiyatHesaplayici tablo={tablo} geceler={cfg.geceler} kisiler={cfg.kisiler} vitrin={cfg.vitrin} baslik={pkg.title} otelAdi={otelAdi} whatsapp={whatsapp} />
        </div>
      </section>

      {/* ─── Otel ─── */}
      <section className="mx-auto max-w-screen-xl px-4 py-10 md:px-8 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-primary/70">Konaklama</p>
            <h2 className="mt-1 font-headline text-[24px] font-bold text-primary md:text-[30px]">{otelAdi}</h2>
          </div>
          <Link href={`/oteller/${cfg.hotelSlug}`} className="shrink-0 pb-1 text-[13px] font-semibold text-primary">Otel sayfası →</Link>
        </div>
        {otel?.description && <p className="mt-2 text-[15px] text-on-surface-variant">{otel.description}</p>}
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
              ["Seçin", "Gece ve kişi sayısını seçip fiyatı görün."],
              ["Yazın", "Seçiminiz WhatsApp mesajına eklenir; tarihinizi yazın."],
              ["Onaylayın", "Müsaitliği ve kesin fiyatı yazılı iletiriz; ödemeyle rezervasyon kesinleşir."],
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
        <p className="mt-6 text-center text-[12px] text-on-surface-variant">Fiyatlar {ay} için geçerlidir; oda sınırlıdır.</p>
      </section>

      <MobileActionBar
        etiket={`Kişi başı · ${enDusuk.kisi} kişi`}
        fiyat={`${usd(enDusuk.kisiBasiUsd)}'dan`}
        alt="Vize, otel, transfer dahil"
        dugme="Fiyatı hesapla"
        href="#fiyat"
        whatsapp={waGenel}
      />
    </main>
  );
}
