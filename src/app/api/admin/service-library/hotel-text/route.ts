import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getHotelLongTextForAdmin, setHotelLongText } from "@/lib/catalog/hotel-texts";

export const dynamic = "force-dynamic";

/** GET ?id= → { text } (otel sayfası uzun açıklaması) */
export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const h = await prisma.serviceLibrary.findUnique({ where: { id }, select: { id: true, slug: true, name: true } });
  if (!h) return NextResponse.json({ error: "Otel bulunamadı." }, { status: 404 });
  return NextResponse.json({ text: await getHotelLongTextForAdmin(h) });
}

/** POST { id, text } */
export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { id, text } = (await req.json().catch(() => ({}))) as { id?: string; text?: string };
  if (!id || typeof text !== "string") return NextResponse.json({ error: "id ve text gerekli." }, { status: 400 });
  const h = await prisma.serviceLibrary.findUnique({ where: { id }, select: { slug: true } });
  if (!h) return NextResponse.json({ error: "Otel bulunamadı." }, { status: 404 });
  await setHotelLongText(id, text.slice(0, 5000));
  revalidatePath("/oteller");
  if (h.slug) revalidatePath(`/oteller/${h.slug}`);
  return NextResponse.json({ ok: true });
}
