// Satış dosyası belgeleri (admin): yükle (base64, en fazla 3,5 MB) ve sil. Yalnızca dosyanın sahibi üye indirebilir.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { addBelge, BELGE_TURLERI, deleteBelge, listBelgeler } from "@/lib/satis";

const IZINLI = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  if (!b.dosyaId || !b.base64 || !b.ad) return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  if (!IZINLI.includes(b.mime)) return NextResponse.json({ error: "Yalnızca PDF ya da fotoğraf yüklenebilir." }, { status: 400 });
  if (b.base64.length > 3.5 * 1024 * 1024 * 1.37) return NextResponse.json({ error: "Dosya en fazla 3,5 MB olabilir." }, { status: 400 });
  await addBelge(b.dosyaId, { ad: b.ad.slice(0, 120), tur: BELGE_TURLERI[b.tur] ? b.tur : "diger", mime: b.mime, base64: b.base64 });
  return NextResponse.json({ belgeler: await listBelgeler(b.dosyaId) });
}

export async function DELETE(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  const dosyaId = req.nextUrl.searchParams.get("dosyaId");
  if (!id || !dosyaId) return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  await deleteBelge(id);
  return NextResponse.json({ belgeler: await listBelgeler(dosyaId) });
}
