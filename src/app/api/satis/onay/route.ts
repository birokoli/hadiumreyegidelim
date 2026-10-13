// Müşteri teklifi bağlantıdan onaylar (14 Ekim): dosya "Onaylandı" olur, geçmişe ve Gelen Kutusu'na düşer.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDosya, saveDosya, teklifSuresiDoldu } from "@/lib/satis";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(getClientIp(req), "teklif-onay", 10, 10 * 60 * 1000).allowed) return NextResponse.json({ error: "Çok fazla deneme." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const d = await getDosya("token", String(b.token ?? ""));
  if (!d) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
  if (d.status !== "talep" && d.status !== "teklif") return NextResponse.json({ ok: true });
  if (teklifSuresiDoldu(d.data.gecerlilik)) return NextResponse.json({ error: "Teklifin geçerlilik süresi dolmuş; güncel fiyat için WhatsApp'tan yazın." }, { status: 400 });
  await saveDosya(d.id, { status: "onaylandi" }, "Müşteri", "Müşteri teklifi bağlantıdan onayladı");
  await prisma.contactRequest.create({ data: { name: d.data.musteriAdi, phone: d.phone || "-", package: "Teklif onayı", message: `${d.no} numaralı dosyanın teklifi müşteri tarafından onaylandı. Satış masasından ödeme ve sonraki adımlar.` } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
