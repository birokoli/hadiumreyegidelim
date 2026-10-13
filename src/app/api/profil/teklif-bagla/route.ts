// "Teklifimi göremiyorum": teklif numarasıyla bağlama talebi. Güvenlik için otomatik bağlamaz; satış ekibi kontrol edip
// admin'deki umre dosyasından "üyeye bağla" der. Talep Gelen Kutusu'na düşer.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uyeOturumu } from "@/lib/members/guard";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (!rateLimit(o.m.id, "teklif-bagla", 5, 60 * 60 * 1000).allowed) return NextResponse.json({ error: "Çok fazla talep; biraz sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const no = String(b.no ?? "").trim().toUpperCase().slice(0, 30);
  if (!/^TKF-\d{4}-\d{1,6}$/.test(no)) return NextResponse.json({ error: "Teklif numarasını TKF-2026-0001 biçiminde yazın." }, { status: 400 });
  await prisma.contactRequest.create({
    data: { name: o.m.name, phone: o.m.phone || "-", package: "Teklif bağlama talebi", message: `${no} numaralı teklifin hesabıma bağlanmasını istiyorum.\nÜye: ${o.m.email}` },
  });
  return NextResponse.json({ ok: true });
}
