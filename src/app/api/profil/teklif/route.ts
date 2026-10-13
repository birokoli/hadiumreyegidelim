// Müşteri teklifi profilinden onaylar: teklif "kabul edildi" olur, satış ekibine Gelen Kutusu'nda talep düşer.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uyeOturumu } from "@/lib/members/guard";
import { memberCanSeeTeklif } from "@/lib/umre";

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(b.id ?? "");
  if (!(await memberCanSeeTeklif(id, o.m, o.dogrulandi))) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
  const q = await prisma.quotation.findUnique({ where: { id } });
  if (!q) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
  if (q.status === "rejected" || q.status === "expired") return NextResponse.json({ error: "Bu teklifin süresi dolmuş; yeni teklif için bize yazın." }, { status: 400 });
  if (q.status !== "accepted") await prisma.quotation.update({ where: { id }, data: { status: "accepted" } });
  await prisma.contactRequest.create({
    data: { name: o.m.name, phone: o.m.phone || q.customerPhone || "-", package: "Teklif onayı", message: `${q.quotationNo} numaralı teklif müşteri tarafından profilden onaylandı.\nÜye: ${o.m.email}` },
  });
  return NextResponse.json({ ok: true });
}
