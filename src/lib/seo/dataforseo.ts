// DataForSEO istemcisi. Uç noktalar ve istek gövdeleri every-app/open-seo
// (MIT) içindeki src/server/lib/dataforseo/* dosyalarından uyarlandı.
// Anahtar yalnızca sunucuda okunur, istemciye hiçbir zaman gönderilmez.

import { DFS_LANGUAGE_CODE, DFS_LOCATION_CODE } from "./site";

const API_BASE = "https://api.dataforseo.com";
const TIMEOUT_MS = 60_000;

export class DataforseoError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "DataforseoError";
  }
}

/** DATAFORSEO_API_KEY (base64 "login:password", open-seo ile aynı) ya da DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD */
function authHeader(): string | null {
  const key = process.env.DATAFORSEO_API_KEY?.trim();
  if (key) return `Basic ${key}`;
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (login && password) return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
  return null;
}

export function isDataforseoConfigured() {
  return authHeader() !== null;
}

type Task<T> = {
  status_code: number;
  status_message: string;
  cost?: number;
  result?: T[] | null;
};

type Envelope<T> = {
  status_code: number;
  status_message: string;
  cost?: number;
  tasks?: Task<T>[];
};

export type DfsResult<T> = { data: T; cost: number };

const MAX_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 600;

/** DataForSEO görev hata kodları: 5xxxx sunucu tarafı (geçici), 40xxx istek/hesap sorunu */
function explainTaskError(code: number, message: string) {
  if (code >= 50000) return `DataForSEO kendi tarafında hata verdi (${code} ${message}). Birkaç dakika sonra tekrar deneyin; bu sorgu için ücret kesilmedi.`;
  if (code === 40104 || code === 40105) return `DataForSEO hesabı doğrulanmamış ya da bu API için izin yok (${code} ${message}). DataForSEO panelinde hesap doğrulamasını tamamlayın.`;
  if (code === 40200 || code === 40210) return `DataForSEO bakiyesi yetersiz (${code}).`;
  return `DataForSEO: ${message} (${code})`;
}

export async function dfsPost<T>(path: string, body: unknown[]): Promise<{ result: T | null; cost: number }> {
  const auth = authHeader();
  if (!auth) throw new DataforseoError("DataForSEO bağlı değil.", 412);

  // open-seo ile aynı yaklaşım: geçici 5xx hatalarında kısa bekleyip yeniden dene
  let lastError: DataforseoError | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * (attempt - 1)));

    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (res.status === 401) throw new DataforseoError("DataForSEO giriş bilgileri geçersiz.", 401);
    if (res.status === 402) throw new DataforseoError("DataForSEO bakiyesi yetersiz.", 402);

    // 5xx yanıtında da gövde çoğu zaman aynı zarf biçiminde gelir; görev kodunu oradan oku
    const json = (await res.json().catch(() => null)) as Envelope<T> | null;
    const task = json?.tasks?.[0];

    if (task && (task.status_code === 20000 || task.status_code === 40102)) {
      // 40102 = "no search results": hata değil, boş sonuç
      return { result: task.result?.[0] ?? null, cost: task.cost ?? json?.cost ?? 0 };
    }

    const code = task?.status_code ?? res.status;
    const message = task?.status_message ?? json?.status_message ?? `HTTP ${res.status}`;
    lastError = new DataforseoError(explainTaskError(code, message), code >= 50000 ? 502 : code);
    const transient = res.status >= 500 || code >= 50000;
    if (!transient) throw lastError;
  }
  throw lastError!;
}

// ─── Anahtar kelime araştırması ──────────────────────────────────────────

type LabsKeywordData = {
  keyword?: string;
  keyword_info?: {
    search_volume?: number | null;
    cpc?: number | null;
    competition_level?: string | null;
    monthly_searches?: { year: number; month: number; search_volume: number | null }[] | null;
  } | null;
  keyword_properties?: { keyword_difficulty?: number | null } | null;
  search_intent_info?: { main_intent?: string | null } | null;
};

export type KeywordRow = {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  difficulty: number | null;
  intent: string | null;
  trend: number[];
};

