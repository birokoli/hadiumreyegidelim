import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimit(ip, 'orders', 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen 10 dakika bekleyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    
    // Check if user is logged in
    let userId = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('b2c_session')?.value;
      if (token) {
        const session = await verifyToken(token);
        if (session && session.id) {
          userId = session.id;
        }
      }
    } catch (e) {
      // Ignore err
    }
    
    const order = await prisma.order.create({
      data: {
        pax: body.pax,
        totalUSD: body.totalUSD,
        status: 'PENDING',
        userId: userId, // Link to B2C user!
        flight: body.flight ? JSON.stringify(body.flight) : null,
        hotel: body.hotel ? JSON.stringify(body.hotel) : null,
        transfer: body.transfer ? JSON.stringify(body.transfer) : null,
        guide: body.guide ? JSON.stringify(body.guide) : null,
        extras: body.extras ? JSON.stringify(body.extras) : null,
        contactInfo: body.contactInfo ? JSON.stringify(body.contactInfo) : null,
      }
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
