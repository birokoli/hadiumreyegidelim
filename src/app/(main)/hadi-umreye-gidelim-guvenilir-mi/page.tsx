// "Hadi Umreye Gidelim güvenilir mi?" (6 Ekim): marka sorusunun cevabı bizim sayfamızdan gelsin.
// Yalnızca doğrulanabilir bilgi: lisans, açık fiyat, yazılı vize süreci, gerçek yorum sayısı, yapmadıklarımız.
import type { Metadata } from "next";
import Link from "next/link";
import HelpLayout from "@/components/help/HelpLayout";
import ReviewCard from "@/components/reviews/ReviewCard";
import HugIcon from "@/components/icons/HugIcon";
import { faqJsonLd } from "@/components/ui/kit";
import { getPageTexts } from "@/lib/page-texts";
import { parseFaq } from "@/lib/page-texts/faq";
import { getApprovedReviews } from "@/lib/reviews";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Hadi Umreye Gidelim Güvenilir mi?",
  description: "Hadi Umreye Gidelim kimdir, fiyatlar ve ödeme nasıl işler, vize süreci, misafir yorumları ve yapmadıklarımız: güvenle karar vermeniz için açık bilgiler.",
  alternates: { canonical: "/hadi-umreye-gidelim-guvenilir-mi" },
};

export default async function TrustPage() {
  const [t, reviews] = await Promise.all([getPageTexts("guvenilir"), getApprovedReviews()]);
  const items = parseFaq(t("items"));
  const rated = reviews.filter((r) => r.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : null;

  return (
    <HelpLayout active="/hadi-umreye-gidelim-guvenilir-mi" crumb="Güvenilir mi?" kicker="Hakkımızda" title={t("title")} lead={t("lead")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items.map((i) => ({ q: i.q, a: i.a })))) }} />

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "guven" as const, k: "Lisans", v: "DTCM 1203162", s: "MBD Tourism L.L.C." },
          { icon: "yorum" as const, k: "Misafir yorumu", v: reviews.length ? `${reviews.length} yorum` : "Yeni", s: avg ? `Ortalama ${avg.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} / 5` : "Doğrulanmış müşterilerden" },
          { icon: "vize" as const, k: "Umre vizesi", v: "2 saatte", s: "Kişi başı 140 USD" },
        ].map((c) => (
          <div key={c.k} className="rounded-2xl border border-outline-variant/20 bg-white p-5">
            <HugIcon name={c.icon} size={28} className="text-primary" />
            <p className="mt-3 text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">{c.k}</p>
            <p className="font-headline text-xl font-bold text-primary">{c.v}</p>
            <p className="text-sm text-on-surface-variant">{c.s}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
        {items.map((i) => (
          <div key={i.q} className="border-b border-outline-variant/15 pb-5 last:border-0 last:pb-0">
            <h2 className="font-headline text-xl font-bold text-primary">{i.q}</h2>
            <p className="mt-2 leading-relaxed text-on-surface-variant">{i.a}</p>
          </div>
        ))}
      </section>

      {reviews.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-headline text-2xl font-bold text-primary">Misafirlerimiz ne diyor?</h2>
            <Link href="/yorumlar" className="text-sm font-semibold text-primary underline">Tüm yorumlar</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => <ReviewCard key={r.id} r={r} clamp />)}
          </div>
        </section>
      )}

      <p className="text-sm text-on-surface-variant">
        Başka bir sorunuz mu var? <Link href="/sss" className="font-semibold text-primary underline">Sık sorulan sorulara</Link> bakın ya da <Link href="/iletisim" className="font-semibold text-primary underline">bize yazın</Link>.
      </p>
    </HelpLayout>
  );
}