function toKeywordRow(item: LabsKeywordData): KeywordRow | null {
  if (!item.keyword) return null;
  const months = [...(item.keyword_info?.monthly_searches ?? [])]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .slice(-12)
    .map((m) => m.search_volume ?? 0);
  return {
    keyword: item.keyword,
    volume: item.keyword_info?.search_volume ?? null,
    cpc: item.keyword_info?.cpc ?? null,
    difficulty: item.keyword_properties?.keyword_difficulty ?? null,
    intent: item.search_intent_info?.main_intent ?? null,
    trend: months,
  };
}

const byVolume = (rows: KeywordRow[]) => [...rows].sort((a, b) => (b.volume ?? -1) - (a.volume ?? -1));

export async function keywordResearch(
  seed: string,
  mode: "suggestions" | "related",
  limit = 100,
): Promise<DfsResult<KeywordRow[]>> {
  if (mode === "related") {
    const { result, cost } = await dfsPost<{ items?: { keyword_data?: LabsKeywordData }[] }>(
      "/v3/dataforseo_labs/google/related_keywords/live",
      [{ keyword: seed, location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE, limit, depth: 2, include_serp_info: false }],
    );
    const rows = (result?.items ?? []).map((i) => toKeywordRow(i.keyword_data ?? {})).filter(Boolean) as KeywordRow[];
    return { data: byVolume(rows), cost };
  }

  const { result, cost } = await dfsPost<{ items?: LabsKeywordData[] }>(
    "/v3/dataforseo_labs/google/keyword_suggestions/live",
    [{
      keyword: seed,
      location_code: DFS_LOCATION_CODE,
      language_code: DFS_LANGUAGE_CODE,
      limit,
      include_seed_keyword: true,
      include_serp_info: false,
    }],
  );
  const rows = (result?.items ?? []).map(toKeywordRow).filter(Boolean) as KeywordRow[];
  return { data: byVolume(rows), cost };
}

