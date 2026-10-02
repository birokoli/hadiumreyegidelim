// Transfer listesi (araç × rota) → Hizmet Kütüphanesi. GET: durum + araç görselleri; POST {action:"sync"}: listeyi yükle/güncelle;
// POST {action:"images", images}: araç görsellerini kaydet.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureCatalogSchema } from "@/lib/catalog/schema";
import { revalidateCatalog } from "@/lib/catalog";
import { TRANSFER_SLUG_PREFIX, TRANSFER_VEHICLES, VEHICLE_IMAGES_SETTING_KEY, parseVehicleImages } from "@/lib/catalog/transfers";
import { TRANSFER_EXPECTED, syncTransferList } from "@/lib/catalog/transfer-sync";
import { revalidateSiteSettings } from "@/lib/site-settings";

async function guard() {
  if (!(await getAdminSession())) return false;
  await ensureCatalogSchema();
  return true;
}

export const maxDuration = 60;

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const [loaded, oldPublic, setting] = await Promise.all([
    prisma.serviceLibrary.count({ where: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }),
    prisma.serviceLibrary.count({ where: { category: "transfer", defaultPricingType: "per_vehicle", isPublic: true, OR: [{ slug: null }, { NOT: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }] } }),
    prisma.setting.findUnique({ where: { key: VEHICLE_IMAGES_SETTING_KEY } }),
  ]);
  const expected = TRANSFER_EXPECTED;
  return NextResponse.json({ loaded, expected, oldPublic, vehicles: TRANSFER_VEHICLES, images: parseVehicleImages(setting?.value) });
}

export async function POST(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; images?: Record<string, string> };

  if (body.action === "images") {
    const clean = Object.fromEntries(
      Object.entries(body.images ?? {}).filter(([k, v]) => TRANSFER_VEHICLES.some((x) => x.key === k) && typeof v === "string" && /^https?:\/\//.test(v.trim())).map(([k, v]) => [k, v.trim()]),
    );
    const value = JSON.stringify(clean);
    await prisma.setting.upsert({ where: { key: VEHICLE_IMAGES_SETTING_KEY }, update: { value }, create: { key: VEHICLE_IMAGES_SETTING_KEY, value } });
    revalidateSiteSettings();
    return NextResponse.json({ ok: true, images: clean });
  }

  if (body.action !== "sync") return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });

  const r = await syncTransferList();
  revalidateCatalog();
  return NextResponse.json(r);
}
