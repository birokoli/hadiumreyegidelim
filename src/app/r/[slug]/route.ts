import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Bot detection: basic heuristics
function isBot(userAgent: string): boolean {
  const bots = ['bot', 'crawl', 'spider', 'slurp', 'facebookexternalhit', 'google', 'bing', 'yahoo', 'baidu', 'curl', 'wget', 'python', 'axios', 'go-http'];
  const ua = userAgent.toLowerCase();
  return bots.some(b => ua.includes(b));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hadiumreyegidelim.com';

  // Influencer bul
  const influencer = await prisma.influencer.findUnique({ where: { uniqueUrl: slug } });

  if (!influencer || influencer.status !== 'active') {
    return NextResponse.redirect(`${baseUrl}/`);
  }

  // UTM params
  const url = new URL(req.url);
  const utmSource  = url.searchParams.get('utm_source') || null;
  const utmContent = url.searchParams.get('utm_content') || null;
  const shareId    = url.searchParams.get('share_id') || null;

  // User agent & IP
  const userAgent = req.headers.get('user-agent') || '';
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const bot = isBot(userAgent);

  // Log click
  if (!bot) {
    await prisma.linkClick.create({
      data: {
        influencerId: influencer.id,
        shareId: shareId || null,
        ipAddress: ip,
        userAgent,
        referrer: req.headers.get('referer') || null,
        utmSource,
        utmContent,
        isBot: false,
      },
    });

    // Cache busting: totalClicks güncelle
    await prisma.influencer.update({
      where: { id: influencer.id },
      data: { totalClicks: { increment: 1 } },
    });

    // Share click count güncelle
    if (shareId) {
      await prisma.share.update({
        where: { id: shareId },
        data: { clickCount: { increment: 1 } },
      }).catch(() => {});
    }
  }

  // Cookie ata (60 gün) ve ana siteye yönlendir
  const destination = `${baseUrl}/?ref=${influencer.uniqueCode}`;
  const response = NextResponse.redirect(destination);

  if (!bot) {
    response.cookies.set('influencer_ref', influencer.uniqueCode, {
      maxAge: 60 * 60 * 24 * 60, // 60 gün
      httpOnly: false, // JS'den de okunabilsin
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}
