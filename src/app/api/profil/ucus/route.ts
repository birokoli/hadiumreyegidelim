// Müşteri kendi uçuş bilgisini dosyasına ekler (karşılama saati buna göre ayarlanır).
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import { getDosyaByNo, memberCanSeeDosya, saveDosya } from "@/lib/umre";

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const d = await getDosyaByNo(String(b.no ?? ""));
  if (!d || !(await memberCanSeeDosya(d, o.m, o.dogrulandi))) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  const ucusGidis = String(b.ucusGidis ?? "").trim().slice(0, 120);
  const ucusDonus = String(b.ucusDonus ?? "").trim().slice(0, 120);
  const r = await saveDosya(d.id, { data: { ucusGidis, ucusDonus } });
  return NextResponse.json({ ok: true, data: r.dosya.data });
}
