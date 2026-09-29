// AI motorlarına tek bir soruyu sorar ve yanıt metni + kaynakları döndürür.
// DataForSEO uç noktaları ve yanıt ayrıştırma, Elmo'nun (MIT)
// packages/lib/src/providers/registry/dataforseo.ts ve text-extraction.ts
// dosyalarından uyarlandı. Claude doğrudan Anthropic API ile, web araması açık sorulur.

import Anthropic from "@anthropic-ai/sdk";
import { DataforseoError, dfsPost, isDataforseoConfigured } from "@/lib/seo/dataforseo";
import { normalizeDomain } from "./analyze";
import type { Citation, EngineId, Run } from "./types";

type EngineResult = Pick<Run, "status" | "text" | "citations" | "queries" | "cost" | "note">;

const TR = { location_code: 2792, language_code: "tr" };
const US = { location_code: 2840, language_code: "en" };
const MAX_PROMPT_CHARS = 500;
const MAX_TEXT = 6000;

export function availableEngines(): EngineId[] {
  const list: EngineId[] = [];
  if (isDataforseoConfigured()) list.push("chatgpt", "gemini", "perplexity", "google-ai-overview", "google-ai-mode");
  if (process.env.ANTHROPIC_API_KEY) list.push("claude");
  return list;
}

