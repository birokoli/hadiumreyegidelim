import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeRun } from "@/lib/ai-vis/analyze";
import { availableEngines } from "@/lib/ai-vis/engines";
import type { Readiness } from "@/lib/ai-vis/readiness";
import { AI_KEYS, loadCells, loadConfig, loadDaily } from "@/lib/ai-vis/store";
import type { AuditReport } from "@/lib/seo/audit";
import { dfsAccount } from "@/lib/seo/dataforseo";
import { requireAiVisAdmin } from "@/lib/seo/guard";
import { readJson, SEO_KEYS } from "@/lib/seo/store";
import type { CompetitorSnapshot, TrackedKeyword } from "@/lib/seo/types";

export const maxDuration = 30;

type Probe = { ok: boolean; ms: number; detail?: unknown; error?: string };

async function probe(fn: () => Promise<unknown>): Promise<Probe> {
  const t = Date.now();
  try {
    return { ok: true, ms: Date.now() - t, detail: await fn() };
  } catch (e) {
    return { ok: false, ms: Date.now() - t, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Hata raporu için sunucu durumu. Hiçbir sır değeri dönmez: ortam değişkenleri
 * yalnızca "tanımlı mı" olarak, bağlantılar ücretsiz uç noktalarla test edilir.
 */
export async function GET() {
  const denied = await requireAiVisAdmin();
  if (denied) return denied;

  const has = (k: string) => Boolean(process.env[k]?.trim());
  const [db, dataforseo, anthropic] = await Promise.all([
    probe(() => prisma.setting.count()),
    probe(() => dfsAccount()),
    has("ANTHROPIC_API_KEY")
      ? probe(async () => {
          const m = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).models.retrieve("claude-opus-5");
          return { model: m.id };
        })
      : Promise.resolve<Probe>({ ok: false, ms: 0, error: "ANTHROPIC_API_KEY tanımlı değil" }),
  ]);

  const safe = async <T,>(fn: () => Promise<T>) => {
    try {
      return await fn();
    } catch (e) {
      return { readError: e instanceof Error ? e.message : String(e) } as unknown as T;
    }
  };

  const [audit, tracked, competitors, config, cells, daily, readiness] = await Promise.all([
    safe(() => readJson<AuditReport | null>(SEO_KEYS.audit, null)),
    safe(() => readJson<TrackedKeyword[]>(SEO_KEYS.tracked, [])),
    safe(() => readJson<{ domains: string[]; snapshot: CompetitorSnapshot | null }>(SEO_KEYS.competitors, { domains: [], snapshot: null })),
    safe(() => loadConfig()),
    safe(() => loadCells()),
    safe(() => loadDaily()),
    safe(() => readJson<Readiness | null>(AI_KEYS.readiness, null)),
  ]);

  const latest = Array.isArray(Object.values(cells ?? {})) ? Object.values(cells ?? {}).map((l) => l[0]).filter(Boolean) : [];
  const byEngine: Record<string, Record<string, number>> = {};
  for (const r of latest) {
    byEngine[r.engine] ??= { ok: 0, no_surface: 0, error: 0 };
    byEngine[r.engine][r.status]++;
  }

  return NextResponse.json({
    app: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "yerel",
      env: process.env.VERCEL_ENV ?? "development",
      region: process.env.VERCEL_REGION ?? null,
      serverTime: new Date().toISOString(),
    },
    envVars: {
      DATABASE_URL: has("DATABASE_URL"),
      DATAFORSEO_LOGIN: has("DATAFORSEO_LOGIN"),
      DATAFORSEO_PASSWORD: has("DATAFORSEO_PASSWORD"),
      DATAFORSEO_API_KEY: has("DATAFORSEO_API_KEY"),
      ANTHROPIC_API_KEY: has("ANTHROPIC_API_KEY"),
    },
    probes: { database: db, dataforseo, anthropic },
    seo: {
      audit: audit && "score" in audit
        ? { score: audit.score, finishedAt: audit.finishedAt, pageCount: audit.pageCount, issues: audit.issues.map((i) => ({ code: i.code, severity: i.severity, count: i.pages.length, sample: i.pages.slice(0, 3) })) }
        : audit,
      trackedKeywords: Array.isArray(tracked)
        ? { count: tracked.length, neverChecked: tracked.filter((t) => !t.history.length).length, lastCheck: tracked.flatMap((t) => t.history.map((h) => h.date)).sort().at(-1) ?? null }
        : tracked,
      competitors: competitors && "domains" in competitors
        ? { domains: competitors.domains, checkedAt: competitors.snapshot?.checkedAt ?? null, backlinkError: competitors.snapshot?.backlinkError ?? null }
        : competitors,
    },
    ai: config && "prompts" in config
      ? {
          availableEngines: availableEngines(),
          selectedEngines: config.engines,
          prompts: config.prompts.length,
          competitors: config.competitors.map((c) => c.name),
          latestByEngine: byEngine,
          failedRuns: latest
            .filter((r) => r.status === "error")
            .map((r) => ({ engine: r.engine, prompt: r.prompt, at: r.at, error: r.error, note: r.note })),
          notes: [...new Set(latest.map((r) => r.note).filter(Boolean))],
          sampleOk: latest
            .filter((r) => r.status === "ok")
            .slice(0, 3)
            .map((r) => {
              const a = analyzeRun(r, config);
              return { engine: r.engine, prompt: r.prompt, brandMentioned: a.brandMentioned, citations: r.citations.length, textStart: r.text.slice(0, 160) };
            }),
          dailyDays: Array.isArray(daily) ? daily.length : daily,
          readiness: readiness && "score" in readiness ? { score: readiness.score, checkedAt: readiness.checkedAt } : readiness,
        }
      : config,
  });
}
