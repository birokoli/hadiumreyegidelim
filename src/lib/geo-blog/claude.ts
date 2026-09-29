// GEO blog motorunun Claude çağrıları için ortak yardımcı: pause_turn devamı,
// reddetme kontrolü, sunucu tarafı fallback ve okunaklı hata mesajları.

import Anthropic from "@anthropic-ai/sdk";
import { explainAnthropicError } from "@/lib/ai-vis/engines";
import { assertBudget, recordSpend, type Feature } from "@/lib/ai-budget";

export const GEO_BLOG_MODEL = "claude-opus-5";

type CallInput = {
  system: string;
  prompt: string;
  tools?: Anthropic.ToolUnion[];
  /** Verilirse yanıt bu JSON şemasına zorlanır (structured outputs) */
  schema?: Record<string, unknown>;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
  /** Harcamanın yazılacağı kalem (aylık bütçe takibi) */
  feature?: Feature;
};

export async function callClaude(input: CallInput): Promise<{ blocks: Anthropic.ContentBlock[]; text: string }> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY tanımlı değil.");
  await assertBudget(input.feature ?? "blog");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: input.prompt }];
  const blocks: Anthropic.ContentBlock[] = [];
  let final: Anthropic.Message | null = null;

  // Uzun sunucu aracı turları pause_turn ile durabilir; en fazla 3 kez devam ettir
  for (let i = 0; i < 4; i++) {
    const params = {
      model: GEO_BLOG_MODEL,
      max_tokens: input.maxTokens ?? 16000,
      thinking: { type: "adaptive" },
      system: input.system,
      messages,
      ...(input.tools ? { tools: input.tools } : {}),
      output_config: {
        ...(input.effort ? { effort: input.effort } : {}),
        ...(input.schema ? { format: { type: "json_schema", schema: input.schema } } : {}),
      },
      // Güvenlik sınıflandırıcısı reddederse istek sunucu tarafında önerilen modele düşer
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    };
    try {
      // SDK 0.90 tipleri `fallbacks` alanını tanımıyor; gövde olduğu gibi iletilir
      final = (await client.beta.messages.create(params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming)) as unknown as Anthropic.Message;
    } catch (e) {
      throw new Error(explainAnthropicError(e));
    }
    await recordSpend(input.feature ?? "blog", GEO_BLOG_MODEL, final.usage);
    blocks.push(...final.content);
    if (final.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: final.content });
  }

  if (final?.stop_reason === "refusal") throw new Error("Claude bu isteği yanıtlamayı reddetti.");
  if (final?.stop_reason === "max_tokens") throw new Error("Claude yanıtı token sınırında kesildi; konu daha dar tutulmalı.");

  const text = blocks
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return { blocks, text };
}

/** Metinden JSON nesnesi çıkarır (kod bloğu içinde ya da düz) */
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidates = [fenced?.[1], text, text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return JSON.parse(c) as T;
    } catch {
      /* sıradakini dene */
    }
  }
  return null;
}

/** Karşılaştırma için URL normalleştirme: #, sondaki / ve utm parametreleri atılır */
export function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) if (/^utm_|^srsltid$/i.test(k)) u.searchParams.delete(k);
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}
