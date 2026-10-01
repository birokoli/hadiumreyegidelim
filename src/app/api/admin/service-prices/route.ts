// Aylık satış fiyatları (admin → Hizmet Kütüphanesi → Aylık fiyatlar). Yetki middleware'de ("orders").
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureCatalogSchema } from "@/lib/catalog/schema";
import { currentMonth, monthsFrom, revalidateCatalog } from "@/lib/catalog";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

async function guard() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  await ensureCatalogSchema();
  return null;
}

/** GET ?start=YYYY-MM&n=12 → { months, prices: [{ serviceId, month, variant, salePriceUsd }] } */
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const url = new URL(req.url);
  const start = MONTH_RE.test(url.searchParams.get("start") ?? "") ? url.searchParams.get("start")! : currentMonth();
  const n = Math.min(24, Math.max(1, Number(url.searchParams.get("n")) || 12));
  const months = monthsFrom(start, n);
  const prices = await prisma.servicePrice.findMany({
    where: { month: { in: months } },
    select: { serviceId: true, month: true, variant: true, salePriceUsd: true },
  });
  return NextResponse.json({ months, prices });
}

type Cell = { serviceId: string; month: string; variant?: string; salePriceUsd: number | null };

/** PUT { cells: Cell[] } → boş (null) hücre silinir, sayılar kaydedilir */
export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { cells?: Cell[] } | null;
  const cells = (body?.cells ?? []).filter((c) => c && typeof c.serviceId === "string" && MONTH_RE.test(c.month)).slice(0, 5000);
  let saved = 0, removed = 0;
  await prisma.$transaction(
    cells.map((c) => {
      const variant = (c.variant ?? "").trim();
      const where = { serviceId_month_variant: { serviceId: c.serviceId, month: c.month, variant } };
      if (c.salePriceUsd == null || Number.isNaN(Number(c.salePriceUsd)) || Number(c.salePriceUsd) <= 0) {
        removed++;
        return prisma.servicePrice.deleteMany({ where: { serviceId: c.serviceId, month: c.month, variant } });
      }
      saved++;
      const salePriceUsd = Math.round(Number(c.salePriceUsd) * 100) / 100;
      return prisma.servicePrice.upsert({ where, update: { salePriceUsd }, create: { serviceId: c.serviceId, month: c.month, variant, salePriceUsd } });
    }),
  );
  revalidateCatalog();
  return NextResponse.json({ ok: true, saved, removed });
}

/** POST { action: "copy", from: "YYYY-MM", to: "YYYY-MM", percent: 5, category? } → önceki ayı kopyala + %x artır */
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { action?: string; from?: string; to?: string; percent?: number; category?: string; overwrite?: boolean } | null;
  if (body?.action !== "copy" || !MONTH_RE.test(body.from ?? "") || !MONTH_RE.test(body.to ?? "") || body.from === body.to) {
    return NextResponse.json({ error: "Geçersiz istek: from, to (YYYY-MM) ve percent gerekli." }, { status: 400 });
  }
  const factor = 1 + Math.max(-50, Math.min(200, Number(body.percent) || 0)) / 100;
  const source = await prisma.servicePrice.findMany({
    where: { month: body.from, ...(body.category ? { service: { category: body.category } } : {}) },
    select: { serviceId: true, variant: true, salePriceUsd: true },
  });
  const existing = new Set(
    (await prisma.servicePrice.findMany({ where: { month: body.to }, select: { serviceId: true, variant: true } })).map((p) => `${p.serviceId}|${p.variant}`),
  );
  const todo = source.filter((p) => body.overwrite || !existing.has(`${p.serviceId}|${p.variant}`));
  await prisma.$transaction(
    todo.map((p) => {
      const salePriceUsd = Math.round(p.salePriceUsd * factor);
      return prisma.servicePrice.upsert({
        where: { serviceId_month_variant: { serviceId: p.serviceId, month: body.to!, variant: p.variant } },
        update: { salePriceUsd },
        create: { serviceId: p.serviceId, month: body.to!, variant: p.variant, salePriceUsd },
      });
    }),
  );
  revalidateCatalog();
  return NextResponse.json({ ok: true, copied: todo.length, skipped: source.length - todo.length });
}
