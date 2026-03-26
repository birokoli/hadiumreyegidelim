import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Dosya bulunamadı" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const headingSlug = data.get("headingSlug") as string;
    
    // Enhance filename security and SEO
    const cleanPrefix = headingSlug ? `${headingSlug.replace(/[^a-z0-9]+/g, '-').substring(0, 40)}-` : "gorsel-";
    const uniqueSuffix = `${Math.round(Math.random() * 1e9)}`;
    const ext = file.name.split('.').pop() || "jpg";
    const filename = `${cleanPrefix}${uniqueSuffix}.${ext}`;
    
    // Upload directly to Supabase Storage (Vercel-safe)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase Storage ayarları eksik. .env dosyanızı kontrol edin.");
    }

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/uploads/${filename}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Supabase Storage error:", errorText);
      throw new Error("Görsel Supabase'e yüklenemedi.");
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${filename}`;

    // Return the public URL
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Yükleme sırasında sunucu hatası oluştu" }, { status: 500 });
  }
}
