// Üye, kendisine özel kampanyadan teklif ister (Profil 2, 14 Ekim): satış masasında dosya açılır, ekip WhatsApp'tan döner.
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { kampanyaTalebi, yayindakiKampanyalar } from "@/lib/uye-kampanya";

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (!rateLimit(getClientIp(req), "uye-kampanya", 10, 10 * 60 * 1000).allowed) return NextResponse.json({ error: "Çok fazla deneme; biraz sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const k = (await yayindakiKampanyalar()).find((x) => x.id === String(b.kampanyaId ?? ""));
  if (!k) return NextResponse.json({ error: "Bu kampanya artık açık değil." }, { status: 404 });
  const kisi = Math.min(20, Math.max(1, Number(b.kisi) || 1));
  if (k.kalan != null && kisi > k.kalan) return NextResponse.json({ error: `Bu kampanyada ${k.kalan} kişilik yer kaldı.` }, { status: 400 });
  const { dosya, yeni } = await kampanyaTalebi(o.m, k, kisi, String(b.not ?? "").slice(0, 300));
  return NextResponse.json({ ok: true, no: dosya.no, yeni });
}
