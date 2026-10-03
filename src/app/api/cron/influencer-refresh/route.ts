import { NextResponse } from "next/server";
import { refreshStale } from "@/lib/influencer/prospects";
import { metaConfigured } from "@/lib/influencer/meta";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron (vercel.json, her gün 04:30 UTC): ölçümü 7 günden eski Instagram adaylarından 15 tanesini yeniler. */
export async function GET(request: Request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!metaConfigured()) return NextResponse.json({ success: true, skipped: true, message: "Meta bağlantısı tanımlı değil." });
  const refreshed = await refreshStale(15);
  return NextResponse.json({ success: true, refreshed });
}
