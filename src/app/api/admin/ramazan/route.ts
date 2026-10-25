// Ramazan 2027 rezervasyonları (yönetici; yetki middleware'de: "orders"). GET liste + oda özeti, POST durum değiştir.
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { durumDegistir, odaOzeti, rezervasyonlar, aktif, type RamazanDurum } from "@/lib/ramazan";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const [liste, odalar] = await Promise.all([rezervasyonlar(), odaOzeti()]);
  const simdi = new Date();
  return NextResponse.json({ liste: liste.map((r) => ({ ...r, aktif: aktif(r, simdi) })), odalar });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; durum?: RamazanDurum; not?: string };
  if (!b.id || !["bekliyor", "odendi", "iptal"].includes(b.durum ?? "")) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  const r = await durumDegistir(b.id, b.durum!, b.not?.slice(0, 500) ?? null);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.hata }, { status: 409 });
}
