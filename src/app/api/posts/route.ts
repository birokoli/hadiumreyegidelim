import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        authorModel: true,
      }
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Posts Fetch Error:", error);
    return NextResponse.json({ error: "Failed", details: error.message || String(error) }, { status: 500 });
  }
}

function buildPostData(body: any) {
  const { authorId, categoryId, ...rest } = body;
  if (rest.slug) rest.slug = rest.slug.replace(/^\/?(blog\/)+/i, "").replace(/^\/+|\/+$/g, "");
  if (rest.scheduledAt === "" || rest.scheduledAt === null) rest.scheduledAt = null;
  else if (rest.scheduledAt) rest.scheduledAt = new Date(rest.scheduledAt);

  return {
    ...rest,
    ...(authorId ? { authorModel: { connect: { id: authorId } } } : { authorModel: undefined }),
    ...(categoryId ? { category: { connect: { id: categoryId } } } : { category: undefined }),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = await prisma.post.create({ data: buildPostData(body) });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error("POST /api/posts Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const body = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { authorId, categoryId, ...rest } = body;
    if (rest.slug) rest.slug = rest.slug.replace(/^\/?(blog\/)+/i, "").replace(/^\/+|\/+$/g, "");
    if (rest.scheduledAt === "" || rest.scheduledAt === null) rest.scheduledAt = null;
    else if (rest.scheduledAt) rest.scheduledAt = new Date(rest.scheduledAt);

    const data: any = {
      ...rest,
      ...(authorId ? { authorModel: { connect: { id: authorId } } } : { authorModel: { disconnect: true } }),
      ...(categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }),
    };

    const post = await prisma.post.update({ where: { id }, data });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error("PUT /api/posts Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
