import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import {
  DEFAULT_EYLUL_CAMPAIGN,
  EYLUL_CAMPAIGN_SETTING_KEY,
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

  const setting = await prisma.setting.findUnique({
    where: { key: EYLUL_CAMPAIGN_SETTING_KEY },
  });
  return NextResponse.json(parseEylulCampaign(setting?.value));
}

export async function POST(request: Request) {
  if (!(await canManageCampaign())) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  const body = await request.json();
  const config = parseEylulCampaign(JSON.stringify({ ...DEFAULT_EYLUL_CAMPAIGN, ...body }));

  await prisma.setting.upsert({
    where: { key: EYLUL_CAMPAIGN_SETTING_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: EYLUL_CAMPAIGN_SETTING_KEY, value: JSON.stringify(config) },
  });

  revalidatePath("/eylul-umresi");
  revalidatePath("/");
  return NextResponse.json({ success: true, config });
}
