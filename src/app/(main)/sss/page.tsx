import type { Metadata } from "next";
import Link from "next/link";
import HelpLayout from "@/components/help/HelpLayout";
import FaqBrowser from "@/components/help/FaqBrowser";
import { getPageTexts } from "@/lib/page-texts";
import { parseFaq } from "@/lib/page-texts/faq";
import { faqJsonLd } from "@/components/ui/kit";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular: Umre, Vize ve Ödeme",
  description: "Umre planlama, umre vizesi, ödeme, iptal ve rezervasyon süreçleriyle ilgili en çok sorulan soruların cevapları.",
  alternates: { canonical: "/sss" },
};

export default async function FaqPage() {
  const t = await getPageTexts("sss");
  const items = parseFaq(t("items"));
  return (
    <HelpLayout active="/sss" crumb="Sıkça sorulan sorular" kicker={t("kicker")} title={t("title")} lead={t("lead")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items.map((i) => ({ q: i.q, a: i.a })))) }} />
      <FaqBrowser items={items} />
      <p className="text-sm text-on-surface-variant">
        Cevabını bulamadınız mı? <Link href="/iletisim" className="font-semibold text-primary underline">Destek formundan</Link> bize yazın.
      </p>
    </HelpLayout>
  );
}
