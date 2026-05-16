import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { renderQuotationPdf } from '@/lib/quotation-pdf';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!quotation) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });

  const settings  = await prisma.companySettings.findFirst();
  const logoPath  = settings?.logoPath ?? null;

  const buffer = await renderQuotationPdf({
    quotationNo:   quotation.quotationNo,
    customerName:  quotation.customerName,
    adultsCount:   quotation.adultsCount,
    childrenCount: quotation.childrenCount,
    travelDate:    quotation.travelDate,
    startDate:     quotation.startDate,
    margin:        quotation.margin,
    usdRate:       quotation.usdRate,
    notes:         quotation.notes,
    logoPath,
    items: quotation.items.map(i => ({
      id:                i.id,
      category:          i.category,
      name:              i.name,
      pricingType:       i.pricingType,
      unitCostUsd:       i.unitCostUsd,
      quantity:          i.quantity,
      childPricePercent: i.childPricePercent,
      vehicleType:       i.vehicleType,
      extraBedCount:     i.extraBedCount,
      extraBedPriceUsd:  i.extraBedPriceUsd,
    })),
  });

  // Türkçe karakterleri normalize et (dosya adı için)
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '');

  const slug     = normalize(quotation.customerName || 'Teklif');
  const filename = `hadiumreyegidelim_com-Fiyat-Teklifi-${slug}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      buffer.length.toString(),
    },
  });
}
