// Şifremi unuttum (13 Ekim): 1) e-postaya 6 haneli kod, 2) kod + yeni şifre → şifre değişir ve oturum açılır.
// Hesap olup olmadığı dışarıya söylenmez (her zaman "gönderdik" cevabı).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/jwt";
import { checkResetCode, issueResetCode, markEmailVerified, sessionCookie } from "@/lib/members";
import { sendPasswordCode } from "@/lib/leads/mailer";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MESSAGES = { wrong: "Kod hatalı.", expired: "Kodun süresi doldu; yeni kod isteyin.", locked: "Çok fazla hatalı deneme; yeni kod isteyin.", missing: "Önce kod isteyin." } as const;

export async function POST(request: Request) {
  if (!rateLimit(getClientIp(request), "member-reset", 12, 15 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Çok fazla deneme yapıldı; birkaç dakika sonra tekrar deneyin." }, { status: 429 });
  }
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = String(b.email ?? "").trim();
  if (!email) return NextResponse.json({ error: "E-posta adresinizi yazın." }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });

  if (b.action === "start") {
    if (user && rateLimit(user.id, "member-reset-send", 3, 30 * 60 * 1000).allowed) {
      try {
        await sendPasswordCode({ to: user.email, name: user.name, code: await issueResetCode(user.id) });
      } catch (e) {
        console.error("[sifre] kod gönderilemedi", e);
        return NextResponse.json({ error: "E-posta şu an gönderilemedi; biraz sonra tekrar deneyin." }, { status: 502 });
      }
    }
    return NextResponse.json({ success: true });
  }

  const code = String(b.code ?? "").replace(/\D/g, "");
  const password = String(b.password ?? "");
  if (code.length !== 6) return NextResponse.json({ error: "6 haneli kodu yazın.", field: "code" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Yeni şifreniz en az 8 karakter olmalı.", field: "password" }, { status: 400 });
  if (!user) return NextResponse.json({ error: MESSAGES.wrong, field: "code" }, { status: 400 });
  const result = await checkResetCode(user.id, code);
  if (result !== "ok") return NextResponse.json({ error: MESSAGES[result], field: "code" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 10) } });
  await markEmailVerified(user.id); // e-postaya gelen kodu bildi: adres onun
  const token = await createSessionCookie({ id: user.id, email: user.email, name: user.name });
  (await cookies()).set(sessionCookie(token));
  return NextResponse.json({ success: true });
}
