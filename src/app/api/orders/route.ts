import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  try {
    const body = await request.json();
    
    const order = await prisma.order.create({
      data: {
        pax: body.pax,
        totalUSD: body.totalUSD,
        status: 'PENDING',
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
