// Ziyaretçi bir yapay zekâ asistanından mı geldi? (Y5.1) Referrer ya da utm_source'tan okunur.
const AI_HOSTS: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, "Gemini"],
  [/(^|\.)copilot\.microsoft\.com$|(^|\.)bing\.com$/, "Copilot/Bing"],
  [/(^|\.)claude\.ai$/, "Claude"],
  [/(^|\.)deepseek\.com$/, "DeepSeek"],
  [/(^|\.)grok\.com$|(^|\.)x\.ai$/, "Grok"],
];
const AI_UTM = /chatgpt|openai|perplexity|gemini|copilot|claude|deepseek|grok/i;

/** "ChatGPT" | "Perplexity" | … | null */
export function detectAiSource(referrer?: string | null, utmSource?: string | null): string | null {
  if (utmSource && AI_UTM.test(utmSource)) return utmSource.toLowerCase().includes("chatgpt") || utmSource.toLowerCase().includes("openai") ? "ChatGPT" : utmSource;
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return AI_HOSTS.find(([re]) => re.test(host))?.[1] ?? null;
  } catch {
    return null;
  }
}
