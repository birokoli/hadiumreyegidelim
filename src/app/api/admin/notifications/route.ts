import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie || sessionCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadLeads = await prisma.contactRequest.findMany({
      where: { status: 'UNREAD' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const pendingOrders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({ unreadLeads, pendingOrders });
  } catch (error) {
    console.error('Notification Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
