// Tasarım kiti: ana sayfanın (2026 yenilemesi) görsel dili. Kurallar: docs/TASARIM-DILI.md
// Yeni ya da dönüştürülen her herkese açık sayfa yalnızca bu parçaları kullanır.
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import BrandImageFallback from "@/components/ui/BrandImageFallback";
import { formatPrice } from "@/lib/format";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ─── Simgeler ─────────────────────────────────────────────────── */

export const Arrow = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.64l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

export const Plus = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

/* ─── Yerleşim ─────────────────────────────────────────────────── */

/** Sayfa genişliği ve yan boşluk (ana sayfa: max-w-screen-xl, px-4 / md:px-8) */
export function Container({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cx(narrow ? "max-w-screen-md" : "max-w-screen-xl", "mx-auto px-4 md:px-8", className)}>{children}</div>;
}

/** Bölüm: tone "plain" (sayfa zemini) | "white" (beyaz bant, ince kenar) | "muted" (açık gri bant) */
export function Section({ children, tone = "plain", className, id }: { children: ReactNode; tone?: "plain" | "white" | "muted"; className?: string; id?: string }) {
  const bg = tone === "white" ? "bg-white border-y border-outline-variant/20" : tone === "muted" ? "bg-surface-container-low" : "";
  return (
    <section id={id} className={cx("w-full", bg)}>
      <Container className={cx("py-12 md:py-16", className)}>{children}</Container>
    </section>
  );
}

