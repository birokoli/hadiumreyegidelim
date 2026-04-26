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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.categoryId === "") body.categoryId = null;
    if (body.authorId === "") body.authorId = null;
    // Slug'tan /blog/ /blog gibi yanlış prefix'leri temizle
    if (body.slug) body.slug = body.slug.replace(/^\/?(blog\/)+/i, "").replace(/^\/+|\/+$/g, "");

    const post = await prisma.post.create({ data: body });
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
    
    if (body.categoryId === "") body.categoryId = null;
    if (body.authorId === "") body.authorId = null;
    if (body.slug) body.slug = body.slug.replace(/^\/?(blog\/)+/i, "").replace(/^\/+|\/+$/g, "");

    const post = await prisma.post.update({ where: { id }, data: body });
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
