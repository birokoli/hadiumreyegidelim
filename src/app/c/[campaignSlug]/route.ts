// ─────────────────────────────────────────────────────────────────────────────
// /c/[campaignSlug]?ref={code}
// Kampanya takip linki: click logla → cookie ata → kampanya sayfasına yönlendir
// KVKK: sadece gerekli veri (IP, UA, ref kodu, kampanya slug) loglanır.
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isBot(userAgent: string): boolean {
  const bots = ['bot', 'crawl', 'spider', 'facebookexternalhit', 'google', 'bing', 'curl', 'wget', 'python', 'axios'];
  const ua = userAgent.toLowerCase();
  return bots.some(b => ua.includes(b));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignSlug: string }> }
) {
  const { campaignSlug } = await params;
  const { searchParams } = new URL(req.url);
  const refCode = searchParams.get('ref') ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hadiumreyegidelim.com';

  // Kampanya ve katılımcıyı bul
  const [campaign, participant] = await Promise.all([
    prisma.campaign.findUnique({ where: { slug: campaignSlug } }),
    refCode
      ? prisma.campaignParticipant.findUnique({ where: { uniqueCode: refCode } })
      : Promise.resolve(null),
  ]);

  // Hedef URL — kampanya yoksa ana sayfa
  const destination = campaign
    ? `${baseUrl}/${campaignSlug}`
    : `${baseUrl}/`;

  const userAgent = req.headers.get('user-agent') || '';
  const bot = isBot(userAgent);

  // Click logla (sadece gerçek kullanıcılar, KVKK minimumu)
  if (!bot && participant) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    await prisma.linkClick.create({
      data: {
        influencerId: participant.influencerId,
        ipAddress:    ip,
        userAgent:    userAgent.slice(0, 200),
        referrer:     req.headers.get('referer') ?? null,
        utmSource:    'campaign',
        utmContent:   campaignSlug,
        isBot:        false,
      },
    }).catch(() => {}); // log hatası yönlendirmeyi engellemesin
  }

  // Attribution cookie + redirect
  const response = NextResponse.redirect(destination, { status: 302 });

  if (!bot && refCode) {
    response.cookies.set('campaign_ref', refCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
    response.cookies.set('influencer_ref', refCode, {
      maxAge: 60 * 60 * 24 * 60, // 60 gün (mevcut attribution sistemiyle uyum)
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}
