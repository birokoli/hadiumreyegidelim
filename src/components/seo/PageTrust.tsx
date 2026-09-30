// AI motorları ve Google için güven sinyalleri: görünür güncelleme tarihi ve resmî kaynak.
// Dış link kuralı: yalnızca resmî kurumların bilgi sayfaları, link metni konu kelimesi;
// sattığımız hizmetler (vize, otel, uçuş, paket...) için dış link verilmez.

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** Sayfa içeriği en son bu tarihte gözden geçirildi (içerik değişince güncelle) */
export const CONTENT_REVIEWED = "2026-09-30";

export function formatTrDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function LastUpdated({ date = CONTENT_REVIEWED, className = "" }: { date?: string | Date; className?: string }) {
  const iso = typeof date === "string" ? date : date.toISOString();
  return (
    <p className={`text-xs text-on-surface-variant ${className}`}>
      Son güncelleme: <time dateTime={iso.slice(0, 10)}>{formatTrDate(iso)}</time>
    </p>
  );
}

const SOURCES = {
  ibadet: { href: "https://www.diyanet.gov.tr/", text: "umre ibadetiyle ilgili dinî bilgiler" },
  saglik: { href: "https://www.moh.gov.sa/", text: "Suudi Arabistan'daki sağlık şartları" },
} as const;

/** Tek cümlelik resmî bilgi bağlantısı (konu kelimesine link) */
export function OfficialInfo({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-on-surface-variant ${className}`}>
      Resmî bilgi için:{" "}
      <a href={SOURCES.ibadet.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">{SOURCES.ibadet.text}</a>
      {" "}ve{" "}
      <a href={SOURCES.saglik.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">{SOURCES.saglik.text}</a>.
    </p>
  );
}

/** Sayfa altı: güncelleme tarihi + resmî bilgi (+ JSON-LD dateModified için yardımcı) */
export function PageTrust({ date, className = "" }: { date?: string | Date; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <LastUpdated date={date} />
      <OfficialInfo />
    </div>
  );
}

export function webPageJsonLd(opts: { url: string; name: string; dateModified?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    url: opts.url,
    dateModified: opts.dateModified ?? CONTENT_REVIEWED,
    inLanguage: "tr-TR",
  };
}
