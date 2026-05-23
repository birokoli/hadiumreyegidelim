import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { registerInvite } from '@/lib/affiliate';

export async function POST(req: NextRequest) {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { referralCode } = body;

  if (!referralCode) {
    return NextResponse.json({ error: 'referralCode zorunludur.' }, { status: 400 });
  }

  // referralCode = uniqueCode of the person who invited them
  const referrer = await prisma.influencer.findUnique({
    where: { uniqueCode: referralCode },
    select: { id: true, fullName: true },
  });

  if (!referrer) {
    return NextResponse.json({ error: 'Geçersiz davet kodu.' }, { status: 404 });
  }

  if (referrer.id === session.id) {
    return NextResponse.json({ error: 'Kendinizi davet edemezsiniz.' }, { status: 400 });
  }

  try {
    const referralId = await registerInvite(referrer.id, session.id);
    return NextResponse.json({ success: true, referralId, referrerName: referrer.fullName });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hata oluştu.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
