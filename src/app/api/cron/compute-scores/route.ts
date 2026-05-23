import { NextRequest, NextResponse } from 'next/server';
import { computeAndStorePeriod, previousPeriod } from '@/lib/affiliate';

export async function GET(req: NextRequest) {
  // Vercel cron auth
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow Vercel's internal cron (no auth needed in prod, but header check is good practice)
    const cronHeader = req.headers.get('x-vercel-cron');
    if (!cronHeader) {
      return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    }
  }

  const period = previousPeriod();

  try {
    const results = await computeAndStorePeriod(period);
    return NextResponse.json({ success: true, period, count: results.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hata oluştu.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