/** Google Ads hacimleri; tek istekte 1000 kelimeye kadar. */
export async function searchVolumes(keywords: string[]): Promise<DfsResult<Record<string, number | null>>> {
  const auth = authHeader();
  if (!auth) throw new DataforseoError("DataForSEO bağlı değil.", 412);
  const res = await fetch(`${API_BASE}/v3/keywords_data/google_ads/search_volume/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([{ keywords: keywords.slice(0, 1000), location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE }]),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new DataforseoError(`DataForSEO ${res.status}`, res.status);
  const json = (await res.json()) as Envelope<{ keyword: string; search_volume: number | null }>;
  const task = json.tasks?.[0];
  if (!task || task.status_code !== 20000) throw new DataforseoError(task?.status_message || "Hacim alınamadı.");
  const map: Record<string, number | null> = {};
  for (const row of task.result ?? []) map[row.keyword] = row.search_volume;
  return { data: map, cost: task.cost ?? 0 };
}

// ─── SERP / sıra takibi ─────────────────────────────────────────────────

export type SerpCheck = {
  position: number | null;
  url: string | null;
  topThree: { position: number; domain: string; title: string }[];
};

export async function checkSerpPosition(keyword: string, domain: string): Promise<DfsResult<SerpCheck>> {
  const { result, cost } = await dfsPost<{
    items?: { type: string; rank_group?: number; domain?: string; url?: string; title?: string }[];
  }>("/v3/serp/google/organic/live/advanced", [
    { keyword, location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE, depth: 50, device: "mobile" },
  ]);
  const organic = (result?.items ?? []).filter((i) => i.type === "organic");
  const ours = organic.find((i) => (i.domain ?? "").replace(/^www\./, "").endsWith(domain));
  return {
    data: {
      position: ours?.rank_group ?? null,
      url: ours?.url ?? null,
      topThree: organic.slice(0, 3).map((i) => ({
        position: i.rank_group ?? 0,
        domain: (i.domain ?? "").replace(/^www\./, ""),
        title: i.title ?? "",
      })),
    },
    cost,
  };
}

// ─── Alan adı görünümü ──────────────────────────────────────────────────

export type DomainOverview = {
  domain: string;
  keywords: number | null;
  etv: number | null;
  top3: number | null;
  top10: number | null;
};

export async function domainOverview(domain: string): Promise<DfsResult<DomainOverview>> {
  const { result, cost } = await dfsPost<{
    items?: { metrics?: { organic?: { count?: number; etv?: number; pos_1?: number; pos_2_3?: number; pos_4_10?: number } } }[];
  }>("/v3/dataforseo_labs/google/domain_rank_overview/live", [
    { target: domain, location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE },
  ]);
  const o = result?.items?.[0]?.metrics?.organic;
  const top3 = o ? (o.pos_1 ?? 0) + (o.pos_2_3 ?? 0) : null;
  return {
    data: {
      domain,
      keywords: o?.count ?? null,
      etv: o?.etv ?? null,
      top3,
      top10: o && top3 !== null ? top3 + (o.pos_4_10 ?? 0) : null,
    },
    cost,
  };
}

export type RankedKeyword = { keyword: string; position: number; volume: number | null; url: string; etv: number | null };

export async function rankedKeywords(domain: string, limit = 25): Promise<DfsResult<RankedKeyword[]>> {
  const { result, cost } = await dfsPost<{
    items?: {
      keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number | null } };
      ranked_serp_element?: { serp_item?: { rank_group?: number; url?: string; etv?: number | null } };
    }[];
  }>("/v3/dataforseo_labs/google/ranked_keywords/live", [
    {
      target: domain,
      location_code: DFS_LOCATION_CODE,
      language_code: DFS_LANGUAGE_CODE,
      limit,
      order_by: ["ranked_serp_element.serp_item.etv,desc"],
    },
  ]);
  const rows = (result?.items ?? []).map((i) => ({
    keyword: i.keyword_data?.keyword ?? "",
    position: i.ranked_serp_element?.serp_item?.rank_group ?? 0,
    volume: i.keyword_data?.keyword_info?.search_volume ?? null,
    url: i.ranked_serp_element?.serp_item?.url ?? "",
    etv: i.ranked_serp_element?.serp_item?.etv ?? null,
  }));
  return { data: rows.filter((r) => r.keyword), cost };
}

export type BacklinkSummary = { backlinks: number | null; referringDomains: number | null; rank: number | null };

/** Backlinks API DataForSEO'da ayrı abonelik ister; yoksa DataforseoError fırlatır. */
export async function backlinkSummary(domain: string): Promise<DfsResult<BacklinkSummary>> {
  const { result, cost } = await dfsPost<{ backlinks?: number; referring_domains?: number; rank?: number }>(
    "/v3/backlinks/summary/live",
    [{ target: domain, include_subdomains: true }],
  );
  return {
    data: {
      backlinks: result?.backlinks ?? null,
      referringDomains: result?.referring_domains ?? null,
      rank: result?.rank ?? null,
    },
    cost,
  };
}

// ─── Hesap bilgisi (ücretsiz) ────────────────────────────────────────────

export type DfsAccount = { login: string | null; balance: number | null; total: number | null; spentToday: Record<string, unknown> | null };

/** GET /v3/appendix/user_data: ücretsiz; bakiye ve günlük harcama (open-seo appendix.ts ile aynı uç nokta) */
export async function dfsAccount(): Promise<DfsAccount> {
  const auth = authHeader();
  if (!auth) throw new DataforseoError("DataForSEO bağlı değil.", 412);
  const res = await fetch(`${API_BASE}/v3/appendix/user_data`, {
    headers: { Authorization: auth },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (res.status === 401) throw new DataforseoError("DataForSEO giriş bilgileri geçersiz.", 401);
  const json = (await res.json().catch(() => null)) as Envelope<{
    login?: string;
    money?: { balance?: number; total?: number; statistics?: { day?: Record<string, unknown> } };
  }> | null;
  const task = json?.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new DataforseoError(explainTaskError(task?.status_code ?? res.status, task?.status_message ?? json?.status_message ?? `HTTP ${res.status}`), task?.status_code);
  }
  const r = task.result?.[0];
  return { login: r?.login ?? null, balance: r?.money?.balance ?? null, total: r?.money?.total ?? null, spentToday: r?.money?.statistics?.day ?? null };
}
