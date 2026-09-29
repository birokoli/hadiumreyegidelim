// Anthropic harcama takibi ve aylık sınır.
// Her Claude çağrısının kullanımı (token + web araması) tahmini dolar olarak kaydedilir;
// ay içindeki toplam sınırı aşarsa yeni çağrı yapılmaz. Kesin tutar Anthropic
// konsolundadır (console.anthropic.com → Usage); buradaki değer liste fiyatlarıyla tahmindir.

import { prisma } from "@/lib/prisma";

const SPEND_KEY = "ANTHROPIC_SPEND";
const BUDGET_KEY = "AI_MONTHLY_BUDGET_USD";
export const DEFAULT_MONTHLY_BUDGET = 15;

// Liste fiyatları (USD / 1M token) ve web araması (USD / arama)
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
};
const WEB_SEARCH_USD = 0.01;

export type Feature = "blog" | "ai-visibility" | "other";

type Spend = {
  month: string; // YYYY-MM
  usd: number;
  calls: number;
  byFeature: Partial<Record<Feature, { usd: number; calls: number }>>;
};

type UsageLike = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null } | null;
};

const month = () => new Date().toISOString().slice(0, 7);

export function estimateUsd(model: string, usage: UsageLike | null | undefined) {
  if (!usage) return 0;
  const p = PRICES[model] ?? PRICES["claude-opus-5"];
  const input = (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) * 1.25 + (usage.cache_read_input_tokens ?? 0) * 0.1;
  return (input * p.input + (usage.output_tokens ?? 0) * p.output) / 1_000_000 + (usage.server_tool_use?.web_search_requests ?? 0) * WEB_SEARCH_USD;
}

async function readSpend(): Promise<Spend> {
  const row = await prisma.setting.findUnique({ where: { key: SPEND_KEY } }).catch(() => null);
  try {
    const s = row ? (JSON.parse(row.value) as Spend) : null;
    if (s && s.month === month()) return s;
  } catch {
    /* bozuk kayıt: sıfırdan başla */
  }
  return { month: month(), usd: 0, calls: 0, byFeature: {} };
}

export async function getBudget() {
  const [spend, row] = await Promise.all([readSpend(), prisma.setting.findUnique({ where: { key: BUDGET_KEY } }).catch(() => null)]);
  const limit = row ? Number(row.value) : DEFAULT_MONTHLY_BUDGET;
  return { ...spend, limit: Number.isFinite(limit) && limit >= 0 ? limit : DEFAULT_MONTHLY_BUDGET };
}

export async function setMonthlyBudget(usd: number) {
  const value = String(Math.max(0, Math.round(usd * 100) / 100));
  await prisma.setting.upsert({ where: { key: BUDGET_KEY }, update: { value }, create: { key: BUDGET_KEY, value } });
}

/** Sınır aşıldıysa hata fırlatır; çağrıdan önce kullanılır */
export async function assertBudget(feature: Feature) {
  const b = await getBudget();
  if (b.usd >= b.limit) {
    throw new Error(
      `Aylık Claude bütçesi doldu (${b.usd.toFixed(2)} / ${b.limit.toFixed(2)} $, ${feature}). İçerik Stüdyosu → Otomatik yazı panelinden sınırı artırabilir ya da gelecek ayı bekleyebilirsiniz.`,
    );
  }
}

/** Çağrı sonrası kullanımı kaydeder; kayıt hatası işi durdurmaz */
export async function recordSpend(feature: Feature, model: string, usage: UsageLike | null | undefined) {
  const usd = estimateUsd(model, usage);
  try {
    const s = await readSpend();
    s.usd += usd;
    s.calls += 1;
    const f = (s.byFeature[feature] ??= { usd: 0, calls: 0 });
    f.usd += usd;
    f.calls += 1;
    const value = JSON.stringify(s);
    await prisma.setting.upsert({ where: { key: SPEND_KEY }, update: { value }, create: { key: SPEND_KEY, value } });
  } catch (e) {
    console.error("[ai-budget] harcama kaydedilemedi", e);
  }
  return usd;
}
