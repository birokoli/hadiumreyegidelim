// Ekranlardaki bütün sayılar buradaki saf fonksiyonlardan gelir (istemcide çalışır).
// Tanımlar limelit methodology ve Elmo report-metrics.ts ile aynı:
//  anılma oranı = markanın anıldığı yanıt / sayılabilir yanıt
//  ses payı     = marka anılması / (marka + takip edilen rakip anılmaları)
//  sıra         = liste yanıtlarında markanın ortalama maddesi
//  kaynak payı  = kaynaklar içinde bizim sitenin oranı

import { analyzeRun, type CitationKind, type RunAnalysis } from "./analyze";
import type { AiVisConfig, DailyStat, EngineId, Run } from "./types";

export type AnalyzedRun = Run & { a: RunAnalysis };

export function latestRuns(cells: Record<string, Run[]>, config: AiVisConfig): AnalyzedRun[] {
  const promptIds = new Set(config.prompts.map((p) => p.id));
  return Object.values(cells)
    .map((list) => list[0])
    .filter((r): r is Run => Boolean(r) && promptIds.has(r.promptId))
    .map((r) => ({ ...r, a: analyzeRun(r, config) }));
}

export function previousRuns(cells: Record<string, Run[]>, config: AiVisConfig): Map<string, AnalyzedRun> {
  const out = new Map<string, AnalyzedRun>();
  for (const list of Object.values(cells)) {
    const prev = list[1];
    if (prev) out.set(`${prev.promptId}::${prev.engine}`, { ...prev, a: analyzeRun(prev, config) });
  }
  return out;
}

const pct = (num: number, den: number) => (den === 0 ? null : num / den);

export type Summary = {
  n: number;
  visibility: number | null;
  sov: number | null;
  avgPosition: number | null;
  positionN: number;
  citationShare: number | null;
  citationN: number;
  noSurface: number;
  errors: number;
  branded: number;
};

export function summarize(runs: AnalyzedRun[]): Summary {
  const countable = runs.filter((r) => r.a.countable);
  const mentioned = countable.filter((r) => r.a.brandMentioned).length;
  const compMentions = countable.reduce((s, r) => s + r.a.competitorsMentioned.length, 0);
  const positions = countable.map((r) => r.a.brandPosition).filter((p): p is number => p != null);
  const cites = countable.flatMap((r) => r.a.citations);
  return {
    n: countable.length,
    visibility: pct(mentioned, countable.length),
    sov: pct(mentioned, mentioned + compMentions),
    avgPosition: positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null,
    positionN: positions.length,
    citationShare: pct(cites.filter((c) => c.kind === "own").length, cites.length),
    citationN: cites.length,
    noSurface: runs.filter((r) => r.status === "no_surface").length,
    errors: runs.filter((r) => r.status === "error").length,
    branded: runs.filter((r) => r.a.branded && r.status === "ok").length,
  };
}

export function byEngine(runs: AnalyzedRun[], engines: EngineId[]) {
  return engines.map((engine) => ({ engine, ...summarize(runs.filter((r) => r.engine === engine)) }));
}

/** Günlük özetlerden anılma oranı serisi ve son 7 gün / önceki 7 gün sapması */
export function trend(daily: DailyStat[], days = 30) {
  const series = daily.slice(-days).map((d) => ({ date: d.date, visibility: pct(d.mentioned, d.eligible), n: d.eligible }));
  const window = (from: number, to: number) => {
    const cut = (offset: number) => {
      const t = new Date();
      t.setDate(t.getDate() - offset);
      return t.toISOString().slice(0, 10);
    };
    const slice = daily.filter((d) => d.date > cut(to) && d.date <= cut(from));
    const e = slice.reduce((s, d) => s + d.eligible, 0);
    return { visibility: pct(slice.reduce((s, d) => s + d.mentioned, 0), e), n: e };
  };
  return { series, last7: window(0, 7), prev7: window(7, 14) };
}

export function competitorBoard(runs: AnalyzedRun[], config: AiVisConfig) {
  const countable = runs.filter((r) => r.a.countable);
  const brandCount = countable.filter((r) => r.a.brandMentioned).length;
  const rows = [
    { name: config.brand.name, ours: true, count: brandCount },
    ...config.competitors.map((c) => ({
      name: c.name,
      ours: false,
      count: countable.filter((r) => r.a.competitorsMentioned.includes(c.name)).length,
    })),
  ];
  const total = rows.reduce((s, r) => s + r.count, 0);
  return rows
    .map((r) => ({ ...r, visibility: pct(r.count, countable.length), sov: pct(r.count, total) }))
    .sort((a, b) => b.count - a.count);
}

