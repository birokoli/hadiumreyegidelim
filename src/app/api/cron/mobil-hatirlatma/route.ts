import { NextResponse } from "next/server";
import { hatirlatmalar } from "@/lib/mobil/hatirlatma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Elle tetikleme (CRON_SECRET ile). Günlük çalışma publish-scheduled içinden: src/lib/mobil/hatirlatma.ts */
export async function GET(request: Request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, bildirim: await hatirlatmalar() });
}
