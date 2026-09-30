import { NextResponse } from "next/server";
import { runWeeklyStep } from "@/lib/weekly-measure";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel cron: pazartesi günleri saatte bir. Hafta bittiyse hemen döner (maliyetsiz).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { state, message } = await runWeeklyStep();
    return NextResponse.json({ ok: true, message, week: state.week, done: state.done, total: state.total, spent: state.spent });
  } catch (e) {
    console.error("[weekly-measure]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Ölçüm hatası" }, { status: 500 });
  }
}
