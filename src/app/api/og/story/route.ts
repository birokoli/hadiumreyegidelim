// /api/og/story?campaign={slug}&ref={code}
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StoryImage } from './StoryImage';

export const runtime = 'nodejs';

const W = 1080;
const H = 1920;

async function loadInterFont(weight: 400 | 700 | 900): Promise<ArrayBuffer | null> {
  // Bunny Fonts (Google Fonts mirror, no bot detection)
  const urls: Record<number, string> = {
    400: 'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2',
    700: 'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2',
    900: 'https://fonts.bunny.net/inter/files/inter-latin-900-normal.woff2',
  };
  try {
    const res = await fetch(urls[weight], { cache: 'force-cache' });
    if (res.ok) return res.arrayBuffer();
  } catch { /* ignore */ }
  return null;
}

export async function GET(req: NextRequest) {
  try {
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

    const eyebrow       = campaign.storyEyebrow ?? campaign.type.toUpperCase();
    const title         = campaign.storyTitle   ?? campaign.title;
    const sub           = campaign.storySub     ?? campaign.description ?? '';
    const feats: string[] = campaign.storyFeats ? JSON.parse(campaign.storyFeats) : [];
    const discountLabel = campaign.discountType === 'percent'
      ? `%${campaign.discountValue} Indirim`
      : `${campaign.discountValue}TL Indirim`;
    const commLabel     = campaign.commissionPct ? `%${campaign.commissionPct} Komisyon` : null;
    const code          = refCode || 'KODUNUZ';
    const handle        = participant?.influencer?.instagramHandle
      ? `@${participant.influencer.instagramHandle}` : '';
    const trackingUrl   = `hadiumreyegidelim.com/${campaignSlug}?ref=${code}`;

    const [reg, bold, black] = await Promise.all([
      loadInterFont(400),
      loadInterFont(700),
      loadInterFont(900),
    ]);

    const fonts: { name: string; data: ArrayBuffer; weight: number; style: string }[] = [];
    if (reg)   fonts.push({ name: 'Inter', data: reg,   weight: 400, style: 'normal' });
    if (bold)  fonts.push({ name: 'Inter', data: bold,  weight: 700, style: 'normal' });
    if (black) fonts.push({ name: 'Inter', data: black, weight: 900, style: 'normal' });

    return new ImageResponse(
      StoryImage({ eyebrow, title, sub, feats, discountLabel, commLabel, code, handle, trackingUrl }),
      { width: W, height: H, fonts: fonts.length > 0 ? fonts : undefined },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[story]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
