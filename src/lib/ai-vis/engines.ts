// AI motorlarına tek bir soruyu sorar ve yanıt metni + kaynakları döndürür.
// DataForSEO uç noktaları ve yanıt ayrıştırma, Elmo'nun (MIT)
// packages/lib/src/providers/registry/dataforseo.ts ve text-extraction.ts
// dosyalarından uyarlandı. Claude da (12 Ekim'den beri) DataForSEO LLM Responses ile, web araması açık sorulur.

import Anthropic from "@anthropic-ai/sdk";
import { DataforseoError, dfsPost, isDataforseoConfigured, withSeRetry } from "@/lib/seo/dataforseo";
import { normalizeDomain } from "./analyze";
import type { Citation, EngineId, Run } from "./types";

type EngineResult = Pick<Run, "status" | "text" | "citations" | "queries" | "cost" | "note">;

const TR = { location_code: 2792, language_code: "tr" };
const US = { location_code: 2840, language_code: "en" };
const MAX_PROMPT_CHARS = 500;
const MAX_TEXT = 6000;

export function availableEngines(): EngineId[] {
  const list: EngineId[] = [];
  // 12 Ekim: Claude da DataForSEO üzerinden soruluyor (Anthropic kredisi bitti, tek fatura).
  if (isDataforseoConfigured()) list.push("chatgpt", "gemini", "perplexity", "google-ai-overview", "google-ai-mode", "claude");
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
    // Web aramalı ChatGPT yanıtı 60 sn'yi aşabiliyor (1 Ekim: 3 zaman aşımı); ChatGPT için 120 sn
    // ChatGPT tek denemede 120 sn sürebildiği için 2 deneme (300 sn sınırı)
    withSeRetry(
      () => dfsPost<ScraperResult>(path, [{ keyword: prompt, ...loc, ...(engine === "chatgpt" ? { force_web_search: true } : {}) }], { timeoutMs: engine === "chatgpt" ? 120_000 : undefined }),
      engine === "chatgpt" ? 2 : 3,
    ),
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

async function runLlmResponses(llm: "perplexity" | "claude", model: string, prompt: string): Promise<EngineResult> {
  const { result, cost } = await withSeRetry(() =>
    dfsPost<LlmResponsesResult>(`/v3/ai_optimization/${llm}/llm_responses/live`, [{ user_prompt: prompt, model_name: model, web_search: true }]),
  );
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

const runPerplexity = (prompt: string) => runLlmResponses("perplexity", "sonar", prompt);
// Claude.ai'nin varsayılan modeline en yakın seçenek; DataForSEO model listesi: /v3/ai_optimization/claude/llm_responses/models
const runClaude = (prompt: string) => runLlmResponses("claude", "claude-sonnet-5", prompt);

// ─── DataForSEO: Google AI Overview / AI Mode ──────────────────────────────

type SerpResult = {
  items?: { type?: string; markdown?: string | null; references?: { url?: string; title?: string }[] | null }[] | null;
};

/** Google AI yanıtı tam yüklenmeden alınan yer tutucu metinler (ör. "`bilsis` :load{skill_names:[...]}") */
function isPlaceholder(markdown: string, referenceCount: number) {
  return /:load\{|skill_names/.test(markdown) || (referenceCount === 0 && markdown.length < 80);
}

async function runGoogle(engine: "google-ai-overview" | "google-ai-mode", prompt: string): Promise<EngineResult> {
  const path = engine === "google-ai-overview" ? "/v3/serp/google/organic/live/advanced" : "/v3/serp/google/ai_mode/live/advanced";
  const { value, note } = await withLocation((loc) =>
    withSeRetry(() =>
      dfsPost<SerpResult>(path, [
        {
          keyword: prompt,
          ...loc,
          // AI Mode uç noktası depth kabul etmiyor (40501 Invalid Field: 'depth')
          ...(engine === "google-ai-overview"
            ? {
                depth: 10,
                // AI Overview talep üzerine üretilir; bu olmadan çoğu zaman boş döner (Elmo notu)
                load_async_ai_overview: true,
              }
            : {}),
        },
      ]),
    ),
  );
  const overview = (value.result?.items ?? []).find((i) => i.type === "ai_overview");
  const markdown = overview?.markdown?.trim() ?? "";
  const references = overview?.references ?? [];
  if (!markdown) {
    // Google bu soru için AI yanıtı göstermedi: ıskalama değil, yüzey yok
    return { status: "no_surface", text: "", citations: [], queries: [], cost: value.cost, note };
  }
  if (isPlaceholder(markdown, references.length)) {
    return {
      status: "no_surface",
      text: "",
      citations: [],
      queries: [],
      cost: value.cost,
      note: [note, "Google'ın AI yanıtı tam yüklenmeden alındı (yer tutucu metin); yanıt yok sayıldı."].filter(Boolean).join(" "),
    };
  }
  return {
    status: "ok",
    text: markdown.slice(0, MAX_TEXT),
    citations: dedupe(references.map((r) => citation(r.url, r.title))),
    queries: [],
    cost: value.cost,
    note,
  };
}

// ─── Claude (Anthropic API, web araması) ───────────────────────────────────

/** Anthropic hatalarını kısa, yönlendirici Türkçe mesaja çevirir (ham JSON ve request_id olmadan) */
export function explainAnthropicError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/credit balance is too low/i.test(raw)) {
    return "Anthropic kredisi bitti: console.anthropic.com → Plans & Billing'den kredi yükleyin ya da Sorular'da Claude'un işaretini kaldırın.";
  }
  if (e instanceof Anthropic.AuthenticationError) return "Anthropic API anahtarı geçersiz (401): Vercel'deki ANTHROPIC_API_KEY'i kontrol edin.";
  if (e instanceof Anthropic.PermissionDeniedError) return "Anthropic hesabının bu modele ya da web aramasına izni yok (403).";
  if (e instanceof Anthropic.RateLimitError) return "Anthropic hız sınırına takıldı (429); birkaç dakika sonra tekrar deneyin.";
  if (e instanceof Anthropic.APIConnectionError) return "Anthropic API'ye bağlanılamadı; tekrar deneyin.";
  if (e instanceof Anthropic.APIError) {
    const message = (e.error as { error?: { message?: string } } | undefined)?.error?.message ?? raw;
    return `Anthropic API ${e.status ?? ""}: ${message}`.trim();
  }
  return raw;
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
