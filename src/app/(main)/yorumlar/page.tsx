import type { Metadata } from "next";
import { getApprovedReviews } from "@/lib/reviews";
import { getPageTexts } from "@/lib/page-texts";
import { EmptyState, PageHero, Section } from "@/components/ui/kit";
import ReviewCard from "@/components/reviews/ReviewCard";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Umre Yorumları: Bizimle Gidenler Anlatıyor",
  description: "Umresini Hadi Umreye Gidelim ile planlayan misafirlerimizin yorumları: otel, transfer, vize süreci ve ekibimiz hakkında gerçek deneyimler.",
  alternates: { canonical: "/yorumlar" },
};

export default async function ReviewsPage() {
  const [t, reviews] = await Promise.all([getPageTexts("yorumlar"), getApprovedReviews()]);
  return (
    <main id="main-content">
      <PageHero crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Yorumlar" }]} kicker={t("kicker")} title={t("title")} lead={t("lead")} />
      <Section tone="muted">
        {reviews.length === 0 ? (
          <EmptyState onWhite>Henüz yayımlanmış yorum yok.</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
          </div>
        )}
      </Section>
    </main>
  );
}
