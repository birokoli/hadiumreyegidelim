import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';

export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const shares = await prisma.share.findMany({
    where: { influencerId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ shares });
}

export async function POST(req: NextRequest) {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { platform, shareUrl, screenshotUrl, shareDate, description } = body;

  if (!platform || !shareDate) {
    return NextResponse.json({ error: 'Platform ve tarih zorunlu.' }, { status: 400 });
  }

  const share = await prisma.share.create({
    data: {
      influencerId: session.id,
      platform,
      shareUrl: shareUrl || null,
      screenshotUrl: screenshotUrl || null,
      shareDate,
      description: description || null,
      status: 'pending',
    },
  });

  return NextResponse.json({ success: true, share });
}

export async function DELETE(req: NextRequest) {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });

  const share = await prisma.share.findUnique({ where: { id } });
  if (!share || share.influencerId !== session.id) {
    return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });
  }
  if (share.status !== 'pending') {
    return NextResponse.json({ error: 'Onaylanmış paylaşımlar silinemez.' }, { status: 400 });
  }

  await prisma.share.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
