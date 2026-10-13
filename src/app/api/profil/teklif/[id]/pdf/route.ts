// Teklif PDF'i (üye): yalnızca teklifi görebilen üye indirir.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderQuotationPdf } from "@/lib/quotation-pdf";
import { uyeOturumu } from "@/lib/members/guard";
import { memberCanSeeTeklif } from "@/lib/umre";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const { id } = await params;
  if (!(await memberCanSeeTeklif(id, o.m, o.dogrulandi))) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const q = await prisma.quotation.findUnique({ where: { id }, include: { items: { orderBy: { sortOrder: "asc" } } } });
  if (!q) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const settings = await prisma.companySettings.findFirst();
  const buffer = await renderQuotationPdf({
    quotationNo: q.quotationNo, customerName: q.customerName, adultsCount: q.adultsCount, childrenCount: q.childrenCount,
    travelDate: q.travelDate, startDate: q.startDate, margin: q.margin, usdRate: q.usdRate, notes: null, logoPath: settings?.logoPath ?? null,
    items: q.items.map((i) => ({ id: i.id, category: i.category, name: i.name, pricingType: i.pricingType, unitCostUsd: i.unitCostUsd, quantity: i.quantity, childPricePercent: i.childPricePercent, vehicleType: i.vehicleType, extraBedCount: i.extraBedCount, extraBedPriceUsd: i.extraBedPriceUsd })),
  });
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${q.quotationNo}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
