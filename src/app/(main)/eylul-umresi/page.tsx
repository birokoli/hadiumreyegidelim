import type { Metadata } from "next";
import AdsCampaignLanding from "@/components/features/AdsCampaignLanding";
import { prisma } from "@/lib/prisma";
import { EYLUL_CAMPAIGN_SETTING_KEY, parseEylulCampaign } from "@/lib/eylul-campaign";

export const revalidate = 60;

async function getCampaign() {
  const [campaignSetting, whatsappSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: EYLUL_CAMPAIGN_SETTING_KEY } }),
    prisma.setting.findUnique({ where: { key: "WHATSAPP_NUMBER" } }),
  ]);
  return { campaign: parseEylulCampaign(campaignSetting?.value), whatsappNumber: (whatsappSetting?.value || "905404010038").replace("+", "") };
}

export async function generateMetadata(): Promise<Metadata> {
  const { campaign } = await getCampaign();
  return { title: campaign.seoTitle, description: campaign.seoDescription, alternates: { canonical: "/eylul-umresi" } };
}

export default async function Page() {
  const props = await getCampaign();
  return <AdsCampaignLanding {...props} />;
}
