// Haftalık otomatik ölçüm: takip edilen kelimelerin Google sırası + AI Görünürlük soruları
// bütün açık motorlarda. Vercel fonksiyonu en fazla 300 sn çalıştığı için iş bir kuyruğa
// bölünür; cron pazartesi günleri saatte bir çağırır, her çağrı kaldığı yerden devam eder.
// Her iş öncesi harcama tavanı (varsayılan 2 $/hafta) kontrol edilir; tavan aşılacaksa durur.

import { availableEngines, runEngine } from "@/lib/ai-vis/engines";
import { appendRuns, loadCells, loadConfig } from "@/lib/ai-vis/store";
import type { EngineId, Run } from "@/lib/ai-vis/types";
import { checkSerpPosition } from "@/lib/seo/dataforseo";
import { SITE_DOMAIN } from "@/lib/seo/site";
import { readJson, SEO_KEYS, writeJson } from "@/lib/seo/store";
import type { TrackedKeyword } from "@/lib/seo/types";
import { prisma } from "@/lib/prisma";

const STATE_KEY = "WEEKLY_MEASURE_STATE";
const CAP_KEY = "WEEKLY_MEASURE_CAP_USD";
export const DEFAULT_WEEKLY_CAP = 2;
const TIME_BUDGET_MS = 230_000; // 300 sn sınırının altında kal (son yazım için pay)
const CONCURRENCY = 3;

// Geçmiş kayıt yoksa iş başına ihtiyatlı maliyet varsayımı (USD)
const DEFAULT_COST: Record<EngineId, number> = {
  chatgpt: 0.05,
  gemini: 0.05,
  perplexity: 0.03,
  "google-ai-overview": 0.01,
  "google-ai-mode": 0.02,
  claude: 0.25,
};
const RANK_CHECK_COST = 0.004;

type QueueItem = { promptId: string; engine: EngineId };

export type WeeklyState = {
  week: string;
  startedAt: string;
  queue: QueueItem[];
  total: number;
  done: number;
  errors: number;
  spent: number;
  ranksDone: boolean;
  capHit: boolean;
  finishedAt: string | null;
  lastRunAt: string | null;
};

/** ISO hafta anahtarı, ör. 2026-W40 */
export function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function getWeeklyCap() {
  const row = await prisma.setting.findUnique({ where: { key: CAP_KEY } }).catch(() => null);
  const n = row ? Number(row.value) : DEFAULT_WEEKLY_CAP;
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_WEEKLY_CAP;
}

export const loadWeeklyState = () => readJson<WeeklyState | null>(STATE_KEY, null);
const saveState = (s: WeeklyState) => writeJson(STATE_KEY, s);

/** Motor başına iş maliyeti tahmini: kayıtlı yanıtlarda görülen en yüksek maliyet */
async function costEstimates(): Promise<Record<EngineId, number>> {
  const cells = await loadCells();
  const est = { ...DEFAULT_COST };
  const seen: Partial<Record<EngineId, number>> = {};
  for (const runs of Object.values(cells)) {
    for (const r of runs) {
      if (r.status !== "error" && r.cost > 0) seen[r.engine] = Math.max(seen[r.engine] ?? 0, r.cost);
    }
  }
  for (const [engine, max] of Object.entries(seen) as [EngineId, number][]) est[engine] = max;
  return est;
}

async function newState(week: string): Promise<WeeklyState> {
  const config = await loadConfig();
  const engines = config.engines.filter((e) => availableEngines().includes(e));
  const queue = config.prompts.flatMap((p) => engines.map((engine) => ({ promptId: p.id, engine })));
  return { week, startedAt: new Date().toISOString(), queue, total: queue.length, done: 0, errors: 0, spent: 0, ranksDone: false, capHit: false, finishedAt: null, lastRunAt: null };
}

async function checkRanks(state: WeeklyState, cap: number) {
  const tracked = await readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []);
  const date = new Date().toISOString();
  for (const item of tracked) {
    if (state.spent + RANK_CHECK_COST > cap) {
      state.capHit = true;
      break;
    }
    try {
      const { data, cost } = await checkSerpPosition(item.keyword, SITE_DOMAIN);
      state.spent += cost;
      item.history = [...item.history, { date, position: data.position, url: data.url }].slice(-60);
      item.topThree = data.topThree;
    } catch (e) {
      state.errors++;
      // DataForSEO bağlı değilse hepsi aynı hatayı verir; sıra kontrolünü atla
      if (e instanceof Error && e.message.includes("bağlı değil")) break;
    }
  }
  await writeJson(SEO_KEYS.tracked, tracked);
  state.ranksDone = true;
}

/** Bir cron çağrısı: kuyruktan zaman ve bütçe elverdiğince iş yapar, durumu kaydeder */
export async function runWeeklyStep() {
  const started = Date.now();
  const week = isoWeek();
  const cap = await getWeeklyCap();
  let state = await loadWeeklyState();
  if (!state || state.week !== week) state = await newState(week);
  if (state.finishedAt) return { state, message: "Bu haftanın ölçümü tamamlandı." };

  state.lastRunAt = new Date().toISOString();

  if (!state.ranksDone) await checkRanks(state, cap);

  const config = await loadConfig();
  const prompts = new Map(config.prompts.map((p) => [p.id, p]));
  const est = await costEstimates();
  const runs: Run[] = [];

  const worker = async () => {
    while (state!.queue.length && !state!.capHit && Date.now() - started < TIME_BUDGET_MS) {
      const next = state!.queue[0];
      // Tavanı aşacak işe başlama (eş zamanlı işler için tahmini maliyet peşin ayrılır)
      if (state!.spent + est[next.engine] > cap) {
        state!.capHit = true;
        break;
      }
      state!.queue.shift();
      const prompt = prompts.get(next.promptId);
      if (!prompt) continue;
      state!.spent += est[next.engine];
      const base = { id: `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, promptId: prompt.id, prompt: prompt.text, engine: next.engine, at: new Date().toISOString() };
      try {
        const result = await runEngine(next.engine, prompt.text);
        runs.push({ ...base, ...result });
        state!.spent += (result.cost ?? 0) - est[next.engine];
      } catch (e) {
        state!.spent -= est[next.engine];
        state!.errors++;
        runs.push({ ...base, status: "error", error: e instanceof Error ? e.message : String(e), text: "", citations: [], queries: [], cost: 0 });
      }
      state!.done++;
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (runs.length) await appendRuns(runs);
  state.spent = Math.round(state.spent * 10000) / 10000;
  if (!state.queue.length || state.capHit) state.finishedAt = new Date().toISOString();
  await saveState(state);

  return {
    state,
    message: state.finishedAt
      ? state.capHit
        ? `Harcama tavanına (${cap} $) ulaşıldı; ${state.done}/${state.total} iş yapıldı.`
        : `Tamamlandı: ${state.done}/${state.total} iş, ${state.spent.toFixed(2)} $.`
      : `Devam ediyor: ${state.done}/${state.total} iş, ${state.spent.toFixed(2)} $.`,
  };
}
