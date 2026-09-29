import Anthropic from "@anthropic-ai/sdk";
import { explainAnthropicError } from "@/lib/ai-vis/engines";

export type ResearchFact = {
  claim: string;
  sourceUrl: string;
};

export type ResearchSource = {
  url: string;
  title?: string;
};

export type TopicResearch = {
  topic: string;
  userIntent: string;
  targetAudience: string;
  keyQuestions: string[];
  facts: ResearchFact[];
  sources: ResearchSource[];
  searchQueries: string[];
};

/**
 * Konu için Claude + web_search ile araştırma yapar.
 * Gerçek web araması sonuçlarından olguları ve kaynak URLlerini toplar.
 */
export async function researchTopic(topic: string): Promise<TopicResearch> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY bulunamadı.");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `Sen hadiumreyegidelim.com için GEO & SEO odaklı içerik araştırması yapan bir uzmansın.
Verilen konu hakkında web aramaları yap (Diyanet, Nusuk, Suudi Konsolosluğu/Vize Portalı, havalimanları, güncel umre fiyatları ve prosedürleri).

Araştırma sonucunda şu bilgileri tam JSON formatında yanıtla:
{
  "userIntent": "Kullanıcının arama niyeti ve aradığı temel bilgiler",
  "targetAudience": "Hedef kitle tanımı (ör. İlk kez gidecekler, aileler, bütçe odaklı seyahat edenler)",
  "keyQuestions": ["H2 başlıkları için 4-6 adet soru biçiminde başlık"],
  "facts": [
    {
      "claim": "Doğrulanmış net bilgi veya istatistik/kural",
      "sourceUrl": "Bu bilginin arama sonuçlarında geçen tam URLsi"
    }
  ],
  "sources": [
    {
      "url": "Aramada bulunan kaynak URLsi",
      "title": "Kaynak başlığı"
    }
  ]
}

ÖNEMLİ KURALLAR:
1. "facts" ve "sources" içindeki tüm URLler YALNIZCA senin yaptığın web_search aramalarında dönen GERÇEK URLler olmalıdır. Uydurma URL yazma!
2. Uydurma deneyim, kişi veya hayali rakamlar ekleme.
3. Sorular (keyQuestions) doğrudan kullanıcıların Google ve AIa sorduğu net sorular olmalıdır.`;

  const prompt = `Konu: ${topic}\nLütfen bu konu hakkında web aramaları yapıp araştırma yap ve yukarıda istenen JSON formatında yanıt ver.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  const tools: Anthropic.ToolUnion[] = [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: 8,
      user_location: { type: "approximate", country: "TR" },
    },
  ];

  let final: Anthropic.Message | null = null;
  const blocks: Anthropic.ContentBlock[] = [];

  for (let i = 0; i < 4; i++) {
    const params = {
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      tools,
      messages,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    };

    try {
      final = (await client.beta.messages.create(
        params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming
      )) as unknown as Anthropic.Message;
    } catch (e) {
      throw new Error(explainAnthropicError(e));
    }

    blocks.push(...final.content);
    if (final.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: final.content });
  }

  if (final?.stop_reason === "refusal") {
    throw new Error("Claude bu konu için araştırmayı reddetti.");
  }

  const searchQueries: string[] = [];
  const searchSources: ResearchSource[] = [];

  for (const b of blocks) {
    if (b.type === "server_tool_use") {
      const input = (b as { input?: unknown }).input;
      if (input && typeof input === "object" && "query" in input && typeof (input as { query: unknown }).query === "string") {
        searchQueries.push((input as { query: string }).query);
      }
    }
    if (b.type === "text" && b.citations) {
      for (const c of b.citations) {
        if ("url" in c && typeof c.url === "string" && /^https?:\/\//.test(c.url)) {
          searchSources.push({
            url: c.url,
            title: "title" in c && typeof c.title === "string" ? c.title : undefined,
          });
        }
      }
    }
  }

  const responseText = blocks
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  let parsed: Partial<TopicResearch> = {};
  try {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, responseText];
    const rawJson = jsonMatch[1] ?? responseText;
    parsed = JSON.parse(rawJson);
  } catch {
    const firstBrace = responseText.indexOf("{");
    const lastBrace = responseText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(responseText.slice(firstBrace, lastBrace + 1));
      } catch {
        parsed = {};
      }
    }
  }

  const validSourcesMap = new Map<string, string>();
  for (const s of searchSources) {
    if (!validSourcesMap.has(s.url)) {
      validSourcesMap.set(s.url, s.title ?? "");
    }
  }

  const parsedSources = Array.isArray(parsed.sources) ? parsed.sources : [];
  for (const s of parsedSources) {
    if (s && typeof s.url === "string" && /^https?:\/\//.test(s.url)) {
      if (!validSourcesMap.has(s.url)) {
        validSourcesMap.set(s.url, typeof s.title === "string" ? s.title : "");
      }
    }
  }

  const finalSources: ResearchSource[] = Array.from(validSourcesMap.entries()).map(([url, title]) => ({
    url,
    title: title || undefined,
  }));

  const validUrlsSet = new Set(finalSources.map((s) => s.url));

  const rawFacts = Array.isArray(parsed.facts) ? parsed.facts : [];
  const finalFacts: ResearchFact[] = rawFacts
    .filter((f): f is ResearchFact => Boolean(f && typeof f.claim === "string" && f.claim.trim()))
    .map((f) => {
      const url = typeof f.sourceUrl === "string" && /^https?:\/\//.test(f.sourceUrl) ? f.sourceUrl : (finalSources[0]?.url ?? "");
      return {
        claim: f.claim.trim(),
        sourceUrl: validUrlsSet.has(url) ? url : (finalSources[0]?.url ?? url),
      };
    });

  return {
    topic,
    userIntent: parsed.userIntent ?? `${topic} hakkında bilgilendirme ve rehberlik`,
    targetAudience: parsed.targetAudience ?? "Umre ziyaretçileri ve planlama yapanlar",
    keyQuestions: Array.isArray(parsed.keyQuestions) ? parsed.keyQuestions.filter((q): q is string => typeof q === "string" && Boolean(q.trim())) : [],
    facts: finalFacts,
    sources: finalSources,
    searchQueries,
  };
}
