import type Anthropic from "@anthropic-ai/sdk";
import { callClaude, extractJson, normalizeUrl } from "@/lib/geo-blog/claude";
import { isAllowedExternal, RESEARCH_DOMAINS } from "@/lib/geo-blog/external-policy";

export type ResearchFact = { claim: string; sourceUrl: string };
export type ResearchSource = { url: string; title?: string };

export type TopicResearch = {
  topic: string;
  userIntent: string;
  targetAudience: string;
  keyQuestions: string[];
  facts: ResearchFact[];
  sources: ResearchSource[];
  searchQueries: string[];
  /** Doğrulanamadığı için atılan olgu sayısı (şeffaflık için) */
  droppedFacts: number;
};

const SYSTEM = `Sen hadiumreyegidelim.com için umre konusunda içerik araştırması yapan bir editörsün.
Verilen konu için web araması yap. Arama yalnızca resmî kurum sitelerine açıktır: Diyanet, Nusuk, Suudi devlet siteleri (gov.sa) ve Suudi turizm otoritesi. Özel şirket, acente ya da rakip firma sitelerini kaynak gösterme.

Yanıtın SON kısmında yalnızca şu JSON'u bir kod bloğu içinde ver:
{
  "userIntent": "Arayan kişi ne öğrenmek istiyor (1-2 cümle)",
  "targetAudience": "Kime yazılıyor",
  "keyQuestions": ["İnsanların Google'a ve AI'a soracağı biçimde 4-6 soru"],
  "facts": [{ "claim": "Tek, kontrol edilebilir bilgi (rakam, tarih, kural)", "sourceUrl": "Bu bilginin geçtiği arama sonucunun URL'si" }],
  "sources": [{ "url": "...", "title": "..." }]
}

Kurallar:
1. sourceUrl ve sources yalnızca bu oturumda web_search'ün döndürdüğü URL'ler olabilir. Tahmin edilen veya hatırlanan URL yazma.
2. Bir bilgiyi kaynakta göremediysen facts listesine koyma. Uydurma rakam, kişi, müşteri hikâyesi yok.
3. Fiyat ve süre gibi değişken bilgilerde kaynağın tarihini claim içinde belirt ("2026 itibarıyla" gibi).`;

/** Konu için Claude + web_search ile araştırma; yalnızca aramada gerçekten görülen URL'ler kabul edilir. */
export async function researchTopic(topic: string): Promise<TopicResearch> {
  const { blocks, text } = await callClaude({
    system: SYSTEM,
    prompt: `Konu: ${topic}`,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6, allowed_domains: RESEARCH_DOMAINS, user_location: { type: "approximate", country: "TR" } }],
    effort: "medium",
  });

  // Gerçekten görülen URL'ler: arama sonuç blokları + metindeki alıntılar
  const seen = new Map<string, { url: string; title?: string }>();
  const searchQueries: string[] = [];
  for (const b of blocks) {
    if (b.type === "server_tool_use") {
      const q = (b as { input?: { query?: unknown } }).input?.query;
      if (typeof q === "string") searchQueries.push(q);
    }
    if (b.type === "web_search_tool_result" && Array.isArray((b as Anthropic.WebSearchToolResultBlock).content)) {
      for (const r of (b as Anthropic.WebSearchToolResultBlock).content as Anthropic.WebSearchResultBlock[]) {
        // Yalnızca resmî kurum sayfaları kaynak olabilir
        if (r.url && isAllowedExternal(r.url)) seen.set(normalizeUrl(r.url), { url: r.url, title: r.title });
      }
    }
    if (b.type === "text") {
      for (const c of b.citations ?? []) {
        if ("url" in c && typeof c.url === "string") {
          const key = normalizeUrl(c.url);
          if (!seen.has(key) && isAllowedExternal(c.url)) seen.set(key, { url: c.url, title: "title" in c && typeof c.title === "string" ? c.title : undefined });
        }
      }
    }
  }

  const parsed = extractJson<Partial<{ userIntent: string; targetAudience: string; keyQuestions: unknown[]; facts: unknown[]; sources: unknown[] }>>(text) ?? {};

  const facts: ResearchFact[] = [];
  let droppedFacts = 0;
  for (const f of Array.isArray(parsed.facts) ? parsed.facts : []) {
    const claim = typeof (f as ResearchFact)?.claim === "string" ? (f as ResearchFact).claim.trim() : "";
    const url = typeof (f as ResearchFact)?.sourceUrl === "string" ? (f as ResearchFact).sourceUrl : "";
    const hit = url ? seen.get(normalizeUrl(url)) : undefined;
    // Kaynağı aramada görülmeyen bilgi başka bir kaynağa atfedilmez, atılır
    if (claim && hit) facts.push({ claim, sourceUrl: hit.url });
    else if (claim) droppedFacts++;
  }

  // Yazıda link verilebilecek kaynaklar: yalnızca bir olguyu destekleyenler (+ modelin seçtiği ve aramada görülenler)
  const sourceKeys = new Set(facts.map((f) => normalizeUrl(f.sourceUrl)));
  for (const s of Array.isArray(parsed.sources) ? parsed.sources : []) {
    const url = (s as ResearchSource)?.url;
    if (typeof url === "string" && seen.has(normalizeUrl(url))) sourceKeys.add(normalizeUrl(url));
  }
  const sources = [...sourceKeys].map((k) => seen.get(k)!).filter(Boolean);

  if (seen.size === 0) throw new Error("Resmî kaynaklarda (Diyanet, Nusuk, Suudi devlet siteleri) bu konuda sonuç bulunamadı; konu daha genel yazılarak tekrar denenmeli.");

  return {
    topic,
    userIntent: typeof parsed.userIntent === "string" ? parsed.userIntent : `${topic} hakkında güncel ve doğru bilgi`,
    targetAudience: typeof parsed.targetAudience === "string" ? parsed.targetAudience : "Umre planlayan kişiler",
    keyQuestions: (Array.isArray(parsed.keyQuestions) ? parsed.keyQuestions : []).filter((q): q is string => typeof q === "string" && q.trim().length > 0).slice(0, 6),
    facts,
    sources,
    searchQueries,
    droppedFacts,
  };
}
