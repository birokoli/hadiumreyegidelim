import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { ensureCatalogSchema } from '@/lib/catalog/schema';
import { revalidateCatalog } from '@/lib/catalog';

async function checkAdmin() {
  if (!(await getAdminSession())) return false;
  await ensureCatalogSchema();
  return true;
}

export async function POST(_req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  let created = 0;
  let skipped = 0;

  try {
    // 1. Act: Legacy Hotel table
    const legacyHotels = await prisma.hotel.findMany({ where: { isActive: true } });
    for (const h of legacyHotels) {
      const existing = await prisma.serviceLibrary.findFirst({
        where: { name: { equals: h.name, mode: 'insensitive' } },
      });
      if (existing) {
        skipped++;
        continue;
      }

      let imageUrl: string | null = null;
      if (h.images) {
        try {
          const parsed = JSON.parse(h.images);
          if (Array.isArray(parsed) && parsed.length > 0) imageUrl = String(parsed[0]);
          else if (typeof h.images === 'string' && h.images.startsWith('http')) imageUrl = h.images;
        } catch {
          if (h.images.startsWith('http')) imageUrl = h.images;
        }
      }

      const city = h.city?.toLowerCase().includes('medine') ? 'medine' : 'mekke';

      await prisma.serviceLibrary.create({
        data: {
          category: 'hotel',
          name: h.name,
          city,
          hotelStars: h.stars ?? 5,
          distanceMeters: h.distanceMeters ?? null,
          imageUrl,
          defaultPricingType: 'per_room',
          defaultCostUsd: h.price ?? 0,
          isPublic: false,
          isActive: true,
        },
      });
      created++;
    }

    // 2. Eski Service tablosu. Oteller burada (type HOTEL); şehir, yıldız, mesafe ve görseller extraData JSON'unda
    //    (canlıdaki /api/hotels de buradan okuyor). Daha önce bu bilgiler olmadan aktarılmış otellerin boş alanları tamamlanır.
    const legacyServices = await prisma.service.findMany();
    let completed = 0;
    for (const s of legacyServices) {
      const typeUpper = s.type?.toUpperCase() ?? '';
      let ext: { city?: string; stars?: number; distanceMeters?: number; images?: string[] } = {};
      try { ext = s.extraData ? JSON.parse(s.extraData) : {}; } catch { ext = {}; }
      const hotelFields = typeUpper === 'HOTEL'
        ? {
            city: /medine|madinah/i.test(ext.city ?? '') ? 'medine' : 'mekke',
            hotelStars: Number.isFinite(Number(ext.stars)) ? Number(ext.stars) : null,
            distanceMeters: Number.isFinite(Number(ext.distanceMeters)) ? Number(ext.distanceMeters) : null,
            imageUrl: Array.isArray(ext.images) && typeof ext.images[0] === 'string' ? ext.images[0] : null,
          }
        : null;

      const existing = await prisma.serviceLibrary.findFirst({
        where: { name: { equals: s.name, mode: 'insensitive' } },
      });
      if (existing) {
        // Var olan otel kaydında boş kalan şehir/yıldız/mesafe/görsel doldurulur; dolu alana dokunulmaz
        if (hotelFields && existing.category === 'hotel') {
          const patch: Record<string, unknown> = {};
          if (!existing.city) patch.city = hotelFields.city;
          if (existing.hotelStars == null && hotelFields.hotelStars != null) patch.hotelStars = hotelFields.hotelStars;
          if (existing.distanceMeters == null && hotelFields.distanceMeters != null) patch.distanceMeters = hotelFields.distanceMeters;
          if (!existing.imageUrl && hotelFields.imageUrl) patch.imageUrl = hotelFields.imageUrl;
          if (Object.keys(patch).length) {
            await prisma.serviceLibrary.update({ where: { id: existing.id }, data: patch });
            completed++;
          }
        }
        skipped++;
        continue;
      }

      let category = 'tur';
      let pricingType = 'flat';
      if (typeUpper === 'HOTEL') {
        category = 'hotel';
        pricingType = 'per_room';
      } else if (typeUpper === 'TRANSFER') {
        category = 'transfer';
        pricingType = 'per_vehicle';
      } else if (typeUpper === 'TRAIN') {
        category = 'transfer';
        pricingType = 'per_person';
      }

      await prisma.serviceLibrary.create({
        data: {
          category,
          name: s.name,
          description: s.description || null,
          defaultPricingType: pricingType,
          defaultCostUsd: s.price ?? 0,
          isPublic: false,
          isActive: true,
          ...(hotelFields ?? {}),
        },
      });
      created++;
    }

    revalidateCatalog();
    return NextResponse.json({ created, skipped, completed });
  } catch (err) {
    console.error('Import legacy error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Aktarım hatası' }, { status: 500 });
  }
}
