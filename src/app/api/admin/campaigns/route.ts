import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await getAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { participants: true, codeUsages: true } } },
    });
    return NextResponse.json({ campaigns });
  } catch (e: any) {
    return NextResponse.json({ error: 'DB hatası: ' + e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await getAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const {
    title, description, type, discountType, discountValue, codeTemplate,
    startDate, endDate, maxParticipants, imageUrl,
    storyEyebrow, storyTitle, storySub, storyFeats, commissionPct,
  } = body;

  if (!title || !type || !discountValue || !codeTemplate) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 });
  }

  const slug = codeTemplate.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

  try {
    const campaign = await prisma.campaign.create({
      data: {
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        type,
        discountType: discountType || 'percent',
        discountValue: parseFloat(discountValue),
        codeTemplate: codeTemplate.toUpperCase().replace(/\s/g, ''),
        status: 'active',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        imageUrl: imageUrl || null,
        storyEyebrow: storyEyebrow?.trim() || null,
        storyTitle:   storyTitle?.trim()   || null,
        storySub:     storySub?.trim()     || null,
        storyFeats:   storyFeats ? JSON.stringify(storyFeats) : null,
        commissionPct: commissionPct ? parseFloat(commissionPct) : null,
      },
    });
    return NextResponse.json({ success: true, campaign });
  } catch (e: any) {
    return NextResponse.json({ error: 'DB hatası: ' + e.message }, { status: 500 });
  }
}
