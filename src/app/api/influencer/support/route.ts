import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyInfluencerToken } from '@/lib/influencer-auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const store = await cookies();
  const token = store.get('influencer_session')?.value;
  if (!token) return null;
  return verifyInfluencerToken(token);
}

async function getOrCreateChat(influencerId: string) {
  let chat = await prisma.supportChat.findUnique({ where: { influencerId } });
  if (!chat) {
    chat = await prisma.supportChat.create({ data: { influencerId } });
  }
  return chat;
}

// GET — mesaj geçmişi
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const chat = await getOrCreateChat(session.id);

  const messages = await prisma.supportMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
  });

  // Influencer okuyunca unread sıfırla
  await prisma.supportChat.update({
    where: { id: chat.id },
    data: { unreadByInfluencer: 0 },
  });

  return NextResponse.json({ chatId: chat.id, messages, status: chat.status });
}

// POST — mesaj gönder
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Mesaj boş olamaz.' }, { status: 400 });

  const chat = await getOrCreateChat(session.id);

  const message = await prisma.supportMessage.create({
    data: { chatId: chat.id, senderType: 'influencer', content: content.trim() },
  });

  await prisma.supportChat.update({
    where: { id: chat.id },
    data: { lastMessageAt: new Date(), unreadByAdmin: { increment: 1 } },
  });

  return NextResponse.json({ message });
}
