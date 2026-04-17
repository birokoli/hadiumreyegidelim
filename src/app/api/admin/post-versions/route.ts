import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'true';
}

// GET versions for a post (or a single version by id)
export async function GET(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = request.nextUrl.searchParams.get('postId');
  const id = request.nextUrl.searchParams.get('id');

  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  try {
    if (id) {
      const version = await prisma.postVersion.findUnique({ where: { id } });
      return NextResponse.json(version);
    }
    const versions = await prisma.postVersion.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json(versions);
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// POST save version
export async function POST(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { postId, title, content, description } = await request.json();
    if (!postId || !title || !content) return NextResponse.json({ error: 'postId, title, content required' }, { status: 400 });

    // Get next version number
    const lastVersion = await prisma.postVersion.findFirst({
      where: { postId },
      orderBy: { version: 'desc' },
    });
    const version = (lastVersion?.version ?? 0) + 1;

    const pv = await prisma.postVersion.create({
      data: { postId, title, content, description, version, savedBy: 'Admin' },
    });
    return NextResponse.json(pv);
  } catch {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

// DELETE a version
export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await prisma.postVersion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
