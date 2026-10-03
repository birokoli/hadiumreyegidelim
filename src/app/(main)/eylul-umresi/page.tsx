import type { Metadata } from "next";
import AdsCampaignLanding from "@/components/features/AdsCampaignLanding";
import { getSiteSettings } from "@/lib/site-settings";
import { EYLUL_CAMPAIGN_SETTING_KEY, parseEylulCampaign, istanbulToday } from "@/lib/eylul-campaign";
import { metaDescription, pageTitle } from "@/lib/seo/meta";
import { Container, Panel, ButtonLink } from "@/components/ui/kit";

export const revalidate = 60;

async function getCampaign() {
  const settings = await getSiteSettings();
  return { campaign: parseEylulCampaign(settings[EYLUL_CAMPAIGN_SETTING_KEY]), whatsappNumber: (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "") };
}

export async function generateMetadata(): Promise<Metadata> {
  const { campaign } = await getCampaign();
  return { title: pageTitle(campaign.seoTitle), description: metaDescription(campaign.seoDescription), alternates: { canonical: "/eylul-umresi" }, openGraph: { images: ["/images/hero-kabe.jpg"] } };
}

export default async function Page() {
  const props = await getCampaign();
  const today = istanbulToday();
  const isCompleted = Boolean(props.campaign.homeVisibleUntil && today > props.campaign.homeVisibleUntil);

  return (
    <>
      {isCompleted && (
        <div className="w-full pt-28 md:pt-32 pb-4 bg-surface">
          <Container>
            <Panel tone="muted" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 border border-outline-variant/30">
              <div>
                <p className="font-headline font-bold text-primary text-base">Bu program tamamlandı.</p>
                <p className="text-xs md:text-sm text-on-surface-variant mt-1">
                  Önümüzdeki tarihler için bireysel umrenizi planlayabilir ya da bize yazabilirsiniz.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <ButtonLink href="/bireysel-umre">Umremi planla</ButtonLink>
                <ButtonLink tone="secondary" href="/ekim-umresi">Ekim umresi</ButtonLink>
              </div>
            </Panel>
          </Container>
        </div>
      )}
      <AdsCampaignLanding {...props} />
    </>
  );
}
