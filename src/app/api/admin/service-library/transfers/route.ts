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

export const maxDuration = 60;

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

  // Toplu yazım: canlıda tek tek 1.300+ sorgu süre sınırına takılıp listeyi yarım bırakıyordu (2 Ekim)
  const months = monthsFrom(undefined, 13);
  const margin = DEFAULT_MARGIN.default;
  const rows = TRANSFER_ROUTES.flatMap((route) =>
    TRANSFER_VEHICLES.flatMap((v) => {
      const price = route.prices[v.key];
      if (price == null) return [];
      return [{
        slug: transferSlug(route.key, v.key),
        price,
        data: {
          category: route.kind === "tur" ? "tur" : "transfer",
          name: `${route.label} · ${v.label}`,
          publicDescription: [route.note, v.note].filter(Boolean).join(" · "),
          defaultPricingType: "per_vehicle",
          defaultVehicleType: v.key,
          // Liste satış fiyatıdır; aylık fiyat yoksa geri düşülen maliyet, kâr payıyla yine bu fiyatı verecek şekilde yazılır
          defaultCostUsd: Math.round((price / (1 + margin / 100)) * 100) / 100,
          isActive: true,
          isPublic: true,
        },
      }];
    }),
  );
  const existing = await prisma.serviceLibrary.findMany({ where: { slug: { in: rows.map((r) => r.slug) } }, select: { slug: true } });
  const have = new Set(existing.map((e) => e.slug));
  const toCreate = rows.filter((r) => !have.has(r.slug));
  if (toCreate.length) await prisma.serviceLibrary.createMany({ data: toCreate.map((r) => ({ ...r.data, slug: r.slug })), skipDuplicates: true });
  const toUpdate = rows.filter((r) => have.has(r.slug));
  for (let i = 0; i < toUpdate.length; i += 25) {
    await prisma.$transaction(toUpdate.slice(i, i + 25).map((r) => prisma.serviceLibrary.update({ where: { slug: r.slug }, data: r.data })));
  }
  const ids = await prisma.serviceLibrary.findMany({ where: { slug: { in: rows.map((r) => r.slug) } }, select: { id: true, slug: true } });
  const priceBySlug = new Map(rows.map((r) => [r.slug, r.price]));
  await prisma.servicePrice.deleteMany({ where: { serviceId: { in: ids.map((x) => x.id) }, month: { in: months }, variant: "" } });
  await prisma.servicePrice.createMany({
    data: ids.flatMap((x) => months.map((month) => ({ serviceId: x.id, month, variant: "", salePriceUsd: priceBySlug.get(x.slug!)! }))),
  });
  const created = toCreate.length;
  const updated = toUpdate.length;
  // Eski araç transferleri (Accord, ECO VIP vb.) sitede gizlenir; kayıtları silinmez. Kişi başı (tren) kalemlerine dokunulmaz.
  const hidden = await prisma.serviceLibrary.updateMany({
    where: { category: "transfer", defaultPricingType: "per_vehicle", isPublic: true, OR: [{ slug: null }, { NOT: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }] },
    data: { isPublic: false },
  });
  revalidateCatalog();
  return NextResponse.json({ created, updated, hiddenOld: hidden.count });
}
