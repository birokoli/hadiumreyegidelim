import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { computeAndStorePeriod, previousPeriod } from '@/lib/affiliate';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const period: string = body.period ?? previousPeriod();

  try {
    const results = await computeAndStorePeriod(period);

    // Influencer isimlerini ekle
    const infIds = results.map((r: any) => r.influencerId);
    const influencers = await prisma.influencer.findMany({
      where: { id: { in: infIds } },
      select: { id: true, fullName: true, uniqueCode: true },
    });
    const infMap = new Map(influencers.map(i => [i.id, i]));

    const enriched = results.map((r: any) => ({
      ...r,
      influencer: infMap.get(r.influencerId) ?? null,
    }));

    return NextResponse.json({ success: true, period, count: enriched.length, results: enriched });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hata oluştu.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
