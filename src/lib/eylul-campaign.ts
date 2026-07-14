export type CampaignPackage = {
  days: string;
  double: string;
  triple: string;
  quad: string;
};

export type EylulCampaignConfig = {
  title: string;
  highlightedTitle: string;
  departureOne: string;
  departureTwo: string;
  startingPrice: string;
  capacity: string;
  hotelDetail: string;
  whatsappMessage: string;
  packages: CampaignPackage[];
  childTwoToEleven: string;
  childZeroToTwo: string;
  includedServices: string[];
};

export const EYLUL_CAMPAIGN_SETTING_KEY = "EYLUL_CAMPAIGN_CONFIG";

export const DEFAULT_EYLUL_CAMPAIGN: EylulCampaignConfig = {
  title: "Eylül",
  highlightedTitle: "Grup Umresi",
  departureOne: "15 Eylül",
  departureTwo: "25 Eylül",
  startingPrice: "$1.250",
  capacity: "35",
  hotelDetail: "Kâbe'ye yürüme mesafesinde",
  whatsappMessage: "Merhaba, 15 veya 25 Eylül çıkışlı grup umresi kampanyası hakkında bilgi almak istiyorum.",
  packages: [
    { days: "10 Günlük Umre", double: "$1.350", triple: "$1.300", quad: "$1.250" },
    { days: "15 Günlük Umre", double: "$1.400", triple: "$1.350", quad: "$1.300" },
    { days: "20 Günlük Umre", double: "$1.500", triple: "$1.450", quad: "$1.400" },
  ],
  childTwoToEleven: "$1.000",
  childZeroToTwo: "$750",
  includedServices: [
    "Gidiş – Dönüş Uçak Bileti",
    "Umre Vizesi",
    "Otel Konaklaması",
    "Tüm Mübarek Yerler Turu",
  ],
};

export function parseEylulCampaign(value?: string | null): EylulCampaignConfig {
  if (!value) return DEFAULT_EYLUL_CAMPAIGN;
  try {
    const parsed = JSON.parse(value) as Partial<EylulCampaignConfig>;
    return {
      ...DEFAULT_EYLUL_CAMPAIGN,
      ...parsed,
      packages: Array.isArray(parsed.packages) && parsed.packages.length
        ? parsed.packages.slice(0, 3).map((item, index) => ({
            ...DEFAULT_EYLUL_CAMPAIGN.packages[index],
            ...item,
          }))
        : DEFAULT_EYLUL_CAMPAIGN.packages,
      includedServices: Array.isArray(parsed.includedServices) && parsed.includedServices.length
        ? parsed.includedServices.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : DEFAULT_EYLUL_CAMPAIGN.includedServices,
    };
  } catch {
    return DEFAULT_EYLUL_CAMPAIGN;
  }
}