/** Rakiplerin anılıp bizim hiçbir motorda anılmadığımız sorular (Elmo: content gaps) */
export function contentGaps(runs: AnalyzedRun[], config: AiVisConfig) {
  return config.prompts
    .map((p) => {
      const pr = runs.filter((r) => r.promptId === p.id && r.a.countable);
      const competitors = [...new Set(pr.flatMap((r) => r.a.competitorsMentioned))];
      return { prompt: p, runs: pr.length, brandHit: pr.some((r) => r.a.brandMentioned), competitors };
    })
    .filter((g) => g.runs > 0 && !g.brandHit && g.competitors.length > 0)
    .sort((a, b) => b.competitors.length - a.competitors.length);
}

export function citationDomains(runs: AnalyzedRun[]) {
  const map = new Map<string, { domain: string; kind: CitationKind; owner?: string; count: number; prompts: Set<string>; engines: Set<EngineId> }>();
  for (const r of runs.filter((x) => x.status === "ok")) {
    for (const c of r.a.citations) {
      const row = map.get(c.domain) ?? { domain: c.domain, kind: c.kind, owner: c.owner, count: 0, prompts: new Set(), engines: new Set() };
      row.count++;
      row.prompts.add(r.promptId);
      row.engines.add(r.engine);
      map.set(c.domain, row);
    }
  }
  return [...map.values()].map((r) => ({ ...r, prompts: r.prompts.size, engines: [...r.engines] })).sort((a, b) => b.count - a.count);
}

/**
 * Kaynak fırsatları (geo-aeo-tracker "citation opportunities"): markanın anılmadığı
 * yanıtlarda kaynak gösterilen üçüncü taraf siteler. Bu sitelerde yer almak (içerik,
 * liste, forum yanıtı, basın) o yanıtlara girmenin en kısa yolu.
 */
export function citationOpportunities(runs: AnalyzedRun[]) {
  const map = new Map<string, { domain: string; kind: CitationKind; runs: number; withCompetitor: number; urls: Set<string>; prompts: Set<string> }>();
  for (const r of runs.filter((x) => x.a.countable && !x.a.brandMentioned)) {
    for (const c of r.a.citations) {
      if (c.kind === "own" || c.kind === "competitor") continue;
      const row = map.get(c.domain) ?? { domain: c.domain, kind: c.kind, runs: 0, withCompetitor: 0, urls: new Set(), prompts: new Set() };
      row.runs++;
      if (r.a.competitorsMentioned.length) row.withCompetitor++;
      row.urls.add(c.url);
      row.prompts.add(r.prompt);
      map.set(c.domain, row);
    }
  }
  return [...map.values()]
    .map((r) => ({ ...r, urls: [...r.urls].slice(0, 5), prompts: [...r.prompts].slice(0, 3) }))
    .sort((a, b) => b.withCompetitor - a.withCompetitor || b.runs - a.runs);
}

/** AI'ın yanıt öncesi yaptığı web aramaları (fan-out) ve o yanıtta sitemizin kaynak olup olmadığı */
export function fanOutQueries(runs: AnalyzedRun[]) {
  const map = new Map<string, { query: string; count: number; ownCited: number; engines: Set<EngineId> }>();
  for (const r of runs.filter((x) => x.status === "ok")) {
    const own = r.a.citations.some((c) => c.kind === "own");
    for (const q of r.queries) {
      const key = q.toLocaleLowerCase("tr").trim();
      if (key.length < 3) continue;
      const row = map.get(key) ?? { query: q.trim(), count: 0, ownCited: 0, engines: new Set() };
      row.count++;
      if (own) row.ownCited++;
      row.engines.add(r.engine);
      map.set(key, row);
    }
  }
  return [...map.values()].map((r) => ({ ...r, engines: [...r.engines] })).sort((a, b) => b.count - a.count);
}

export function toCsv(runs: AnalyzedRun[]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["tarih", "motor", "soru", "durum", "markalı", "anıldı", "sıra", "anılan rakipler", "kaynaklar", "yanıt"];
  const rows = runs.map((r) => [
    r.at, r.engine, r.prompt, r.status, r.a.branded ? "evet" : "hayır", r.a.brandMentioned ? "evet" : "hayır",
    r.a.brandPosition ?? "", r.a.competitorsMentioned.join("; "), r.a.citations.map((c) => c.url).join(" "), r.text,
  ]);
  return [head, ...rows].map((row) => row.map(esc).join(",")).join("\n");
}
