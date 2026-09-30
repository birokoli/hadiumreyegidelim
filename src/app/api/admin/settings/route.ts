import { isPublicKey, MAX_VALUE_LENGTH, revalidateSiteSettings } from "@/lib/site-settings";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie || sessionCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Yalnızca sitenin ayarları: SEO/AI araçlarının büyük JSON'ları yanıtı Vercel sınırının
    // üstüne çıkarıyordu; istek düşünce form varsayılanlarla kalıp kaydedilen ayarları eziyordu
    const settings = await prisma.setting.findMany({ select: { key: true, value: true } });
    const settingsMap = settings.reduce((acc: Record<string, string>, curr) => {
      if (isPublicKey(curr.key) && curr.value.length <= MAX_VALUE_LENGTH) acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Settings Fetch Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie || sessionCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json(); // Map of { key: value }
    
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }

    // Instantly invalidate ALL cached pages so settings take effect immediately
    revalidatePath('/', 'layout');

    revalidateSiteSettings();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 });
  }
}
