// Ücretsiz materyal karşılığı iletişim bilgisi (müşteri havuzu). Spam: bal küpü alanı + IP başına sınır.
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createLead, LEAD_SOURCES } from "@/lib/leads";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(ip, "leads", 5, 10 * 60 * 1000);
  if (!allowed) return NextResponse.json({ ok: false, error: "Çok fazla deneme; birkaç dakika sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.website) return NextResponse.json({ ok: true }); // bal küpü
  const name = String(b.name ?? "").trim().slice(0, 80);
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 120) || null;
  const digits = String(b.phone ?? "").replace(/[^\d+]/g, "").slice(0, 20);
  const phone = digits.replace(/\D/g, "").length >= 10 ? digits : null;
  const source = String(b.source ?? "");
  if (!LEAD_SOURCES[source]) return NextResponse.json({ ok: false, error: "Geçersiz kaynak." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ ok: false, error: "Lütfen adınızı yazın." }, { status: 400 });
  if (email && !EMAIL.test(email)) return NextResponse.json({ ok: false, error: "E-posta adresi geçersiz görünüyor." }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ ok: false, error: "E-posta adresinizi ya da telefon numaranızı yazın." }, { status: 400 });
  if (b.kvkk !== true) return NextResponse.json({ ok: false, error: "Devam etmek için KVKK bilgilendirmesini onaylayın." }, { status: 400 });
  try {
    await createLead({ name, email, phone, source, marketingConsent: b.marketing === true, referrer: String(b.referrer ?? "").slice(0, 300) || null });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[leads]", e);
    return NextResponse.json({ ok: false, error: "Kaydedilemedi; lütfen tekrar deneyin." }, { status: 500 });
  }
}
