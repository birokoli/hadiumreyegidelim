import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    return NextResponse.json(authors);
  } catch (error: any) {
    console.error("Authors Fetch Error:", error);
    return NextResponse.json({ error: "Failed", details: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const author = await prisma.author.create({ data: body });
    return NextResponse.json(author);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const body = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    const author = await prisma.author.update({ where: { id }, data: body });
    return NextResponse.json(author);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    // Yazar silinirken mevcut postlardan authorId kaldırılır. Postlar silinmez.
    await prisma.post.updateMany({
       where: { authorId: id },
       data: { authorId: null }
    });

    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
