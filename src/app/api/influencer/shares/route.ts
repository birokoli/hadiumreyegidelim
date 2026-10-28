import { NextRequest, NextResponse } from 'next/server';
import { bildirArkada } from "@/lib/mobil/bildir";
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { paylasimEkleri, paylasimKampanyaYaz } from '@/lib/marketing/paylasim';

export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const [shares, katilimlar] = await Promise.all([
    prisma.share.findMany({ where: { influencerId: session.id }, orderBy: { createdAt: 'desc' } }),
    prisma.campaignParticipant.findMany({ where: { influencerId: session.id }, include: { campaign: { select: { id: true, title: true, status: true } } } }),
  ]);
  // 27 Ekim: paylaşımın bağlı olduğu kampanya ve admin geri bildirimi (ek sütunlar)
  const ekler = await paylasimEkleri(shares.map((s) => s.id)).catch(() => ({} as Awaited<ReturnType<typeof paylasimEkleri>>));
  const adlar = new Map(katilimlar.map((k) => [k.campaign.id, k.campaign.title]));

  return NextResponse.json({
    shares: shares.map((s) => ({ ...s, campaignId: ekler[s.id]?.campaignId ?? null, campaignTitle: adlar.get(ekler[s.id]?.campaignId ?? '') ?? null, adminNote: ekler[s.id]?.adminNote ?? null })),
    kampanyalar: katilimlar.filter((k) => k.campaign.status === 'active').map((k) => ({ id: k.campaign.id, ad: k.campaign.title })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { platform, shareUrl, screenshotUrl, shareDate, description, campaignId } = body;

  if (!platform || !shareDate) {
    return NextResponse.json({ error: 'Platform ve tarih zorunlu.' }, { status: 400 });
  }
  if (shareUrl && !/^https?:\/\//i.test(String(shareUrl))) {
    return NextResponse.json({ error: 'Paylaşım linki https:// ile başlamalı.' }, { status: 400 });
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
  // Yalnızca katıldığı kampanyaya bağlanabilir
  if (campaignId) {
    const katilim = await prisma.campaignParticipant.findFirst({ where: { campaignId: String(campaignId), influencerId: session.id } });
    if (katilim) await paylasimKampanyaYaz(share.id, katilim.campaignId);
  }

  bildirArkada("icerik", { baslik: "Yeni influencer içeriği", govde: `${session.fullName ?? "Influencer"} · ${platform}`, yol: "/influencer/icerikler" });
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
