import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import {
  DEFAULT_EYLUL_CAMPAIGN,
  DEFAULT_ILK_UMREM_CAMPAIGN,
  DEFAULT_HANIM_UMRESI_CAMPAIGN,
  EYLUL_CAMPAIGN_SETTING_KEY,
  ILK_UMREM_CAMPAIGN_SETTING_KEY,
  HANIM_UMRESI_CAMPAIGN_SETTING_KEY,
  parseEylulCampaign,
} from "@/lib/eylul-campaign";

async function canManageCampaign() {
  const session = await getAdminSession();
  return Boolean(
    session &&
      (session.legacy || session.role === "super_admin" || session.permissions.includes("marketing"))
  );
}

export async function GET() {
  if (!(await canManageCampaign())) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  const rows = await prisma.setting.findMany({ where: { key: { in: [EYLUL_CAMPAIGN_SETTING_KEY, ILK_UMREM_CAMPAIGN_SETTING_KEY, HANIM_UMRESI_CAMPAIGN_SETTING_KEY] } } });
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return NextResponse.json({
    ad1: parseEylulCampaign(settings[EYLUL_CAMPAIGN_SETTING_KEY], DEFAULT_EYLUL_CAMPAIGN),
    ad2: parseEylulCampaign(settings[ILK_UMREM_CAMPAIGN_SETTING_KEY], DEFAULT_ILK_UMREM_CAMPAIGN),
    ad3: parseEylulCampaign(settings[HANIM_UMRESI_CAMPAIGN_SETTING_KEY], DEFAULT_HANIM_UMRESI_CAMPAIGN),
  });
}

export async function POST(request: Request) {
  if (!(await canManageCampaign())) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  const body = await request.json();
  const configs = {
    ad1: parseEylulCampaign(JSON.stringify(body.ad1), DEFAULT_EYLUL_CAMPAIGN),
    ad2: parseEylulCampaign(JSON.stringify(body.ad2), DEFAULT_ILK_UMREM_CAMPAIGN),
    ad3: parseEylulCampaign(JSON.stringify(body.ad3), DEFAULT_HANIM_UMRESI_CAMPAIGN),
  };
  await prisma.$transaction([
    prisma.setting.upsert({ where: { key: EYLUL_CAMPAIGN_SETTING_KEY }, update: { value: JSON.stringify(configs.ad1) }, create: { key: EYLUL_CAMPAIGN_SETTING_KEY, value: JSON.stringify(configs.ad1) } }),
    prisma.setting.upsert({ where: { key: ILK_UMREM_CAMPAIGN_SETTING_KEY }, update: { value: JSON.stringify(configs.ad2) }, create: { key: ILK_UMREM_CAMPAIGN_SETTING_KEY, value: JSON.stringify(configs.ad2) } }),
    prisma.setting.upsert({ where: { key: HANIM_UMRESI_CAMPAIGN_SETTING_KEY }, update: { value: JSON.stringify(configs.ad3) }, create: { key: HANIM_UMRESI_CAMPAIGN_SETTING_KEY, value: JSON.stringify(configs.ad3) } }),
  ]);

  revalidatePath("/eylul-umresi");
  revalidatePath("/ilk-umrem");
  revalidatePath("/hanim-umresi");
  revalidatePath("/");
  return NextResponse.json({ success: true, configs });
}
