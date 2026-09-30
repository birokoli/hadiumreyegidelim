import type { Metadata } from "next";
import AdsCampaignLanding from "@/components/features/AdsCampaignLanding";
import { getSiteSettings } from "@/lib/site-settings";
import { EYLUL_CAMPAIGN_SETTING_KEY, parseEylulCampaign } from "@/lib/eylul-campaign";

export const revalidate = 60;

async function getCampaign() {
  const settings = await getSiteSettings();
  return { campaign: parseEylulCampaign(settings[EYLUL_CAMPAIGN_SETTING_KEY]), whatsappNumber: (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "") };
}

export async function generateMetadata(): Promise<Metadata> {
  const { campaign } = await getCampaign();
  return { title: campaign.seoTitle, description: campaign.seoDescription, alternates: { canonical: "/eylul-umresi" } };
}

export default async function Page() {
  const props = await getCampaign();
  return <AdsCampaignLanding {...props} />;
}
