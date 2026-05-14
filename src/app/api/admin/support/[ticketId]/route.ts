import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

// GET — mesajları getir
export async function GET(_: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { ticketId } = await params;

  const chat = await prisma.supportChat.findUnique({
    where: { id: ticketId },
    include: {
      influencer: { select: { id: true, fullName: true, email: true, instagramHandle: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!chat) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });

  // Admin okuyunca unread sıfırla
  await prisma.supportChat.update({
    where: { id: ticketId },
    data: { unreadByAdmin: 0 },
  });

  return NextResponse.json({ chat });
}

// POST — admin yanıt yazar
export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { ticketId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Mesaj boş.' }, { status: 400 });

  const message = await prisma.supportMessage.create({
    data: { chatId: ticketId, senderType: 'admin', content: content.trim() },
  });

  await prisma.supportChat.update({
    where: { id: ticketId },
    data: { lastMessageAt: new Date(), unreadByInfluencer: { increment: 1 } },
  });

  return NextResponse.json({ message });
}

// PATCH — sohbeti kapat / aç
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { ticketId } = await params;
  const { status } = await req.json();

  const chat = await prisma.supportChat.update({
    where: { id: ticketId },
    data: { status },
  });

  return NextResponse.json({ chat });
}
