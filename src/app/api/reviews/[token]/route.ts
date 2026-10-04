// Müşterinin kişiye özel yorum bağlantısı: durum, gönderim ve fotoğraf yükleme imzası
import { NextRequest, NextResponse } from "next/server";
import { getByToken, signReviewPhoto, submitByToken } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await getByToken(token).catch(() => null);
  if (!r) return NextResponse.json({ error: "Bağlantı geçersiz." }, { status: 404 });
  return NextResponse.json({ name: r.customerName, displayName: r.displayName, submitted: r.status !== "invited" });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await getByToken(token).catch(() => null);
  if (!r) return NextResponse.json({ error: "Bağlantı geçersiz." }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    if (b.action === "photo") {
      if (r.status !== "invited") return NextResponse.json({ error: "Bu bağlantıyla yorum gönderilmiş." }, { status: 400 });
      return NextResponse.json(await signReviewPhoto(String(b.ext ?? "webp")));
    }
    const rating = Number(b.rating);
    const text = typeof b.text === "string" ? b.text.trim() : "";
    if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Lütfen 1 ile 5 arasında puan verin." }, { status: 400 });
    if (text.length < 20) return NextResponse.json({ error: "Yorumunuz en az 20 karakter olmalı." }, { status: 400 });
    const photoUrl = typeof b.photoUrl === "string" && b.photoUrl.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/yorum-`) ? b.photoUrl : undefined;
    await submitByToken(token, {
      displayName: String(b.displayName ?? ""),
      city: typeof b.city === "string" ? b.city : undefined,
      umreMonth: typeof b.umreMonth === "string" ? b.umreMonth : undefined,
      rating,
      text,
      photoUrl,
      consent: b.consent === true,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
