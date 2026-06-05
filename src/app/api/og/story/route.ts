// /api/og/story?campaign={slug}&ref={code}
// 1080x1920 PNG story goruntusu uretir
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StoryImage } from './StoryImage';

export const runtime = 'nodejs';

const W = 1080;
const H = 1920;

// Google Fonts CSS API'den woff2 URL'lerini cek, fallback URL listesi de var
async function loadInterFont(weight: 400 | 700 | 900): Promise<ArrayBuffer | null> {
  // Google Fonts CSS2 API — guncel URL'yi dinamik alir
  const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  try {
    const cssRes = await fetch(cssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
    });
    if (cssRes.ok) {
      const css = await cssRes.text();
      const match = css.match(/src: url\(([^)]+\.woff2)\)/);
      if (match) {
        const fontRes = await fetch(match[1]);
        if (fontRes.ok) return fontRes.arrayBuffer();
      }
    }
  } catch { /* fallback'e gec */ }

  // Fallback: Bunny Fonts (Google Fonts mirror)
  const bunnyUrls: Record<number, string> = {
    400: 'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2',
    700: 'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2',
    900: 'https://fonts.bunny.net/inter/files/inter-latin-900-normal.woff2',
  };
  try {
    const res = await fetch(bunnyUrls[weight]);
    if (res.ok) return res.arrayBuffer();
  } catch { /* null don */ }

  return null;
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

  // Fontlari paralel yukle, null gelenleri filtrele
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
}
