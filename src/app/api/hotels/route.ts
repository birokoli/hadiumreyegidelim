import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    const services = await prisma.service.findMany({
      where: { type: 'HOTEL' }
    });

    const hotels = services.map(s => {
      let ext: any = {};
      try {
        ext = s.extraData ? JSON.parse(s.extraData) : {};
      } catch {}

      return {
        id: s.id,
        name: s.name,
        price: s.price,
        description: s.description || "",
        images: ext.images || [],
        city: ext.city || "Mekke (Makkah)",
        stars: ext.stars || 5,
        distanceMeters: ext.distanceMeters || 100,
        distanceText: ext.distanceText || "Merkeze yakın"
      };
    });

    // Filter and sort
    let filtered = hotels;
    if (city) {
      filtered = hotels.filter(h => h.city?.includes(city.split(" ")[0]));
    }
    filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return NextResponse.json(filtered);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ error: "Hotels should be added via the generic /api/services endpoint." }, { status: 400 });
}

export async function DELETE(req: Request) {
  return NextResponse.json({ error: "Hotels should be deleted via the generic /api/services endpoint." }, { status: 400 });
}
