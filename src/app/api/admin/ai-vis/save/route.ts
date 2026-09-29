import { NextResponse } from "next/server";
import { appendRuns } from "@/lib/ai-vis/store";
import { ENGINE_IDS, type Run } from "@/lib/ai-vis/types";
import { requireAiVisAdmin } from "@/lib/seo/guard";

/** Çalıştırılan yanıtları kaydeder. İstemci kayıtları sırayla gönderir; eşzamanlı yazım olmaz. */
export async function POST(req: Request) {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const { runs } = (await req.json()) as { runs?: Run[] };
  const valid = (runs ?? []).filter((r) => r && r.id && r.promptId && ENGINE_IDS.includes(r.engine)).slice(0, 50);
  if (!valid.length) return NextResponse.json({ error: "Kaydedilecek yanıt yok." }, { status: 400 });
  const { cells, daily } = await appendRuns(valid);
  return NextResponse.json({ cells, daily });
}
