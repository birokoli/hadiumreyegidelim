import { NextResponse } from "next/server";
import { availableEngines, runEngine } from "@/lib/ai-vis/engines";
import { loadConfig } from "@/lib/ai-vis/store";
import type { EngineId, Run } from "@/lib/ai-vis/types";
import { DataforseoError } from "@/lib/seo/dataforseo";
import { requireAiVisAdmin } from "@/lib/seo/guard";

// Tarayıcı tabanlı yüzeyler (ChatGPT, Gemini) tek soruda 30–90 sn sürebilir.
// Bu yüzden her istek tek bir soru × motor çalıştırır; sırayı istemci yönetir.
export const maxDuration = 300;

export async function POST(req: Request) {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const { promptId, engine } = (await req.json()) as { promptId?: string; engine?: EngineId };
  const config = await loadConfig();
  const prompt = config.prompts.find((p) => p.id === promptId);
  if (!prompt || !engine) return NextResponse.json({ error: "Soru ya da motor bulunamadı." }, { status: 400 });
  if (!availableEngines().includes(engine)) {
    return NextResponse.json({ error: `${engine} için API bilgisi tanımlı değil.` }, { status: 412 });
  }

  const base = { id: `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, promptId: prompt.id, prompt: prompt.text, engine, at: new Date().toISOString() };
  try {
    const result = await runEngine(engine, prompt.text);
    const run: Run = { ...base, ...result };
    return NextResponse.json({ run });
  } catch (e) {
    const message = e instanceof DataforseoError || e instanceof Error ? e.message : String(e);
    console.error("[ai-vis]", engine, message);
    const run: Run = { ...base, status: "error", error: message, text: "", citations: [], queries: [], cost: 0 };
    return NextResponse.json({ run });
  }
}
