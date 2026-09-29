import { NextResponse } from "next/server";
import { runReadiness, type Readiness } from "@/lib/ai-vis/readiness";
import { AI_KEYS } from "@/lib/ai-vis/store";
import { requireAiVisAdmin } from "@/lib/seo/guard";
import { readJson, writeJson } from "@/lib/seo/store";

export const maxDuration = 60;

export async function GET() {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  return NextResponse.json({ readiness: await readJson<Readiness | null>(AI_KEYS.readiness, null) });
}

export async function POST() {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const readiness = await runReadiness();
  let saveError: string | null = null;
  try {
    await writeJson(AI_KEYS.readiness, readiness);
  } catch (e) {
    console.error("[ai-vis] hazırlık kaydedilemedi", e);
    saveError = "Denetim tamamlandı ama veritabanına kaydedilemedi.";
  }
  return NextResponse.json({ readiness, saveError });
}
