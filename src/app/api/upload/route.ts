import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Next.js App Router default body limit'i aşmak için
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "Dosya bulunamadı" });
    }

    const headingSlug = (data.get("headingSlug") as string) || "";
    const cleanPrefix = headingSlug
      ? `${headingSlug.replace(/[^a-z0-9]+/g, "-").substring(0, 40)}-`
      : "gorsel-";
    const uniqueSuffix = Date.now();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filename = `${cleanPrefix}${uniqueSuffix}.${ext}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase Storage ayarları eksik.");
    }

    // File → ArrayBuffer → Uint8Array (en geniş fetch uyumluluğu)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Content-Type'ı uzantıdan çıkar (file.type bazen boş gelir)
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
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
