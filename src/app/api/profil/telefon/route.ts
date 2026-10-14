// Üye telefonunu ekler/değiştirir (Profil 2, 14 Ekim): kampanya talebi ve WhatsApp iletişimi için.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uyeOturumu } from "@/lib/members/guard";
import { checkPhone } from "@/lib/leads/email-check";

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const p = checkPhone(String(b.phone ?? ""));
  if (!p.ok) return NextResponse.json({ error: p.error }, { status: 400 });
  await prisma.user.update({ where: { id: o.m.id }, data: { phone: p.phone } });
  return NextResponse.json({ ok: true, phone: p.phone });
}
