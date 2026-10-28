// Kampanya brief'i (27 Ekim): admin okur ve kaydeder; influencer panelinde kampanya sayfası bundan beslenir.
// Yetki: middleware /api/admin için imzalı admin oturumu ister.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BOS_BRIEF, getBrief, saveBrief } from '@/lib/marketing/brief';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ brief: (await getBrief(id)) ?? BOS_BRIEF });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await prisma.campaign.findUnique({ where: { id }, select: { id: true } }))) return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 });
  const { brief } = await req.json().catch(() => ({}));
  await saveBrief(id, brief);
  return NextResponse.json({ brief: await getBrief(id) });
}
