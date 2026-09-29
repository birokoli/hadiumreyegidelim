import { readJson, writeJson } from "@/lib/seo/store";
import { addToDaily, analyzeRun, emptyDaily } from "./analyze";
import { cellKey, type AiVisConfig, type DailyStat, type Run } from "./types";

// Setting tablosunda JSON (SEO Masası ile aynı yaklaşım, şema değişikliği yok).
// Boyutu sınırlı tutmak için her soru × motor hücresinin yalnızca son iki yanıtı
// saklanır; zaman içindeki değişim günlük özetlerden okunur.
export const AI_KEYS = {
  config: "AI_VIS_CONFIG",
  cells: "AI_VIS_CELLS",
  daily: "AI_VIS_DAILY",
  readiness: "AI_VIS_READINESS",
} as const;

const DAILY_LIMIT = 180;

export const DEFAULT_CONFIG: AiVisConfig = {
  brand: {
    name: "Hadi Umreye Gidelim",
    aliases: ["Hadi Umre'ye Gidelim", "hadiumreyegidelim"],
    domains: ["hadiumreyegidelim.com"],
  },
  competitors: [],
  prompts: [],
  engines: ["chatgpt", "gemini", "perplexity", "google-ai-overview", "claude"],
};

/** hücre anahtarı → [son, önceki] */
export type Cells = Record<string, Run[]>;

export const loadConfig = () => readJson<AiVisConfig>(AI_KEYS.config, DEFAULT_CONFIG);
export const saveConfig = (c: AiVisConfig) => writeJson(AI_KEYS.config, c);
export const loadCells = () => readJson<Cells>(AI_KEYS.cells, {});
export const loadDaily = () => readJson<DailyStat[]>(AI_KEYS.daily, []);

export async function appendRuns(runs: Run[]) {
  const [config, cells, daily] = await Promise.all([loadConfig(), loadCells(), loadDaily()]);
  const byDate = new Map(daily.map((d) => [d.date, d]));
  for (const run of runs) {
    const key = cellKey(run.promptId, run.engine);
    cells[key] = [run, ...(cells[key] ?? []).filter((r) => r.id !== run.id)].slice(0, 2);
    if (run.status === "error") continue;
    const date = run.at.slice(0, 10);
    const day = byDate.get(date) ?? emptyDaily(date);
    addToDaily(day, run, analyzeRun(run, config));
    byDate.set(date, day);
  }
  const nextDaily = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-DAILY_LIMIT);
  await Promise.all([writeJson(AI_KEYS.cells, cells), writeJson(AI_KEYS.daily, nextDaily)]);
  return { cells, daily: nextDaily };
}

/** Silinen soruların hücrelerini temizler */
export async function pruneCells(promptIds: Set<string>) {
  const cells = await loadCells();
  let changed = false;
  for (const key of Object.keys(cells)) {
    if (!promptIds.has(key.split("::")[0])) {
      delete cells[key];
      changed = true;
    }
  }
  if (changed) await writeJson(AI_KEYS.cells, cells);
}
