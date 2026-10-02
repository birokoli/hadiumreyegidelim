// Hizmet Kütüphanesi → "Sitede ne görünüyor?" durum paneli. Yetki middleware'de ("orders").
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureCatalogSchema } from "@/lib/catalog/schema";
import { getCatalog, queryCatalog, revalidateCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  try {
    await ensureCatalogSchema();
    const rows = await prisma.serviceLibrary.findMany({
      where: { isActive: true },
      select: { name: true, category: true, isPublic: true, city: true, defaultCostUsd: true, _count: { select: { prices: true } } },
    });
    const pub = rows.filter((r) => r.isPublic);
    const hotels = pub.filter((r) => r.category === "hotel");
    let fresh: number | null = null;
    let freshError: string | null = null;
    try { fresh = (await queryCatalog()).length; } catch (e) { freshError = e instanceof Error ? e.message.slice(0, 300) : String(e); }
    const cached = (await getCatalog()).length;
    return NextResponse.json({
      total: rows.length,
      public: pub.length,
      hotels: {
        public: hotels.length,
        mekke: hotels.filter((h) => h.city === "mekke").length,
        medine: hotels.filter((h) => h.city === "medine").length,
        noCity: hotels.filter((h) => h.city !== "mekke" && h.city !== "medine").map((h) => h.name),
      },
      noPrice: pub.filter((r) => !(r.defaultCostUsd > 0) && r._count.prices === 0).map((r) => r.name),
      nusukHidden: pub.filter((r) => /nusuk/i.test(r.name)).map((r) => r.name),
      siteNow: cached,
      siteFresh: fresh,
      error: freshError,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message.slice(0, 300) : "Durum alınamadı" }, { status: 500 });
  }
}

/** Sitedeki katalog önbelleğini hemen yenile */
export async function POST() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  revalidateCatalog();
  return NextResponse.json({ ok: true });
}
