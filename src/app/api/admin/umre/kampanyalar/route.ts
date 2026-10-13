// Profilde gösterilen kampanya kartları (admin'den elle).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { profilKampanyalari, saveProfilKampanyalari, type ProfilKampanya } from "@/lib/umre";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  return NextResponse.json({ kampanyalar: await profilKampanyalari() });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const list: ProfilKampanya[] = (Array.isArray(b.kampanyalar) ? b.kampanyalar : []).map((k: Record<string, unknown>, i: number) => ({
    id: String(k.id || `k${Date.now()}${i}`),
    baslik: String(k.baslik ?? "").slice(0, 90),
    aciklama: String(k.aciklama ?? "").slice(0, 200),
    link: String(k.link ?? "").startsWith("/") || String(k.link ?? "").startsWith("https://") ? String(k.link) : "/bireysel-umre",
    hat: String(k.hat ?? "").slice(0, 12),
    aktif: k.aktif !== false,
  })).filter((k: ProfilKampanya) => k.baslik);
  await saveProfilKampanyalari(list);
  return NextResponse.json({ kampanyalar: list });
}
