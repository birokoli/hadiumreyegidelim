// Ücretsiz materyal karşılığı iletişim bilgisi (müşteri havuzu). Spam: bal küpü alanı + IP başına sınır.
// 13 Ekim: e-posta yazan herkese 6 haneli kod gider (RESEND_API_KEY varsa); önce adres kontrol edilir (biçim, yazım hatası,
// geçici servis, MX). Yalnızca telefon bırakmak serbest (daha çok kayıt için), numara biçimi kontrol edilir.
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createLead, findLeadByEmail, issueCode, refreshLead, LEAD_SOURCES } from "@/lib/leads";
import { checkEmail, checkPhone } from "@/lib/leads/email-check";
import { emailVerificationEnabled, sendLeadCode } from "@/lib/leads/mailer";

const bad = (error: string, extra: Record<string, unknown> = {}) => NextResponse.json({ ok: false, error, ...extra }, { status: 400 });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(ip, "leads", 8, 10 * 60 * 1000).allowed) return NextResponse.json({ ok: false, error: "Çok fazla deneme; birkaç dakika sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.website) return NextResponse.json({ ok: true, step: "done" }); // bal küpü
  const source = String(b.source ?? "");
  if (!LEAD_SOURCES[source]) return bad("Geçersiz kaynak.");
  const name = String(b.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (name.length < 2 || !/\p{L}/u.test(name)) return bad("Lütfen adınızı yazın.", { field: "name" });
  const emailRaw = String(b.email ?? "").trim().slice(0, 120);
  const phoneRaw = String(b.phone ?? "").trim().slice(0, 25);
  if (!emailRaw && !phoneRaw) return bad("E-posta adresinizi ya da telefon numaranızı yazın.", { field: "email" });

  let phone: string | null = null;
  if (phoneRaw) {
    const p = checkPhone(phoneRaw);
    if (!p.ok) return bad(p.error, { field: "phone" });
    phone = p.phone;
  }
  let email: string | null = null;
  if (emailRaw) {
    const c = await checkEmail(emailRaw);
    if (!c.ok) return bad(c.error, { field: "email", suggestion: c.suggestion });
    email = c.email;
  }
  if (b.kvkk !== true) return bad("Devam etmek için KVKK bilgilendirmesini onaylayın.", { field: "kvkk" });

  const input = {
    name,
    email,
    phone,
    source,
    marketingConsent: b.marketing === true,
    referrer: String(b.referrer ?? "").slice(0, 300) || null,
    utm: String(b.utm ?? "").slice(0, 300) || null,
  };
  try {
    if (!email) {
      await createLead(input);
      return NextResponse.json({ ok: true, step: "done" });
    }
    const existing = await findLeadByEmail(email, source);
    if (existing) await refreshLead(existing.id, input);
    if (existing?.emailVerified) return NextResponse.json({ ok: true, step: "done" });
    const leadId = existing?.id ?? (await createLead(input));
    if (!emailVerificationEnabled()) return NextResponse.json({ ok: true, step: "done" });
    if (!rateLimit(email, "lead-code", 3, 30 * 60 * 1000).allowed) return NextResponse.json({ ok: false, error: "Bu adrese kısa sürede çok kod gönderildi; e-postanızdaki son kodu kullanın." }, { status: 429 });
    const code = await issueCode(leadId);
    try {
      await sendLeadCode({ to: email, name, code, title: LEAD_SOURCES[source], leadId });
    } catch (e) {
      // E-posta servisi çalışmazsa kişiyi kaybetmeyelim: kayıt doğrulanmamış olarak kalır, indirme açılır
      console.error("[leads] kod gönderilemedi", e);
      return NextResponse.json({ ok: true, step: "done" });
    }
    return NextResponse.json({ ok: true, step: "code", leadId, email });
  } catch (e) {
    console.error("[leads]", e);
    return NextResponse.json({ ok: false, error: "Kaydedilemedi; lütfen tekrar deneyin." }, { status: 500 });
  }
}
