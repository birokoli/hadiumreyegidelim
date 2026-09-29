export const ENGINES = {
  chatgpt: { label: "ChatGPT", via: "DataForSEO (chatgpt.com taraması)" },
  gemini: { label: "Gemini", via: "DataForSEO (gemini.google.com taraması)" },
  perplexity: { label: "Perplexity", via: "DataForSEO (Sonar API, web araması açık)" },
  "google-ai-overview": { label: "Google AI Overview", via: "DataForSEO (Google sonuç sayfası)" },
  "google-ai-mode": { label: "Google AI Mode", via: "DataForSEO (Google AI Mode)" },
  claude: { label: "Claude", via: "Anthropic API (web araması açık)" },
} as const;

export type EngineId = keyof typeof ENGINES;
export const ENGINE_IDS = Object.keys(ENGINES) as EngineId[];

export type Subject = { name: string; aliases: string[]; domains: string[] };

export type Prompt = { id: string; text: string; tags: string[]; createdAt: string };

export type AiVisConfig = {
  brand: Subject;
  competitors: Subject[];
  prompts: Prompt[];
  engines: EngineId[];
};

export type Citation = { url: string; title: string; domain: string };

/** Motordan dönen ham ölçüm. Anılma analizi okurken güncel ayarlarla yeniden hesaplanır. */
export type Run = {
  id: string;
  promptId: string;
  prompt: string;
  engine: EngineId;
  at: string;
  /** no_surface: motor bu soruya yanıt yüzeyi üretmedi (ör. AI Overview çıkmadı); paydaya girmez */
  status: "ok" | "no_surface" | "error";
  error?: string;
  text: string;
  citations: Citation[];
  queries: string[];
  cost: number;
  note?: string;
};

/** Günlük özet: trend ve sapma için. O günün ayarlarıyla hesaplanır. */
export type DailyStat = {
  date: string; // YYYY-MM-DD
  eligible: number; // markalı olmayan, yüzeyi olan yanıt
  mentioned: number;
  positionSum: number;
  positionCount: number;
  brandMentions: number;
  competitorMentions: Record<string, number>;
  citations: number;
  ownCitations: number;
  byEngine: Partial<Record<EngineId, { eligible: number; mentioned: number }>>;
};

export const cellKey = (promptId: string, engine: EngineId) => `${promptId}::${engine}`;
