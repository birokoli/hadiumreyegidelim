// Üye girişi (13 Ekim: IP başına deneme sınırı, büyük/küçük harf duyarsız e-posta, 7 günlük oturum).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/jwt";
import { sessionCookie } from "@/lib/members";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(getClientIp(request), "member-login", 10, 10 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Çok fazla deneme yapıldı; birkaç dakika sonra tekrar deneyin." }, { status: 429 });
  }
  try {
    const b = await request.json().catch(() => ({}));
    const email = String(b.email ?? "").trim();
    const password = String(b.password ?? "");
    if (!email || !password) return NextResponse.json({ error: "E-posta ve şifrenizi yazın." }, { status: 400 });

    const user =
      (await prisma.user.findUnique({ where: { email: email.toLowerCase() } })) ??
      (await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }));
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "E-posta ya da şifre hatalı." }, { status: 401 });
    }
    const token = await createSessionCookie({ id: user.id, email: user.email, name: user.name });
    (await cookies()).set(sessionCookie(token));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[uye-giris]", error);
    return NextResponse.json({ error: "Giriş sırasında bir hata oluştu; lütfen tekrar deneyin." }, { status: 500 });
  }
}
