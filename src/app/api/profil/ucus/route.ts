// Müşteri kendi uçuş bilgisini dosyasına ekler (karşılama saati buna göre ayarlanır).
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import { getDosya, memberCanSee, saveDosya } from "@/lib/satis";

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const d = await getDosya("no", String(b.no ?? ""));
  if (!d || !memberCanSee(d, o.m, o.dogrulandi)) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  const ucusGidis = String(b.ucusGidis ?? "").trim().slice(0, 120);
  const ucusDonus = String(b.ucusDonus ?? "").trim().slice(0, 120);
  const r = await saveDosya(d.id, { data: { ucusGidis, ucusDonus } }, o.m.name, `Müşteri uçuş bilgisini girdi: ${ucusGidis}${ucusDonus ? ` / ${ucusDonus}` : ""}`);
  return NextResponse.json({ ok: true, data: r.dosya.data });
}
