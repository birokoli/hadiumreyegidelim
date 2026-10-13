// Satış masası: dosya listesi ve yeni dosya (admin).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createDosya, listDosyalar } from "@/lib/satis";

export const dynamic = "force-dynamic";

export async function GET() {
  const a = await getAdminSession();
  if (!a) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const [dosyalar, ekip] = await Promise.all([
    listDosyalar(),
    prisma.adminUser.findMany({ where: { status: "active" }, select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []),
  ]);
  return NextResponse.json({ dosyalar, ekip, ben: { id: a.id, name: a.name } });
}

export async function POST(req: NextRequest) {
  const a = await getAdminSession();
  if (!a) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const musteriAdi = String(b.musteriAdi ?? "").trim().slice(0, 80);
  if (musteriAdi.length < 2) return NextResponse.json({ error: "Müşteri adını yazın." }, { status: 400 });
  const d = await createDosya({
    musteriAdi,
    phone: String(b.phone ?? "").slice(0, 25) || null,
    email: String(b.email ?? "").slice(0, 120) || null,
    yetiskin: Math.max(1, Number(b.yetiskin) || 1),
    cocuk: Math.max(0, Number(b.cocuk) || 0),
    gidis: String(b.gidis ?? "") || undefined,
    donus: String(b.donus ?? "") || undefined,
    talepNotu: String(b.talepNotu ?? "").slice(0, 1000) || undefined,
    sorumluId: a.id,
    kim: a.name,
  });
  return NextResponse.json({ dosya: d });
}
