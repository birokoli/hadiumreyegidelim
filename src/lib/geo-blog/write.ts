import Anthropic from "@anthropic-ai/sdk";
import { explainAnthropicError } from "@/lib/ai-vis/engines";
import { pickLinkTargets, type LinkTarget } from "@/lib/geo-blog/inventory";
import type { TopicResearch } from "@/lib/geo-blog/research";

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type GeneratedArticle = {
  title: string;
  slug: string;
  metaDescription: string;
  tldr: string;
  content: string;
  faq: BlogFaqItem[];
  keywords: string;
  internalLinksUsed: string[];
  externalLinksUsed: string[];
};

/**
 * Araştırma verilerine ve sayfa envanterine dayanarak SEO + GEO alıntılanabilir blog yazısı üretir.
 */
export async function writeArticle(
  research: TopicResearch,
  inventory: LinkTarget[]
): Promise<GeneratedArticle> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY bulunamadı.");
  }

  const linkCandidates = pickLinkTargets(research.topic, inventory, 12);
  const internalLinkMap = linkCandidates.map((c) => ({
    path: c.path,
    title: c.title,
    topics: c.topics,
  }));

  const externalSources = research.sources.map((s) => ({
    url: s.url,
    title: s.title ?? s.url,
  }));

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `Sen hadiumreyegidelim.com için alıntılanabilir (GEO) ve SEO uyumlu rehber yazıları hazırlayan uzman bir editörsün.

Aşağıda sana verilen araştırma verilerini, doğrulanmış olguları ve izin verilen bağlantı listelerini kullanacaksın.

YAZIM KURALLARI VE STANDARTLARI:
1. BAŞLIK VE METATAGLAR:
   - "title": En fazla 60 karakter olmalı, ilgi çekici ve net.
   - "slug": Türkçe karakter içermeyen, tire ile ayrılmış URL yolu (ör. "bireysel-umre-rehberi-2026").
   - "metaDescription": 120-160 karakter arası, arama sonucunda tıklamayı artıracak özet.
   - "tldr": Sayfa başında kutu olarak gösterilecek 2-3 cümlelik net özet.
   - "keywords": Virgülle ayrılmış 5-8 adet hedef kelime.

2. İÇERİK (content - HTML formatında):
   - H1 ETİKETİ KESİNLİKLE KULLANMA (Sayfa başlığı H1 olacaktır).
   - En az 4 adet <h2> başlığı kullan. H2 başlıklarının EN AZ 3 TANESİ SORU ŞEKLİNDE olmalıdır (ör. <h2>Umre Vizesi Kaç Günde Çıkar?</h2>).
   - Her <h2> başlığının hemen altındaki İLK PARAGRAF 40-60 kelimelik, soruya doğrudan cevap veren bağımsız bir özet paragraf olmalıdır. AI arama motorları bu pasajları alıntılar.
   - En az 1 adet düzgün HTML <table> etiketi içermeli (karşılaştırma, adımlar veya süreç tablosu).
   - İçerik 1200 ile 2000 kelime arasında kapsamlı olmalıdır.
   - Sadece <p>, <h2>, <h3>, <ul>, <ol>, <li>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <strong>, <em>, <a> etiketleri kullan.

3. BAĞLANTI (LINK) KURALLARI:
   - İÇ LİNKLER: Yalnızca verilen "IZIN_VERILEN_IC_LINKLER" listesindeki path adreslerini kullan! Metin içerisinde uygun yerlerde en az 4, en fazla 8 iç link ekle (ör. <a href="/bireysel-umre">bireysel umre planlama</a>).
   - DIŞ LİNKLER: Yalnızca verilen "IZIN_VERILEN_DIS_KAYNAKLAR" listesindeki URL adreslerini kullan! Metinde doğrulanmış bir bilgiden bahsederken bu URL adreslerine rel="noopener noreferrer" target="_blank" ile link ver. Uydurma dış link ekleme!

4. AI-SLOP YASAKLARI:
   - "Günümüz dünyasında", "Şüphesiz ki", "Sonuç olarak", "Harika bir yolculuk", "Unutulmaz bir deneyim", "Kuşkusuz", "Son derece önemli" vb. kalıplaşmış yapay metin laflarını KESİNLİKLE KULLANMA.
   - Uydurma müşteri hikayeleri, temelsiz rakamlar yazma. Her sayısal veri doğrulanmış olgulara dayanmalıdır.

ÇIKTI FORMATI:
Yanıtını TAM JSON formatında ver:
{
  "title": "...",
  "slug": "...",
  "metaDescription": "...",
  "tldr": "...",
  "content": "<p>...</p><h2>...</h2>...",
  "faq": [
    { "question": "Soru 1?", "answer": "Cevap 1" },
    { "question": "Soru 2?", "answer": "Cevap 2" },
    { "question": "Soru 3?", "answer": "Cevap 3" },
    { "question": "Soru 4?", "answer": "Cevap 4" }
  ],
  "keywords": "kelime1, kelime2, kelime3"
}`;

  const userPrompt = `KONU: ${research.topic}
KULLANICI NİYETİ: ${research.userIntent}
HEDEF KİTLE: ${research.targetAudience}

ANA SORULAR:
${research.keyQuestions.map((q) => `- ${q}`).join("\n")}

DOĞRULANMIŞ OLGULAR VE BİLGİLER:
${research.facts.map((f) => `- ${f.claim} (Kaynak: ${f.sourceUrl})`).join("\n")}

IZIN_VERILEN_IC_LINKLER:
${JSON.stringify(internalLinkMap, null, 2)}

IZIN_VERILEN_DIS_KAYNAKLAR:
${JSON.stringify(externalSources, null, 2)}

Lütfen yukarıdaki kurallara harfiyen uyarak tam JSON formatında blog yazısını üret.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }];

  let final: Anthropic.Message | null = null;
  const blocks: Anthropic.ContentBlock[] = [];

  for (let i = 0; i < 4; i++) {
    const params = {
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
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
    throw new Error("Claude bu konu için içerik üretimini reddetti.");
  }

  const responseText = blocks
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  let parsed: Partial<GeneratedArticle> = {};
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

  const content = parsed.content ?? "";

  const internalUsedSet = new Set<string>();
  const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
  const allowedInternalPaths = new Set(internalLinkMap.map((l) => l.path));
  const allowedExternalUrls = new Set(externalSources.map((s) => s.url));

  const externalUsedSet = new Set<string>();

  for (const m of hrefMatches) {
    const href = m[1];
    if (allowedInternalPaths.has(href)) {
      internalUsedSet.add(href);
    } else if (allowedExternalUrls.has(href)) {
      externalUsedSet.add(href);
    }
  }

  const title = (parsed.title ?? research.topic).slice(0, 80).trim();
  const rawSlug = parsed.slug ?? research.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = rawSlug.replace(/^\/+|\/+$/g, "").toLowerCase();

  return {
    title,
    slug,
    metaDescription: (parsed.metaDescription ?? `${title} rehberi.`).slice(0, 170).trim(),
    tldr: parsed.tldr ?? `${title} hakkında detaylı rehber ve güncel bilgiler.`,
    content,
    faq: Array.isArray(parsed.faq)
      ? parsed.faq.filter((item): item is BlogFaqItem => Boolean(item && typeof item.question === "string" && typeof item.answer === "string"))
      : [],
    keywords: parsed.keywords ?? research.topic,
    internalLinksUsed: Array.from(internalUsedSet),
    externalLinksUsed: Array.from(externalUsedSet),
  };
}
