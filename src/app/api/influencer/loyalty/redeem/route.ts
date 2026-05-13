import { NextRequest, NextResponse } from 'next/server';
import { verifyInfluencerToken } from '@/lib/influencer-auth';
import { requestRedemption } from '@/lib/loyalty';
import { cookies } from 'next/headers';

async function getSession() {
  const store = await cookies();
  const token = store.get('influencer_session')?.value;
  if (!token) return null;
  return verifyInfluencerToken(token);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { redemptionType, pointsUsed, ...rest } = body;

  if (!redemptionType || !pointsUsed) {
    return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });
  }

  try {
    const redemption = await requestRedemption({
      influencerId: session.id,
      redemptionType,
      pointsUsed,
      ...rest,
    });
    return NextResponse.json({ success: true, redemption });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
