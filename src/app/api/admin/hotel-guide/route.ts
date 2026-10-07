// Otel rehberi admin API'si (7 Ekim): Google otel verisi çekme, metin yazma, onay.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { directoryHotels, DISTRICTS } from "@/lib/catalog/hotel-directory";
import { fetchGoogleBatch, fillMissingAbout, hotelGuideData, setApproved, writeHotelContent } from "@/lib/hotels/google-data";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function GET() {
  if (!(await getAdminSession())) return fail("Yetkisiz.", 401);
  const [{ google, content }, hotels] = await Promise.all([hotelGuideData(true), directoryHotels({ all: true })]);
  const failed = Object.entries(google).filter(([, g]) => !g.identifier).map(([slug, g]) => ({ slug, reason: (g as unknown as { failed?: string }).failed ?? "eşleşmedi" }));
  return NextResponse.json({
    ok: true,
    hotels: hotels.map((h) => ({
      slug: h.slug,
      name: h.name,
      district: h.district,
      districtLabel: DISTRICTS[h.district] ?? h.district,
      kaabaMeters: h.kaabaMeters,
      stars: h.stars,
      google: google[h.slug]?.identifier ? { title: google[h.slug].title, matchScore: google[h.slug].matchScore, about: !!google[h.slug].about, amenities: google[h.slug].amenities.length } : null,
      content: content[h.slug] ?? null,
      published: h.published,
    })),
    failed,
    fetched: Object.values(google).filter((g) => g.identifier).length,
  });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return fail("Yetkisiz.", 401);
  const body = await req.json().catch(() => ({}));
  try {
    switch (body.action) {
      case "fetch":
        return NextResponse.json({ ok: true, ...(await fetchGoogleBatch(8)) });
      case "about":
        return NextResponse.json({ ok: true, ...(await fillMissingAbout(8)) });
      case "write": {
        const hotels = await directoryHotels({ all: true });
        const targets = body.slug ? hotels.filter((h) => h.slug === body.slug) : [];
        if (!targets.length) return fail("Otel bulunamadı.");
        const h = targets[0];
        return NextResponse.json({ ok: true, content: await writeHotelContent(h.slug, DISTRICTS[h.district] ?? h.district, h.name) });
      }
      case "approve":
        if (!body.slug) return fail("slug gerekli.");
        await setApproved(body.slug, body.approved !== false, { description: body.description });
        return NextResponse.json({ ok: true });
      default:
        return fail("Bilinmeyen işlem.");
    }
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), 500);
  }
}
