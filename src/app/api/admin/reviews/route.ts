// Admin → Yorumlar
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { addManual, adminList, adminUpdate, createInvite, reviewUrl, signReviewPhoto, STATUSES, type ReviewStatus } from "@/lib/reviews";

export const dynamic = "force-dynamic";
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function GET() {
  if (!(await getAdminSession())) return fail("Yetkisiz.", 401);
  try {
    const rows = await adminList();
    return NextResponse.json({ items: rows.map((r) => ({ ...r, url: r.token ? reviewUrl(r.token) : null })) });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), 500);
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return fail("Yetkisiz.", 401);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string) : undefined);
  try {
    switch (b.action) {
      case "invite": {
        const name = str("customerName")?.trim();
        if (!name) return fail("Müşteri adı gerekli.");
        const { review, url } = await createInvite(name);
        return NextResponse.json({ ok: true, item: review, url });
      }
      case "manual": {
        const name = str("customerName")?.trim();
        const text = str("text")?.trim();
        if (!name || !text) return fail("Ad ve yorum metni gerekli.");
        const rating = b.rating === "" || b.rating == null ? null : Number(b.rating);
        const item = await addManual({ customerName: name, displayName: str("displayName"), city: str("city"), umreMonth: str("umreMonth"), rating: rating && rating >= 1 && rating <= 5 ? rating : null, text, photoUrl: str("photoUrl"), date: str("date") });
        return NextResponse.json({ ok: true, item });
      }
      case "update": {
        const id = str("id");
        if (!id) return fail("id gerekli.");
        const status = str("status");
        if (status && !(STATUSES as readonly string[]).includes(status)) return fail("Geçersiz durum.");
        const data: Parameters<typeof adminUpdate>[1] = {};
        if (status) data.status = status as ReviewStatus;
        for (const k of ["reply", "displayName", "text", "city", "umreMonth", "photoUrl"] as const) if (k in b) (data as Record<string, unknown>)[k] = str(k)?.trim() || null;
        if ("rating" in b) data.rating = b.rating === "" || b.rating == null ? null : Math.max(1, Math.min(5, Number(b.rating)));
        const item = await adminUpdate(id, data);
        revalidatePath("/");
        revalidatePath("/yorumlar");
        return NextResponse.json({ ok: true, item });
      }
      case "photo":
        return NextResponse.json(await signReviewPhoto(str("ext") ?? "webp"));
      default:
        return fail("Bilinmeyen işlem.");
    }
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), 500);
  }
}
