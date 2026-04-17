import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'AUTO_BLOG_ENABLED' } });
    // If no DB setting exists, fall back to env var
    const enabled = setting ? setting.value === 'true' : process.env.AUTO_BLOG_ENABLED === 'true';
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { enabled } = await request.json();
    await prisma.setting.upsert({
      where: { key: 'AUTO_BLOG_ENABLED' },
      update: { value: enabled ? 'true' : 'false' },
      create: { key: 'AUTO_BLOG_ENABLED', value: enabled ? 'true' : 'false' },
    });
    return NextResponse.json({ success: true, enabled });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
