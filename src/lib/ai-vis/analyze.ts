// Anılma, sıra ve kaynak analizi. Tamamı metin araması; hiçbir model "ne gördüğüne"
// karar vermez. Yaklaşım Elmo (mentions.ts, MIT) ve limelit (methodology, Apache-2.0)
// yöntemlerinden uyarlandı: markalı sorular manşet sayıdan düşülür, yüzeyi
// oluşmayan yanıt ıskalama sayılmaz, her sayının yanında n gösterilir.

import type { AiVisConfig, Citation, DailyStat, EngineId, Run, Subject } from "./types";

export function normalizeDomain(urlOrDomain: string): string {
  try {
    const url = new URL(urlOrDomain.startsWith("http") ? urlOrDomain : `https://${urlOrDomain}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return urlOrDomain.replace(/^www\./, "").toLowerCase();
  }
}

/** Türkçe büyük/küçük harf ve şapka farkını yok sayan karşılaştırma için */
export function fold(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[âà]/g, "a")
    .replace(/[îì]/g, "i")
    .replace(/[ûù]/g, "u")
    .replace(/[’`´]/g, "'");
}

function needles(subject: Subject) {
  return [subject.name, ...subject.aliases, ...subject.domains.map(normalizeDomain)]
    .map((n) => fold(n.trim()))
    .filter((n) => n.length >= 3);
}

export function mentions(textFolded: string, subject: Subject) {
  return needles(subject).some((n) => textFolded.includes(n));
}

/**
 * Sıra: yanıt bir liste ise markanın geçtiği ilk liste maddesinin, o listedeki yeri (1'den başlar).
 * Liste dışında anılırsa sıra yoktur (null).
 */
export function listPosition(text: string, subject: Subject): number | null {
  const lines = text.split("\n");
  const item = /^\s*(?:\d+[.)]|[-*•])\s+/;
  let index = 0;
  let inList = false;
  for (const line of lines) {
    if (item.test(line)) {
      index = inList ? index + 1 : 1;
      inList = true;
      if (mentions(fold(line), subject)) return index;
    } else if (line.trim() !== "") {
      // alt satır girintili devam ediyorsa aynı madde sayılır
      if (!/^\s{2,}/.test(line)) inList = false;
    }
  }
  return null;
}

export type CitationKind = "own" | "competitor" | "social" | "informational" | "other";

const SOCIAL = ["youtube.com", "instagram.com", "facebook.com", "x.com", "twitter.com", "tiktok.com", "reddit.com", "eksisozluk.com", "quora.com", "linkedin.com", "pinterest.com", "tripadvisor.com", "tripadvisor.com.tr", "sikayetvar.com"];
const INFO_EXACT = ["wikipedia.org", "diyanet.gov.tr", "hac.diyanet.gov.tr", "nusuk.sa", "visa.visitsaudi.com", "mofa.gov.sa"];

export function classifyDomain(domain: string, config: Pick<AiVisConfig, "brand" | "competitors">): { kind: CitationKind; owner?: string } {
  const d = normalizeDomain(domain);
  const matches = (list: string[]) => list.some((x) => d === normalizeDomain(x) || d.endsWith(`.${normalizeDomain(x)}`));
  if (matches(config.brand.domains)) return { kind: "own", owner: config.brand.name };
  const comp = config.competitors.find((c) => matches(c.domains));
  if (comp) return { kind: "competitor", owner: comp.name };
  if (matches(SOCIAL)) return { kind: "social" };
  if (matches(INFO_EXACT) || /\.(gov|edu)(\.[a-z]{2})?$/.test(d) || d.endsWith("wikipedia.org")) return { kind: "informational" };
  return { kind: "other" };
}

export const CITATION_KIND_LABEL: Record<CitationKind, string> = {
  own: "bizim site",
  competitor: "rakip",
  social: "sosyal / forum",
  informational: "resmî / ansiklopedi",
  other: "diğer",
};

export type RunAnalysis = {
  branded: boolean;
  countable: boolean;
  brandMentioned: boolean;
  brandPosition: number | null;
  competitorsMentioned: string[];
  citations: (Citation & { kind: CitationKind; owner?: string })[];
};

export function isBrandedPrompt(prompt: string, brand: Subject) {
  return mentions(fold(prompt), brand);
}

export function analyzeRun(run: Run, config: AiVisConfig): RunAnalysis {
  const folded = fold(run.text);
  const branded = isBrandedPrompt(run.prompt, config.brand);
  const citations = run.citations.map((c) => ({ ...c, ...classifyDomain(c.domain || c.url, config) }));
  // Kaynaklarda sitemiz varsa metinde adı geçmese de anılmış sayılır (Elmo ile aynı)
  const brandMentioned = mentions(folded, config.brand) || citations.some((c) => c.kind === "own");
  return {
    branded,
    countable: run.status === "ok" && !branded,
    brandMentioned: run.status === "ok" && brandMentioned,
    brandPosition: run.status === "ok" ? listPosition(run.text, config.brand) : null,
    competitorsMentioned:
      run.status === "ok"
        ? config.competitors.filter((c) => mentions(folded, c) || citations.some((x) => x.owner === c.name)).map((c) => c.name)
        : [],
    citations,
  };
}

export function emptyDaily(date: string): DailyStat {
  return { date, eligible: 0, mentioned: 0, positionSum: 0, positionCount: 0, brandMentions: 0, competitorMentions: {}, citations: 0, ownCitations: 0, byEngine: {} };
}

export function addToDaily(day: DailyStat, run: Run, a: RunAnalysis) {
  if (!a.countable) return day;
  day.eligible++;
  const eng = (day.byEngine[run.engine as EngineId] ??= { eligible: 0, mentioned: 0 });
  eng.eligible++;
  if (a.brandMentioned) {
    day.mentioned++;
    day.brandMentions++;
    eng.mentioned++;
  }
  if (a.brandPosition != null) {
    day.positionSum += a.brandPosition;
    day.positionCount++;
  }
  for (const c of a.competitorsMentioned) day.competitorMentions[c] = (day.competitorMentions[c] ?? 0) + 1;
  day.citations += a.citations.length;
  day.ownCitations += a.citations.filter((c) => c.kind === "own").length;
  return day;
}

/** Metni ve kaynak listesini, marka/rakip vurgusu için parçalara böler (yanıt görüntüleyici) */
export function highlightParts(text: string, config: AiVisConfig) {
  const terms: { term: string; who: "brand" | "competitor" }[] = [
    ...needles(config.brand).map((t) => ({ term: t, who: "brand" as const })),
    ...config.competitors.flatMap((c) => needles(c).map((t) => ({ term: t, who: "competitor" as const }))),
  ].sort((a, b) => b.term.length - a.term.length);
  if (!terms.length) return [{ text, who: null as null | "brand" | "competitor" }];

  const folded = fold(text);
  const parts: { text: string; who: null | "brand" | "competitor" }[] = [];
  let i = 0;
  let plainStart = 0;
  while (i < text.length) {
    const hit = terms.find((t) => folded.startsWith(t.term, i));
    if (hit) {
      if (plainStart < i) parts.push({ text: text.slice(plainStart, i), who: null });
      parts.push({ text: text.slice(i, i + hit.term.length), who: hit.who });
      i += hit.term.length;
      plainStart = i;
    } else i++;
  }
  if (plainStart < text.length) parts.push({ text: text.slice(plainStart), who: null });
  return parts;
}
