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

async function post<T>(path: string, body: unknown[]): Promise<{ result: T | null; cost: number }> {
  const auth = authHeader();
  if (!auth) throw new DataforseoError("DataForSEO bağlı değil.", 412);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401) throw new DataforseoError("DataForSEO giriş bilgileri geçersiz.", 401);
    if (res.status === 402) throw new DataforseoError("DataForSEO bakiyesi yetersiz.", 402);
    throw new DataforseoError(`DataForSEO ${res.status}: ${text.slice(0, 300)}`, res.status);
  }

  const json = (await res.json()) as Envelope<T>;
  const task = json.tasks?.[0];
  if (!task) throw new DataforseoError(json.status_message || "DataForSEO boş yanıt döndü.");
  // 20000 = ok, 40102 = "no search results" (hata değil, boş sonuç)
  if (task.status_code !== 20000 && task.status_code !== 40102) {
    throw new DataforseoError(`${task.status_message} (${task.status_code})`, task.status_code);
  }
  return { result: task.result?.[0] ?? null, cost: task.cost ?? json.cost ?? 0 };
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

export async function keywordResearch(
  seed: string,
  mode: "suggestions" | "related",
  limit = 100,
): Promise<DfsResult<KeywordRow[]>> {
  if (mode === "related") {
    const { result, cost } = await post<{ items?: { keyword_data?: LabsKeywordData }[] }>(
      "/v3/dataforseo_labs/google/related_keywords/live",
      [{ keyword: seed, location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE, limit, depth: 2, include_serp_info: false }],
    );
    const rows = (result?.items ?? []).map((i) => toKeywordRow(i.keyword_data ?? {})).filter(Boolean) as KeywordRow[];
    return { data: rows, cost };
  }

  const { result, cost } = await post<{ items?: LabsKeywordData[] }>(
    "/v3/dataforseo_labs/google/keyword_suggestions/live",
    [{
      keyword: seed,
      location_code: DFS_LOCATION_CODE,
      language_code: DFS_LANGUAGE_CODE,
      limit,
      include_seed_keyword: true,
      include_serp_info: false,
      order_by: ["keyword_info.search_volume,desc"],
    }],
  );
  const rows = (result?.items ?? []).map(toKeywordRow).filter(Boolean) as KeywordRow[];
  return { data: rows, cost };
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
  const { result, cost } = await post<{
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
  const { result, cost } = await post<{
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
  const { result, cost } = await post<{
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
  const { result, cost } = await post<{ backlinks?: number; referring_domains?: number; rank?: number }>(
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
