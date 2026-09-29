import { NextResponse } from "next/server";
import { availableEngines } from "@/lib/ai-vis/engines";
import { AI_KEYS, loadCells, loadConfig, loadDaily } from "@/lib/ai-vis/store";
import type { Readiness } from "@/lib/ai-vis/readiness";
import { requireAiVisAdmin } from "@/lib/seo/guard";
import { readJson } from "@/lib/seo/store";

/** Bütün ekranlar için tek istek: ayarlar, son yanıtlar, günlük özetler, hazır motorlar */
export async function GET() {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const [config, cells, daily, readiness] = await Promise.all([
    loadConfig(),
    loadCells(),
    loadDaily(),
    readJson<Readiness | null>(AI_KEYS.readiness, null),
  ]);
  return NextResponse.json({
    config,
    cells,
    daily,
    available: availableEngines(),
    readiness: readiness && { score: readiness.score, checkedAt: readiness.checkedAt },
  });
}
