import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

// GET — tüm sohbetleri listele
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const chats = await prisma.supportChat.findMany({
    orderBy: { lastMessageAt: 'desc' },
    include: {
      influencer: { select: { id: true, fullName: true, email: true, instagramHandle: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return NextResponse.json({ chats });
}
