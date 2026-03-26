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
    
    // Write to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Yükleme sırasında sunucu hatası oluştu" }, { status: 500 });
  }
}
