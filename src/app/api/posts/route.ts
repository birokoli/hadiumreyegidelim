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

// Yalnızca schema'daki bilinen alanları Prisma'ya ilet
function buildScalars(body: any) {
  const slug = (body.slug || "").replace(/^\/?(blog\/)+/i, "").replace(/^\/+|\/+$/g, "");
  const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

  return {
    title:              String(body.title || ""),
    slug:               slug,
    metaTitle:          body.metaTitle   ?? null,
    description:        body.description ?? null,
    content:            body.content     ?? "",
    keywords:           body.keywords    ?? null,
    tags:               body.tags        ?? null,
    focusKeyword:       body.focusKeyword ?? null,
    seoScore:           typeof body.seoScore === 'number' ? body.seoScore : null,
    imageUrl:           body.imageUrl    ?? null,
    imageAlt:           body.imageAlt    ?? null,
    tldr:               body.tldr        ?? null,
    faq:                body.faq         ?? null,
    personalExperience: body.personalExperience ?? null,
    references:         body.references  ?? null,
    published:          Boolean(body.published),
    scheduledAt,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scalars = buildScalars(body);
    const authorId   = body.authorId   || null;
    const categoryId = body.categoryId || null;

    const post = await prisma.post.create({
      data: {
        ...scalars,
        ...(authorId   ? { authorModel: { connect: { id: authorId } } }   : {}),
        ...(categoryId ? { category:    { connect: { id: categoryId } } } : {}),
      },
    });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error("POST /api/posts Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const body = await request.json();
    const scalars = buildScalars(body);
    const authorId   = body.authorId   || null;
    const categoryId = body.categoryId || null;

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...scalars,
        ...(authorId   ? { authorModel: { connect: { id: authorId } } }   : { authorModel: { disconnect: true } }),
        ...(categoryId ? { category:    { connect: { id: categoryId } } } : { category:    { disconnect: true } }),
      },
    });
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
