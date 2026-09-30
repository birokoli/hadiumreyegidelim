import type { Metadata } from "next";
import AdsCampaignLanding from "@/components/features/AdsCampaignLanding";
import { getSiteSettings } from "@/lib/site-settings";
import { DEFAULT_ILK_UMREM_CAMPAIGN, ILK_UMREM_CAMPAIGN_SETTING_KEY, parseEylulCampaign } from "@/lib/eylul-campaign";
import { metaDescription, pageTitle } from "@/lib/seo/meta";

export const revalidate = 60;
async function getCampaign() {
  const settings = await getSiteSettings();
  return { campaign: parseEylulCampaign(settings[ILK_UMREM_CAMPAIGN_SETTING_KEY], DEFAULT_ILK_UMREM_CAMPAIGN), whatsappNumber: (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "") };
}
export async function generateMetadata(): Promise<Metadata> { const { campaign } = await getCampaign(); return { title: pageTitle(campaign.seoTitle), description: metaDescription(campaign.seoDescription), alternates: { canonical: "/ilk-umrem" } }; }
export default async function Page() { return <AdsCampaignLanding {...await getCampaign()} />; }
