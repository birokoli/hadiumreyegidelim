import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Türkçe harfleri ASCII'ye çevir, ardından alfanümerik dışını tire yap
function toSafeSlug(raw: string): string {
  return raw
    .replace(/ğ/g, "g").replace(/Ğ/g, "g")
    .replace(/ü/g, "u").replace(/Ü/g, "u")
    .replace(/ş/g, "s").replace(/Ş/g, "s")
    .replace(/ö/g, "o").replace(/Ö/g, "o")
    .replace(/ç/g, "c").replace(/Ç/g, "c")
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")   // alfanümerik dışı → tire
    .replace(/^-+|-+$/g, "")        // baş/son tireleri kaldır
    .substring(0, 40);
}

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "Dosya bulunamadı" });
    }

    const headingSlug = (data.get("headingSlug") as string) || "";
    const safePrefix = headingSlug ? toSafeSlug(headingSlug) : "";
    const cleanPrefix = safePrefix ? `${safePrefix}-` : "gorsel-";

    const uniqueSuffix = Date.now();
    const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    // Uzantıyı da güvene al (sadece bilinen resim uzantıları)
    const allowedExts: Record<string, string> = {
      jpg: "jpg", jpeg: "jpg", png: "png", webp: "webp", gif: "gif",
    };
    const ext = allowedExts[rawExt] || "jpg";
    const filename = `${cleanPrefix}${uniqueSuffix}.${ext}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase Storage ayarları eksik (env var eksik).");
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const contentType = file.type || mimeMap[ext] || "application/octet-stream";

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/uploads/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: uint8Array,
      }
    );

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Supabase Storage error:", uploadRes.status, errorText);
      throw new Error(`Supabase hatası (${uploadRes.status}): ${errorText}`);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
