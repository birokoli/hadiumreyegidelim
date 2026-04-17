import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const leads = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
