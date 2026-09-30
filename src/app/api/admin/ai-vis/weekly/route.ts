import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAiVisAdmin } from "@/lib/seo/guard";
import { getWeeklyCap, isoWeek, loadWeeklyState, runWeeklyStep } from "@/lib/weekly-measure";

export const maxDuration = 300;

/** Haftalık otomatik ölçümün durumu ve harcama tavanı */
export async function GET() {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const [state, cap] = await Promise.all([loadWeeklyState(), getWeeklyCap()]);
  return NextResponse.json({ state, cap, currentWeek: isoWeek(), schedule: "Pazartesi, saatte bir (iş bitene kadar)" });
}

/** Tavanı değiştirir (0 = ölçüm kapalı) */
export async function POST(req: Request) {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const body = (await req.json()) as { cap?: number; action?: "run" };
  // Elle bir adım çalıştır (cron'la aynı kuyruk ve tavan; en fazla ~4 dk iş)
  if (body.action === "run") {
    const { state, message } = await runWeeklyStep();
    return NextResponse.json({ state, message });
  }
  const { cap } = body;
  if (typeof cap !== "number" || !Number.isFinite(cap) || cap < 0 || cap > 20) {
    return NextResponse.json({ error: "Tavan 0 ile 20 $ arasında olmalı." }, { status: 400 });
  }
  const value = String(Math.round(cap * 100) / 100);
  await prisma.setting.upsert({ where: { key: "WEEKLY_MEASURE_CAP_USD" }, update: { value }, create: { key: "WEEKLY_MEASURE_CAP_USD", value } });
  return NextResponse.json({ cap: Number(value) });
}
