import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_session')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await prisma.aILog.updateMany({
    where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
    data: {
      status: 'FAILED',
      details: 'Manuel sıfırlama — pipeline takılmıştı.',
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, cleared: result.count });
}
