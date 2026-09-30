import type { Metadata } from "next";
import AdsCampaignLanding from "@/components/features/AdsCampaignLanding";
import { getSiteSettings } from "@/lib/site-settings";
import { DEFAULT_HANIM_UMRESI_CAMPAIGN, HANIM_UMRESI_CAMPAIGN_SETTING_KEY, parseEylulCampaign } from "@/lib/eylul-campaign";

export const revalidate = 60;
async function getCampaign() {
  const settings = await getSiteSettings();
  return { campaign: parseEylulCampaign(settings[HANIM_UMRESI_CAMPAIGN_SETTING_KEY], DEFAULT_HANIM_UMRESI_CAMPAIGN), whatsappNumber: (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "") };
}
export async function generateMetadata(): Promise<Metadata> { const { campaign } = await getCampaign(); return { title: campaign.seoTitle, description: campaign.seoDescription, alternates: { canonical: "/hanim-umresi" } }; }
export default async function Page() { return <AdsCampaignLanding {...await getCampaign()} />; }
