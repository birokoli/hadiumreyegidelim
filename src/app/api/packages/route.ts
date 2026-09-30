import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const pkg = await prisma.package.findUnique({ where: { id } });
      return NextResponse.json(pkg);
    }
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pkg = await prisma.package.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        currency: body.currency || "USD",
        duration: body.duration,
        imageUrl: body.imageUrl,
        gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        includes: body.includes ? JSON.stringify(body.includes) : null,
        isPopular: body.isPopular || false,
        published: body.published !== undefined ? body.published : true,
      }
    });
    return NextResponse.json(pkg);
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    const body = await request.json();
    if (!id && body.id) id = body.id;
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        currency: body.currency,
        duration: body.duration,
        imageUrl: body.imageUrl,
        gallery: body.gallery !== undefined ? JSON.stringify(body.gallery) : undefined,
        includes: body.includes !== undefined ? JSON.stringify(body.includes) : undefined,
        isPopular: body.isPopular,
        published: body.published,
      }
    });
    return NextResponse.json(pkg);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