function citation(url: string | undefined | null, title?: string | null): Citation | null {
  if (!url || !/^https?:\/\//.test(url)) return null;
  return { url, title: (title ?? "").trim(), domain: normalizeDomain(url) };
}

function dedupe(list: (Citation | null)[]) {
  const seen = new Set<string>();
  return list.filter((c): c is Citation => {
    if (!c || seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

/** Türkiye konumu desteklenmeyen yüzeylerde ABD konumuna düşer ve bunu not eder */
async function withLocation<T>(call: (loc: typeof TR) => Promise<T>): Promise<{ value: T; note?: string }> {
  try {
    return { value: await call(TR) };
  } catch (e) {
    const unsupported = e instanceof DataforseoError && /location|language|konum|dil|40501|40503/i.test(e.message);
    if (!unsupported) throw e;
    return { value: await call(US), note: "Bu yüzey Türkiye konumunu desteklemiyor; ABD konumuyla soruldu." };
  }
}

// ─── DataForSEO: ChatGPT / Gemini tarayıcı ─────────────────────────────────

type ScraperResult = {
  markdown?: string | null;
  items?: { markdown?: string | null; sources?: { url?: string; title?: string }[] | null }[] | null;
  sources?: { url?: string; title?: string }[] | null;
  fan_out_queries?: string[] | null;
};

/**
 * Gemini kaynakları Vertex AI yönlendirme linki olarak gelir; gerçek adresi
 * yönlendirmeyi izleyerek çözeriz (Elmo ile aynı). Çözülemezse link kalır.
 */
async function resolveRedirect(url: string) {
  if (!/grounding-api-redirect|vertexaisearch/.test(url)) return url;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(5000) });
    return res.headers.get("location") || url;
  } catch {
    return url;
  }
}

async function runScraper(engine: "chatgpt" | "gemini", prompt: string): Promise<EngineResult> {
  const path =
    engine === "chatgpt"
      ? "/v3/ai_optimization/chat_gpt/llm_scraper/live/advanced"
      : "/v3/ai_optimization/gemini/llm_scraper/live/advanced";
  const { value, note } = await withLocation((loc) =>
    dfsPost<ScraperResult>(path, [{ keyword: prompt, ...loc, ...(engine === "chatgpt" ? { force_web_search: true } : {}) }]),
  );
  const r = value.result;
  const text =
    (r?.markdown?.trim() ||
      (r?.items ?? []).map((i) => i.markdown?.trim()).filter(Boolean).join("\n\n")) ?? "";
  const rawSources = [...(r?.sources ?? []), ...(r?.items ?? []).flatMap((i) => i.sources ?? [])];
  const resolved = await Promise.all(rawSources.map(async (s) => citation(s.url ? await resolveRedirect(s.url) : null, s.title)));
  return {
    status: text ? "ok" : "no_surface",
    text: text.slice(0, MAX_TEXT),
    citations: dedupe(resolved),
    queries: (r?.fan_out_queries ?? []).filter((q) => typeof q === "string" && q.trim()),
    cost: value.cost,
    note,
  };
}

// ─── DataForSEO: Perplexity (LLM Responses) ────────────────────────────────

type LlmResponsesResult = {
  items?: { type?: string; sections?: { text?: string | null; annotations?: { url?: string; title?: string }[] | null }[] | null }[] | null;
  fan_out_queries?: string[] | null;
};

async function runPerplexity(prompt: string): Promise<EngineResult> {
  const { result, cost } = await dfsPost<LlmResponsesResult>("/v3/ai_optimization/perplexity/llm_responses/live", [
    { user_prompt: prompt, model_name: "sonar", web_search: true },
  ]);
  const items = (result?.items ?? []).filter((i) => i.type !== "reasoning");
  const sections = items.flatMap((i) => i.sections ?? []);
  const text = sections.map((s) => s.text?.trim()).filter(Boolean).join("\n");
  return {
    status: text ? "ok" : "no_surface",
    text: text.slice(0, MAX_TEXT),
    citations: dedupe(sections.flatMap((s) => s.annotations ?? []).map((a) => citation(a.url, a.title))),
    queries: (result?.fan_out_queries ?? []).filter(Boolean),
    cost,
  };
}

// ─── DataForSEO: Google AI Overview / AI Mode ──────────────────────────────

type SerpResult = {
  items?: { type?: string; markdown?: string | null; references?: { url?: string; title?: string }[] | null }[] | null;
};

async function runGoogle(engine: "google-ai-overview" | "google-ai-mode", prompt: string): Promise<EngineResult> {
  const path = engine === "google-ai-overview" ? "/v3/serp/google/organic/live/advanced" : "/v3/serp/google/ai_mode/live/advanced";
  const { value, note } = await withLocation((loc) =>
    dfsPost<SerpResult>(path, [
      {
        keyword: prompt,
        ...loc,
        depth: 10,
        // AI Overview talep üzerine üretilir; bu olmadan çoğu zaman boş döner (Elmo notu)
        ...(engine === "google-ai-overview" ? { load_async_ai_overview: true } : {}),
      },
    ]),
  );
  const overview = (value.result?.items ?? []).find((i) => i.type === "ai_overview");
  if (!overview?.markdown?.trim()) {
    // Google bu soru için AI yanıtı göstermedi: ıskalama değil, yüzey yok
    return { status: "no_surface", text: "", citations: [], queries: [], cost: value.cost, note };
  }
  return {
    status: "ok",
    text: overview.markdown.trim().slice(0, MAX_TEXT),
    citations: dedupe((overview.references ?? []).map((r) => citation(r.url, r.title))),
    queries: [],
    cost: value.cost,
    note,
  };
}

// ─── Claude (Anthropic API, web araması) ───────────────────────────────────

async function runClaude(prompt: string): Promise<EngineResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  const tools: Anthropic.ToolUnion[] = [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: 5,
      user_location: { type: "approximate", country: "TR" },
    },
  ];

  let final: Anthropic.Message | null = null;
  const blocks: Anthropic.ContentBlock[] = [];
  // Uzun süren sunucu aracı turu pause_turn ile durabilir; en fazla 3 kez devam ettir
  for (let i = 0; i < 4; i++) {
    const params = {
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      tools,
      messages,
      // Güvenlik sınıflandırıcısı reddederse istek sunucu tarafında önerilen modele düşer
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    };
    // SDK 0.90 tipleri `fallbacks` alanını henüz tanımıyor; gövde olduğu gibi iletilir
    final = (await client.beta.messages.create(params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming)) as unknown as Anthropic.Message;
    blocks.push(...final.content);
    if (final.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: final.content });
  }

  if (final?.stop_reason === "refusal") {
    return { status: "error", text: "", citations: [], queries: [], cost: 0, note: "Claude bu soruyu yanıtlamayı reddetti." };
  }

  const text = blocks
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  const cited = blocks
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .flatMap((b) => b.citations ?? [])
    .map((c) => ("url" in c ? citation(c.url, "title" in c ? c.title : "") : null));
  const queries = blocks
    .filter((b) => b.type === "server_tool_use")
    .map((b) => {
      const input = (b as { input?: unknown }).input;
      return input && typeof input === "object" && "query" in input ? String((input as { query: unknown }).query) : "";
    })
    .filter(Boolean);

  return {
    status: text ? "ok" : "no_surface",
    text: text.slice(0, MAX_TEXT),
    citations: dedupe(cited),
    queries,
    cost: 0,
    note: "Claude maliyeti Anthropic hesabına yansır.",
  };
}

export async function runEngine(engine: EngineId, prompt: string): Promise<EngineResult> {
  const p = Array.from(prompt).slice(0, MAX_PROMPT_CHARS).join("");
  switch (engine) {
    case "chatgpt":
    case "gemini":
      return runScraper(engine, p);
    case "perplexity":
      return runPerplexity(p);
    case "google-ai-overview":
    case "google-ai-mode":
      return runGoogle(engine, p);
    case "claude":
      return runClaude(p);
  }
}
