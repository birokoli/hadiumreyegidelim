// Transfer listesi (araç × rota) → Hizmet Kütüphanesi. GET: durum + araç görselleri; POST {action:"sync"}: listeyi yükle/güncelle;
// POST {action:"images", images}: araç görsellerini kaydet.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureCatalogSchema } from "@/lib/catalog/schema";
import { DEFAULT_MARGIN, monthsFrom, revalidateCatalog } from "@/lib/catalog";
import { TRANSFER_ROUTES, TRANSFER_SLUG_PREFIX, TRANSFER_VEHICLES, VEHICLE_IMAGES_SETTING_KEY, parseVehicleImages, transferSlug } from "@/lib/catalog/transfers";
import { revalidateSiteSettings } from "@/lib/site-settings";

async function guard() {
  if (!(await getAdminSession())) return false;
  await ensureCatalogSchema();
  return true;
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const [loaded, oldPublic, setting] = await Promise.all([
    prisma.serviceLibrary.count({ where: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }),
    prisma.serviceLibrary.count({ where: { category: "transfer", defaultPricingType: "per_vehicle", isPublic: true, OR: [{ slug: null }, { NOT: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }] } }),
    prisma.setting.findUnique({ where: { key: VEHICLE_IMAGES_SETTING_KEY } }),
  ]);
  const expected = TRANSFER_ROUTES.reduce((n, r) => n + Object.keys(r.prices).length, 0);
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

  const months = monthsFrom(undefined, 13);
  let created = 0;
  let updated = 0;
  for (const route of TRANSFER_ROUTES) {
    for (const v of TRANSFER_VEHICLES) {
      const price = route.prices[v.key];
      if (price == null) continue;
      const slug = transferSlug(route.key, v.key);
      const margin = DEFAULT_MARGIN.default;
      const data = {
        category: route.kind === "tur" ? "tur" : "transfer",
        name: `${route.label} · ${v.label}`,
        publicDescription: [route.note, v.note].filter(Boolean).join(" · "),
        defaultPricingType: "per_vehicle",
        defaultVehicleType: v.key,
        // Liste satış fiyatıdır; aylık fiyat yoksa geri düşülen maliyet, kâr payıyla yine bu fiyatı verecek şekilde yazılır
        defaultCostUsd: Math.round((price / (1 + margin / 100)) * 100) / 100,
        isActive: true,
        isPublic: true,
      };
      const existing = await prisma.serviceLibrary.findUnique({ where: { slug } });
      const row = existing
        ? await prisma.serviceLibrary.update({ where: { slug }, data })
        : await prisma.serviceLibrary.create({ data: { ...data, slug } });
      if (existing) updated++;
      else created++;
      // Önümüzdeki 13 ay için tek fiyat (variant "")
      for (const month of months) {
        const p = await prisma.servicePrice.findFirst({ where: { serviceId: row.id, month, variant: "" } });
        if (p) await prisma.servicePrice.update({ where: { id: p.id }, data: { salePriceUsd: price } });
        else await prisma.servicePrice.create({ data: { serviceId: row.id, month, variant: "", salePriceUsd: price } });
      }
    }
  }
  // Eski araç transferleri (Accord, ECO VIP vb.) sitede gizlenir; kayıtları silinmez. Kişi başı (tren) kalemlerine dokunulmaz.
  const hidden = await prisma.serviceLibrary.updateMany({
    where: { category: "transfer", defaultPricingType: "per_vehicle", isPublic: true, OR: [{ slug: null }, { NOT: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }] },
    data: { isPublic: false },
  });
  revalidateCatalog();
  return NextResponse.json({ created, updated, hiddenOld: hidden.count });
}