/** Küçük büyük harfli üst etiket + başlık + sağda isteğe bağlı bağlantı */
export function SectionHead({ kicker, title, href, linkLabel, as = "h2" }: { kicker?: string; title: ReactNode; href?: string; linkLabel?: string; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        {kicker && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">{kicker}</p>}
        <H className={cx("mt-1.5 font-headline text-primary font-bold", as === "h1" ? "text-3xl md:text-5xl leading-tight" : "text-2xl md:text-3xl")}>{title}</H>
      </div>
      {href && (
        <Link href={href} className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline underline-offset-4">
          {linkLabel} <Arrow />
        </Link>
      )}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Sayfa yolu" className="text-[13px] text-on-surface-variant">
      {items.map((c, i) => (
        <span key={c.label}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {c.href ? <Link href={c.href} className="hover:text-primary">{c.label}</Link> : <span>{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/** İç sayfa başı: sayfa yolu, üst etiket, H1, giriş, isteğe bağlı sağ alan (form, görsel) */
export function PageHero({ crumbs, kicker, title, lead, aside, children }: { crumbs?: Crumb[]; kicker?: string; title: string; lead?: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <section className="w-full pt-28 md:pt-32 pb-10 md:pb-12">
      <Container>
        {crumbs && <Breadcrumb items={crumbs} />}
        <div className={cx("mt-6", !!aside && "grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start")}>
          <div className="min-w-0">
            {kicker && <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">{kicker}</p>}
            <h1 className="mt-2 font-headline text-3xl md:text-5xl font-bold text-primary leading-tight text-balance">{title}</h1>
            {lead && <div className="mt-5 text-lg leading-relaxed text-on-surface max-w-3xl">{lead}</div>}
            {children}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}

/* ─── Kartlar ──────────────────────────────────────────────────── */

const CARD = "group flex flex-col bg-white rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_18px_40px_-20px_rgba(0,25,68,0.4)] transition-shadow";

/** Görselli bağlantı kartı (paket, otel, yazı, hizmet). Görsel yoksa marka yedeği. */
export function MediaCard({
  href, title, description, image, imageAlt, fallbackIcon = "mosque", topLeft, topRight, footer, sizes = "(max-width: 768px) 100vw, 33vw", aspect = "aspect-[16/10]", className,
}: {
  href: string; title: string; description?: string; image?: string | null; imageAlt?: string; fallbackIcon?: string;
  topLeft?: ReactNode; topRight?: ReactNode; footer?: ReactNode; sizes?: string; aspect?: string; className?: string;
}) {
  return (
    <Link href={href} data-reveal className={cx(CARD, className)}>
      <div className={cx("relative bg-surface-container-low overflow-hidden", aspect)}>
        {image ? (
          <Image src={image} alt={imageAlt ?? title} fill sizes={sizes} className="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <BrandImageFallback icon={fallbackIcon} iconSize={3} />
        )}
        {topLeft && <span className="absolute top-3 left-3">{topLeft}</span>}
        {topRight && <span className="absolute top-3 right-3">{topRight}</span>}
      </div>
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <h3 className="font-headline text-lg font-bold text-primary leading-snug line-clamp-2">{title}</h3>
        {description && <p className="mt-1.5 text-[13px] text-on-surface-variant line-clamp-2">{description}</p>}
        {footer && <div className="mt-auto pt-4">{footer}</div>}
      </div>
    </Link>
  );
}

/** Görselsiz kutu (bilgi, özellik, adım) */
export function Panel({ children, className, tone = "white" }: { children: ReactNode; className?: string; tone?: "white" | "muted" | "primary" }) {
  const t = tone === "primary" ? "bg-primary text-white" : tone === "muted" ? "bg-surface-container-low" : "bg-white border border-outline-variant/20";
  return <div className={cx("rounded-2xl p-5 md:p-6", t, className)}>{children}</div>;
}

/* ─── Küçük parçalar ───────────────────────────────────────────── */

/** Konu / filtre bağlantısı (blog kategorileri, hizmet grupları). Seçili olan lacivert. */
export function ChipLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors",
        active ? "bg-primary text-white" : "bg-white text-primary border border-outline-variant/30 hover:border-primary/50",
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "primary" | "gold" }) {
  const t = tone === "primary" ? "bg-primary text-white" : tone === "gold" ? "bg-[#c9a96e] text-[#001944]" : "bg-white/95 text-primary";
  return <span className={cx("inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg", t)}>{children}</span>;
}

/** "Başlangıç 1.250 $" (fiyat 0 ya da yoksa hiçbir şey göstermez; uydurma fiyat yok) */
export function PriceTag({ amount, currency = "USD", label = "Başlangıç", suffix }: { amount?: number | null; currency?: string; label?: string; suffix?: string }) {
  if (!amount || amount <= 0) return null;
  return (
    <p className="text-[12px] text-on-surface-variant">
      {label}
      <span className="block font-headline text-xl font-bold text-primary">
        {formatPrice(amount, currency)}
        {suffix && <span className="ml-1 font-body text-[12px] font-semibold text-on-surface-variant">{suffix}</span>}
      </span>
    </p>
  );
}

/** Kart altı: solda fiyat, sağda "İncele →" */
export function CardFooter({ price, currency, cta = "İncele", suffix }: { price?: number | null; currency?: string; cta?: string; suffix?: string }) {
  return (
    <div className="flex items-end justify-between">
      <PriceTag amount={price} currency={currency} suffix={suffix} />
      <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-primary group-hover:gap-2 transition-all">{cta} <Arrow /></span>
    </div>
  );
}

const BTN = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors active:scale-[0.98]";
const BTN_TONE = {
  primary: "bg-primary text-white hover:bg-[#001944]",
  secondary: "bg-white text-primary border border-outline-variant/40 hover:border-primary/50",
  whatsapp: "bg-[#15803d] text-white hover:bg-[#166534]",
  light: "bg-white text-primary hover:bg-[#c9a96e]",
} as const;

/** Bağlantı düğmesi. Dış adres (http, wa.me) yeni sekmede açılır. */
export function ButtonLink({ href, children, tone = "primary", className }: { href: string; children: ReactNode; tone?: keyof typeof BTN_TONE; className?: string }) {
  const external = /^https?:\/\//.test(href);
  const cls = cx(BTN, BTN_TONE[tone], className);
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}

export function EmptyState({ children, onWhite }: { children: ReactNode; onWhite?: boolean }) {
  return <p className={cx("py-10 text-center text-sm text-on-surface-variant border border-dashed border-outline-variant/40 rounded-2xl", onWhite && "bg-white")}>{children}</p>;
}

/** Numaralı adımlar (yatay, 3'lü) */
export function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="grid sm:grid-cols-3 gap-4">
      {items.map((st, i) => (
        <li key={st.title} className="flex gap-3">
          <span className="w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">{i + 1}</span>
          <span>
            <span className="block font-semibold text-on-surface">{st.title}</span>
            <span className="block text-[13px] text-on-surface-variant mt-0.5">{st.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Açılır SSS. Şema için faqJsonLd(items) aynı diziyle kullanılır (metin birebir aynı olmalı). */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <h3 className="font-semibold text-[15px] md:text-base text-on-surface group-open:text-primary">{item.q}</h3>
            <Plus className="w-5 h-5 text-primary shrink-0 transition-transform group-open:rotate-45" />
          </summary>
          <p className="pb-4 -mt-1 text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** Blog yazısı kartı: mobilde yatay (küçük görsel solda), geniş ekranda dikey */
export function PostCard({ href, title, description, image, date, author }: { href: string; title: string; description?: string | null; image?: string | null; date: Date | string; author?: string | null }) {
  return (
    <Link href={href} data-reveal className="group flex gap-4 sm:flex-col bg-white rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_18px_40px_-20px_rgba(0,25,68,0.35)] transition-shadow p-3 sm:p-0">
      <div className="relative w-24 h-24 sm:w-auto sm:h-auto sm:aspect-[16/9] shrink-0 rounded-xl sm:rounded-none overflow-hidden bg-surface-container-low">
        {image ? (
          <Image src={image} alt={title} fill sizes="(max-width: 640px) 96px, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <BrandImageFallback icon="menu_book" iconSize={2} />
        )}
      </div>
      <div className="min-w-0 sm:p-5 flex flex-col">
        <p className="text-[12px] text-on-surface-variant">
          {new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          {author ? ` · ${author}` : ""}
        </p>
        <h3 className="mt-1 font-headline text-base md:text-lg font-bold text-primary leading-snug line-clamp-2 group-hover:underline underline-offset-4">{title}</h3>
        {description && <p className="hidden sm:block mt-1.5 text-[13px] text-on-surface-variant line-clamp-2">{description}</p>}
      </div>
    </Link>
  );
}
