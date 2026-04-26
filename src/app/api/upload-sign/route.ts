import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toSafeSlug(raw: string): string {
  return raw
    .replace(/ğ/g, "g").replace(/Ğ/g, "g")
    .replace(/ü/g, "u").replace(/Ü/g, "u")
    .replace(/ş/g, "s").replace(/Ş/g, "s")
    .replace(/ö/g, "o").replace(/Ö/g, "o")
    .replace(/ç/g, "c").replace(/Ç/g, "c")
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);
}

// 1. Adım: Sunucu imzalı upload URL'i üretir (dosya buraya gelmiyor)
export async function POST(req: Request) {
  try {
    const { headingSlug, ext, contentType } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase env var eksik." }, { status: 500 });
    }

    const safePrefix = headingSlug ? toSafeSlug(headingSlug) : "";
    const cleanPrefix = safePrefix ? `${safePrefix}-` : "gorsel-";
    const allowedExts: Record<string, string> = {
      jpg: "jpg", jpeg: "jpg", png: "png", webp: "webp", gif: "gif",
    };
    const safeExt = allowedExts[ext?.toLowerCase()] || "jpg";
    const filename = `${cleanPrefix}${Date.now()}.${safeExt}`;

    // Supabase Storage: signed upload URL al
    const signRes = await fetch(
      `${supabaseUrl}/storage/v1/object/upload/sign/uploads/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ upsert: true }),
      }
    );

    if (!signRes.ok) {
      const err = await signRes.text();
      return NextResponse.json({ error: `Sign hatası (${signRes.status}): ${err}` }, { status: 500 });
    }

    const signBody = await signRes.json();
    console.log("Supabase sign response:", JSON.stringify(signBody));

    // Supabase relative path döndürebilir — tam URL'e çevir
    const rawSigned: string = signBody.signedURL || signBody.signed_url || signBody.url || "";
    if (!rawSigned) {
      return NextResponse.json({ error: `signedURL yok. Supabase yanıtı: ${JSON.stringify(signBody)}` }, { status: 500 });
    }
    const signedURL = rawSigned.startsWith("http") ? rawSigned : `${supabaseUrl}${rawSigned}`;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${filename}`;

    return NextResponse.json({ signedURL, publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Sunucu hatası" }, { status: 500 });
  }
}
