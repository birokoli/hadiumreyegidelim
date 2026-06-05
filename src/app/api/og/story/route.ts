// /api/og/story?campaign={slug}&ref={code}
// 1080x1920 PNG story goruntusu uretir
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StoryImage } from './StoryImage';

export const runtime = 'nodejs';

const W = 1080;
const H = 1920;

async function loadFont(weight: 400 | 700 | 900): Promise<ArrayBuffer> {
  const fontUrls: Record<number, string> = {
    400: 'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff',
    700: 'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5n-wU.woff',
    900: 'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIatJL7W0Q5n-wU.woff',
  };
  const res = await fetch(fontUrls[weight]);
  if (!res.ok) throw new Error(`Font ${weight} yuklenemedi`);
  return res.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignSlug = searchParams.get('campaign') ?? '';
  const refCode      = searchParams.get('ref') ?? '';

  const [campaign, participant] = await Promise.all([
    prisma.campaign.findUnique({ where: { slug: campaignSlug } }),
    refCode
      ? prisma.campaignParticipant.findUnique({
          where: { uniqueCode: refCode },
          include: { influencer: { select: { fullName: true, instagramHandle: true } } },
        })
      : Promise.resolve(null),
  ]);

  if (!campaign) {
    return new Response('Kampanya bulunamadi', { status: 404 });
  }

  const eyebrow      = campaign.storyEyebrow ?? campaign.type.toUpperCase();
  const title        = campaign.storyTitle   ?? campaign.title;
  const sub          = campaign.storySub     ?? campaign.description ?? '';
  const feats: string[] = campaign.storyFeats ? JSON.parse(campaign.storyFeats) : [];
  const discountLabel = campaign.discountType === 'percent'
    ? `%${campaign.discountValue} Indirim`
    : `${campaign.discountValue}TL Indirim`;
  const commLabel    = campaign.commissionPct ? `%${campaign.commissionPct} Komisyon` : null;
  const code         = refCode || 'KODUNUZ';
  const handle       = participant?.influencer?.instagramHandle
    ? `@${participant.influencer.instagramHandle}` : '';
  const trackingUrl  = `hadiumreyegidelim.com/${campaignSlug}?ref=${code}`;

  const [fontRegular, fontBold, fontBlack] = await Promise.all([
    loadFont(400),
    loadFont(700),
    loadFont(900),
  ]);

  return new ImageResponse(
    StoryImage({ eyebrow, title, sub, feats, discountLabel, commLabel, code, handle, trackingUrl }),
    {
      width: W,
      height: H,
      fonts: [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold,    weight: 700, style: 'normal' },
        { name: 'Inter', data: fontBlack,   weight: 900, style: 'normal' },
      ],
    },
  );
}
