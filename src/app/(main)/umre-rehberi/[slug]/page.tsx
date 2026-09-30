import { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPageView from "@/components/content/ContentPageView";
import { CONTENT_PAGES, contentPath, getContentPage } from "@/content/pages";
import { pageTitles } from "@/content/pages/titles";
import { DEFAULT_OG_IMAGE, pageTitle } from "@/lib/seo/meta";
import { getSiteSettings } from "@/lib/site-settings";

type Props = { params: Promise<{ slug: string }> };

const GUIDE_GROUPS = new Set(["sozluk", "karsilastirma"]);

export function generateStaticParams() {
  return CONTENT_PAGES.filter((p) => GUIDE_GROUPS.has(p.group)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getContentPage(slug);
  if (!page || !GUIDE_GROUPS.has(page.group)) return {};
  return {
    title: pageTitle(page.title),
    description: page.description,
    alternates: { canonical: `https://hadiumreyegidelim.com${contentPath(page)}` },
    openGraph: { title: page.title, description: page.description, type: "article", images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const page = getContentPage(slug);
  if (!page || !GUIDE_GROUPS.has(page.group)) notFound();
  const whatsappNumber = ((await getSiteSettings()).WHATSAPP_NUMBER || "905404010038").replace("+", "");
  return <ContentPageView page={page} whatsappNumber={whatsappNumber} relatedTitles={pageTitles()} />;
}
