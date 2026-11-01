// Influencer ayrıntısı (uygulama, web: /admin/influencers/[id]): kişi, kazanç özeti, eşik ve son satışlar.
// Satış ekleme / tamamlama / iade ve eşik değişikliği web paneliyle aynı uçlardan (/api/admin/influencers/[id]/…).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!yetkili(o, "marketing")) return NextResponse.json({ hata: "Yetkiniz yok." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const inf = await prisma.influencer.findUnique({ where: { id } });
  if (!inf) return NextResponse.json({ hata: "Influencer bulunamadı." }, { status: 404 });
  const satislar = await prisma.sale.findMany({ where: { influencerId: id }, orderBy: { createdAt: "desc" }, take: 60, include: { customer: { select: { fullName: true, phone: true } } } });
  return NextResponse.json({
    influencer: { id: inf.id, fullName: inf.fullName, email: inf.email, phone: inf.phone, instagramHandle: inf.instagramHandle, uniqueCode: inf.uniqueCode, tier: inf.tier, status: inf.status, totalSales: inf.totalSales, totalEarnings: inf.totalEarnings, pendingEarnings: inf.pendingEarnings, totalClicks: inf.totalClicks, baseThrOverride: inf.baseThrOverride },
    satislar: satislar.map((s) => ({ id: s.id, musteri: s.customer.fullName, telefon: s.customer.phone, paket: s.umrePackage, tutar: s.saleAmount, oran: s.commissionRate, komisyon: s.commissionAmount, durum: s.commissionStatus, tarih: s.saleDate, not: s.notes })),
  });
}
