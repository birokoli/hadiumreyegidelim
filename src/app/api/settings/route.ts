import { revalidateSiteSettings } from "@/lib/site-settings";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// Ziyaretçiye açık ayarlar; geri kalanı (şifre özeti, API durumları, harcamalar) yalnızca yöneticiye
const PUBLIC_KEYS = ['whatsappNumber'];

export async function GET() {
  try {
    const admin = await getAdminSession();
    const settings = await prisma.setting.findMany(admin ? undefined : { where: { key: { in: PUBLIC_KEYS } } });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    
    // Upsert setting
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    
    revalidateSiteSettings();
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
