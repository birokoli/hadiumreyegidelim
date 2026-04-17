import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(guides);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, title, price, image, slug, biography, quote, youtubeUrl, expertise, publications, linkedPackages } = body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const guide = await prisma.guide.create({
      data: {
        name,
        title,
        slug: generatedSlug,
        biography,
        quote,
        youtubeUrl,
        expertise,
        publications,
        price: Number(price),
        image: image || null,
        linkedPackages: linkedPackages ? JSON.stringify(linkedPackages) : null,
      }
    });

    return NextResponse.json(guide);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();
    const { name, title, price, image, slug, biography, quote, youtubeUrl, expertise, publications, linkedPackages } = body;

    const guide = await prisma.guide.update({
      where: { id },
      data: {
        name,
        title,
        biography,
        quote,
        youtubeUrl,
        expertise,
        publications,
        price: Number(price),
        image: image || null,
        linkedPackages: linkedPackages !== undefined ? (linkedPackages ? JSON.stringify(linkedPackages) : null) : undefined,
        ...(slug ? { slug } : {}),
      }
    });

    return NextResponse.json(guide);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const guide = await prisma.guide.delete({ where: { id } });
    return NextResponse.json(guide);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}
