import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';

// Influencer adından kampanya kodu üret: "Yasin" + "Transfer10" → "YasinTransfer10"
function buildCode(fullName: string, template: string): string {
  const firstName = fullName.trim().split(' ')[0];
  // Türkçe karakterleri latin'e çevir
  const clean = firstName
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/[^A-Za-z0-9]/g, '');
  return (clean + template).toUpperCase();
}

// Tüm aktif kampanyaları + influencer'ın katıldıklarını getir
export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const [campaigns, participations] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { participants: true } } },
    }),
    prisma.campaignParticipant.findMany({
      where: { influencerId: session.id },
      include: {
        campaign: true,
        codeUsages: { orderBy: { usedAt: 'desc' } },
      },
    }),
  ]);

  const joinedIds = new Set(participations.map(p => p.campaignId));

  return NextResponse.json({
    available: campaigns.filter(c => !joinedIds.has(c.id)),
    joined: participations,
  });
}

// Kampanyaya katıl
export async function POST(req: NextRequest) {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { campaignId } = await req.json();
  if (!campaignId) return NextResponse.json({ error: 'Kampanya ID gerekli.' }, { status: 400 });

  const [campaign, influencer, existing] = await Promise.all([
    prisma.campaign.findUnique({ where: { id: campaignId } }),
    prisma.influencer.findUnique({ where: { id: session.id } }),
    prisma.campaignParticipant.findFirst({ where: { campaignId, influencerId: session.id } }),
  ]);

  if (!campaign || campaign.status !== 'active') {
    return NextResponse.json({ error: 'Kampanya aktif değil.' }, { status: 400 });
  }
  if (existing) {
    return NextResponse.json({ error: 'Zaten bu kampanyaya katıldınız.' }, { status: 409 });
  }
  if (!influencer) {
    return NextResponse.json({ error: 'Influencer bulunamadı.' }, { status: 404 });
  }

  // Katılımcı sınırı kontrolü
  if (campaign.maxParticipants) {
    const count = await prisma.campaignParticipant.count({ where: { campaignId } });
    if (count >= campaign.maxParticipants) {
      return NextResponse.json({ error: 'Kampanya katılımcı kapasitesi doldu.' }, { status: 400 });
    }
  }

  // Kod oluştur — çakışma olursa sona sayı ekle
  let code = buildCode(influencer.fullName, campaign.codeTemplate);
  let attempt = 0;
  while (await prisma.campaignParticipant.findUnique({ where: { uniqueCode: code } })) {
    attempt++;
    code = buildCode(influencer.fullName, campaign.codeTemplate) + attempt;
  }

  const participant = await prisma.campaignParticipant.create({
    data: { campaignId, influencerId: session.id, uniqueCode: code },
  });

  return NextResponse.json({ success: true, code: participant.uniqueCode });
}
