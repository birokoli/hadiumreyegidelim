import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.aILog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Failed to fetch AI Logs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
