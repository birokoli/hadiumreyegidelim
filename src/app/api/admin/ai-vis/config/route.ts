import { NextResponse } from "next/server";
import { loadConfig, pruneCells, saveConfig } from "@/lib/ai-vis/store";
import { ENGINE_IDS, type AiVisConfig, type EngineId, type Subject } from "@/lib/ai-vis/types";
import { requireAiVisAdmin } from "@/lib/seo/guard";

const MAX_PROMPTS = 60;
const MAX_COMPETITORS = 10;

const clean = (s: unknown, max = 300) => String(s ?? "").trim().slice(0, max);
const list = (v: unknown, max = 10) => (Array.isArray(v) ? v.map((x) => clean(x, 120)).filter(Boolean).slice(0, max) : []);

function subject(v: unknown): Subject | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const name = clean(o.name, 80);
  if (!name) return null;
  return { name, aliases: list(o.aliases), domains: list(o.domains) };
}

export async function PUT(req: Request) {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;
  const body = (await req.json()) as Partial<AiVisConfig>;
  const current = await loadConfig();

  const brand = subject(body.brand) ?? current.brand;
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.map(subject).filter((c): c is Subject => Boolean(c)).slice(0, MAX_COMPETITORS)
    : current.competitors;
  const prompts = Array.isArray(body.prompts)
    ? body.prompts
        .map((p) => ({
          id: clean(p?.id, 40) || `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          text: clean(p?.text, 500),
          tags: list(p?.tags, 6),
          createdAt: clean(p?.createdAt, 40) || new Date().toISOString(),
        }))
        .filter((p) => p.text)
        .slice(0, MAX_PROMPTS)
    : current.prompts;
  if (Array.isArray(body.prompts) && body.prompts.length > MAX_PROMPTS) {
    return NextResponse.json({ error: `En fazla ${MAX_PROMPTS} soru takip edilebilir.` }, { status: 400 });
  }
  const engines = Array.isArray(body.engines)
    ? (body.engines.filter((e) => ENGINE_IDS.includes(e as EngineId)) as EngineId[])
    : current.engines;

  const next: AiVisConfig = { brand, competitors, prompts, engines };
  await saveConfig(next);
  await pruneCells(new Set(prompts.map((p) => p.id)));
  return NextResponse.json({ config: next });
}
