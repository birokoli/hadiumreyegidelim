// Üye kaydı (13 Ekim): e-posta ve telefon kitapçık formundaki gibi kontrol edilir; KVKK onayı zorunlu, ticari ileti
// izni isteğe bağlı. Üye aynı zamanda müşteri havuzuna "Üyelik" kaynağıyla (izin metniyle birlikte) yazılır.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/jwt";
import { issueCode, sessionCookie } from "@/lib/members";
import { sendUyeDogrulama } from "@/lib/leads/mailer";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { checkEmail, checkPhone } from "@/lib/leads/email-check";
import { createLead } from "@/lib/leads";

const bad = (error: string, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status: 400 });

export async function POST(request: Request) {
  if (!rateLimit(getClientIp(request), "member-register", 6, 30 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Çok fazla deneme yapıldı; biraz sonra tekrar deneyin." }, { status: 429 });
  }
  try {
    const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (b.website) return NextResponse.json({ success: true }); // bal küpü
    const name = String(b.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
    const password = String(b.password ?? "");
    if (name.length < 2 || !/\p{L}/u.test(name)) return bad("Lütfen adınızı ve soyadınızı yazın.", { field: "name" });

    const e = await checkEmail(String(b.email ?? ""));
    if (!e.ok) return bad(e.error, { field: "email", suggestion: e.suggestion });
    let phone: string | null = null;
    if (String(b.phone ?? "").trim()) {
      const p = checkPhone(String(b.phone));
      if (!p.ok) return bad(p.error, { field: "phone" });
      phone = p.phone;
    }
    if (password.length < 8) return bad("Şifreniz en az 8 karakter olmalı.", { field: "password" });
    if (b.kvkk !== true) return bad("Devam etmek için KVKK bilgilendirmesini onaylayın.", { field: "kvkk" });

    const exists = await prisma.user.findFirst({ where: { email: { equals: e.email, mode: "insensitive" } }, select: { id: true } });
    if (exists) return bad("Bu e-posta adresiyle zaten bir hesap var. Giriş yapın ya da şifrenizi sıfırlayın.", { field: "email", exists: true });

    const user = await prisma.user.create({ data: { name, email: e.email, password: await bcrypt.hash(password, 10), phone } });
    await createLead({ name, email: e.email, phone, source: "uyelik", marketingConsent: b.marketing === true, referrer: null, utm: String(b.utm ?? "").slice(0, 300) || null }).catch((err) => console.error("[uye-kayit] havuz", err));

    // E-posta doğrulama kodu (profilde girilir); gönderilemezse kayıt yine tamamlanır
    await sendUyeDogrulama({ to: user.email, name: user.name, code: await issueCode(user.id, "eposta") }).catch((err) => console.error("[uye-kayit] doğrulama", err));
    const token = await createSessionCookie({ id: user.id, email: user.email, name: user.name });
    (await cookies()).set(sessionCookie(token));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[uye-kayit]", error);
    return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu; lütfen tekrar deneyin." }, { status: 500 });
  }
}
