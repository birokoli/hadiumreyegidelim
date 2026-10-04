import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getByToken } from "@/lib/reviews";
import { PageHero, Section } from "@/components/ui/kit";
import ReviewForm from "@/components/reviews/ReviewForm";

export const dynamic = "force-dynamic";
// Kişiye özel bağlantı: arama motorlarına kapalı
export const metadata: Metadata = { title: "Umre yorumunuz", robots: { index: false, follow: false } };

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await getByToken(token).catch(() => null);
  if (!r) notFound();
  return (
    <main id="main-content">
      <PageHero kicker="Yorumunuz" title={`${r.customerName.split(" ")[0]}, umreniz nasıl geçti?`} lead="Deneyiminizi paylaşmanız, umreye gitmeyi düşünenlere yol gösterir. Yorumunuz onaydan sonra sitemizde adınızın kısaltmasıyla yayımlanır." />
      <Section tone="muted">
        <div className="mx-auto max-w-xl">
          {r.status !== "invited" ? (
            <div className="rounded-2xl border border-outline-variant/20 bg-white p-6 text-center">
              <p className="font-headline text-xl font-bold text-primary">Yorumunuz bize ulaştı</p>
              <p className="mt-2 text-on-surface-variant">Teşekkür ederiz. Kabul olsun.</p>
            </div>
          ) : (
            <ReviewForm token={token} defaultName={r.displayName ?? ""} />
          )}
        </div>
      </Section>
    </main>
  );
}
