import { isInternalPath, type LinkTarget } from "@/lib/geo-blog/inventory";
import type { TopicResearch } from "@/lib/geo-blog/research";
import { normalizeUrl } from "@/lib/geo-blog/claude";
import { anchorLooksLikeName, externalAnchors, findBannedTerms, findCompetitorMentions, isAllowedExternal, soldServiceFor } from "@/lib/geo-blog/external-policy";
import type { GeneratedArticle } from "@/lib/geo-blog/write";

export type GateIssueSeverity = "critical" | "warning";

export type GateIssue = {
  severity: GateIssueSeverity;
  message: string;
};

export type GateReport = {
  score: number;
  passed: boolean;
  issues: GateIssue[];
};

const FORBIDDEN_PHRASES = [
  "günümüz dünyasında",
  "şüphesiz ki",
  "sonuç olarak",
  "harika bir yolculuk",
  "unutulmaz bir deneyim",
  "kuşkusuz",
  "son derece önemli",
  "göz ardı edilmemelidir",
  "hayat boyu sürecek",
  "vazgeçilmez bir parçası",
  "adeta bir",
  "büyük bir titizlikle",
  "eşsiz bir",
  "özetle",
  "hayati önem",
  "bu yazımızda",
  "doğru yerdesiniz",
  "hadi gelin",
  "misafirlerimiz",
];

function countWords(htmlOrText: string): number {
  const plainText = htmlOrText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!plainText) return 0;
  return plainText.split(/\s+/).length;
}

/**
 * Üretilen makalenin kalite kriterlerini ve SEO/GEO şartlarını deterministik olarak ölçer.
 */
export function evaluateArticleQuality(
  article: GeneratedArticle,
  research: TopicResearch,
  inventory: LinkTarget[],
  /** Yazıda geçmemesi gereken rakip adları ve alan adları */
  competitorTerms: string[] = [],
): GateReport {
  const issues: GateIssue[] = [];
  let score = 100;

  // 1. Başlık Kontrolü
  if (!article.title || article.title.length < 10) {
    issues.push({ severity: "critical", message: "Başlık çok kısa veya boş." });
    score -= 25;
  } else if (article.title.length > 70) {
    issues.push({ severity: "warning", message: `Başlık 70 karakterden uzun (${article.title.length} kar).` });
    score -= 5;
  }

  // 2. Meta Açıklama Kontrolü
  if (!article.metaDescription || article.metaDescription.length < 100) {
    issues.push({ severity: "warning", message: "Meta açıklama kısa (en az 120 karakter olmalı)." });
    score -= 5;
  } else if (article.metaDescription.length > 170) {
    issues.push({ severity: "warning", message: "Meta açıklama 170 karakterden uzun." });
    score -= 5;
  }

  // 3. İçerik Kelime Sayısı Kontrolü
  const totalWords = countWords(article.content);
  if (totalWords < 1000) {
    issues.push({ severity: "critical", message: `İçerik kelime sayısı çok az (${totalWords} kelime; hedef: 1200-2000).` });
    score -= 20;
  } else if (totalWords > 2500) {
    issues.push({ severity: "warning", message: `İçerik çok uzun (${totalWords} kelime).` });
    score -= 5;
  }

  // 4. H1 Yassaklığı Kontrolü
  if (/<h1[\s>]/i.test(article.content)) {
    issues.push({ severity: "critical", message: "İçerikte H1 etiketi bulundu (H1 yalnızca sayfa başlığında olmalıdır)." });
    score -= 20;
  }

  // 5. H2 Başlıkları ve Soru Şeklinde H2 Kontrolü
  const h2Matches = Array.from(article.content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi));
  const h2Titles = h2Matches.map((m) => m[1].replace(/<[^>]+>/g, "").trim());

  if (h2Titles.length < 4) {
    issues.push({ severity: "critical", message: `Yetersiz H2 başlığı (${h2Titles.length} adet bulundu; en az 4 olmalı).` });
    score -= 15;
  }

  const questionH2Count = h2Titles.filter((t) => t.endsWith("?") || /(?<!\p{L})(kaç|nasıl|neden|niçin|neler|nedir|nerede|ne zaman|hangi|kimler)(?!\p{L})/iu.test(t)).length;
  if (questionH2Count < 3) {
    issues.push({ severity: "warning", message: `En az 3 adet soru biçiminde H2 başlığı olmalı (${questionH2Count} adet bulundu).` });
    score -= 10;
  }

  // 5b. Cevap önce: her H2'nin altındaki ilk paragraf 25-80 kelimelik doğrudan cevap olmalı
  const sections = article.content.split(/<h2[^>]*>/i).slice(1);
  const firstParas = sections.map((sec) => sec.split(/<\/h2>/i)[1]?.match(/^\s*<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");
  const answerFirst = firstParas.filter((p) => {
    const w = countWords(p);
    return w >= 25 && w <= 80 && !/^(bu|o|bunlar|şu|ancak|ama|fakat|ve)(?!\p{L})/iu.test(p.replace(/<[^>]+>/g, "").trim());
  }).length;
  if (sections.length && answerFirst / sections.length < 0.6) {
    issues.push({ severity: "warning", message: `H2 bölümlerinin yalnızca ${answerFirst}/${sections.length} tanesi 25-80 kelimelik, konuyu adıyla anan doğrudan bir cevap paragrafıyla başlıyor.` });
    score -= 10;
  }

  // 5c. İzin verilmeyen etiketler (script, style, iframe, img, div, span, h1…)
  const disallowed = [...new Set([...article.content.matchAll(/<\s*([a-z0-9]+)[\s>]/gi)].map((m) => m[1].toLowerCase()))].filter(
    (t) => !["p", "h2", "h3", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td", "strong", "em", "a", "br"].includes(t),
  );
  if (disallowed.length) {
    issues.push({ severity: disallowed.some((t) => ["script", "style", "iframe"].includes(t)) ? "critical" : "warning", message: `İzin verilmeyen HTML etiketleri: ${disallowed.join(", ")}` });
    score -= 5;
  }

  // 6. Tablo Kontrolü
  if (!/<table[\s>]/i.test(article.content)) {
    issues.push({ severity: "warning", message: "İçerikte HTML tablosu (<table>) bulunamadı." });
    score -= 10;
  }

  // 7. SSS (FAQ) Kontrolü
  if (!article.faq || article.faq.length < 4) {
    issues.push({ severity: "warning", message: "En az 4 adet SSS (FAQ) maddesi bulunmalı." });
    score -= 10;
  }

  // 8. Yasaklı AI-Slop İfadelerin Kontrolü
  const contentLower = article.content.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (contentLower.includes(phrase.toLowerCase())) {
      issues.push({ severity: "warning", message: `Yasaklı AI-slop ifadesi kullanıldı: "${phrase}"` });
      score -= 5;
    }
  }

  // 9. İç Link Kontrolü
  const hrefMatches = Array.from(article.content.matchAll(/href=["']([^"']+)["']/g));
  const hrefs = hrefMatches.map((m) => m[1]);

  const internalHrefs = hrefs.filter((h) => h.startsWith("/") || /^https?:\/\/(www\.)?hadiumreyegidelim\.com/i.test(h));
  let invalidInternalCount = 0;
  for (const href of internalHrefs) {
    if (!isInternalPath(href, inventory)) {
      invalidInternalCount++;
    }
  }

  if (invalidInternalCount > 0) {
    issues.push({ severity: "critical", message: `${invalidInternalCount} adet geçersiz veya envanter dışı iç link kullanıldı.` });
    score -= 15;
  }

  if (internalHrefs.length < 4) {
    issues.push({ severity: "warning", message: `En az 4 iç link olmalı (${internalHrefs.length} adet bulundu).` });
    score -= 10;
  }

  // 10. Dış Link Kontrolü
  const externalHrefs = hrefs.filter((h) => /^https?:\/\//.test(h) && !/^https?:\/\/(www\.)?hadiumreyegidelim\.com/i.test(h));
  const allowedSourceUrls = new Set(research.sources.map((s) => normalizeUrl(s.url)));
  let invalidExternalCount = 0;

  for (const href of externalHrefs) {
    if (!allowedSourceUrls.has(normalizeUrl(href))) {
      invalidExternalCount++;
    }
  }

  if (invalidExternalCount > 0) {
    issues.push({ severity: "critical", message: `${invalidExternalCount} adet araştırma dışı/uydurma dış link kullanıldı.` });
    score -= 15;
  }

  // 10b. Dış link politikası: yalnızca resmî kurumlar, link metni konu kelimesi
  const anchors = externalAnchors(article.content);
  const offDomain = anchors.filter((a) => !isAllowedExternal(a.href));
  if (offDomain.length > 0) {
    issues.push({ severity: "critical", message: `${offDomain.length} dış link resmî kurum dışı bir siteye gidiyor (yalnızca Diyanet, Nusuk, Suudi devlet siteleri).` });
    score -= 20;
  }
  const namedAnchors = anchors.filter((a) => anchorLooksLikeName(a.text));
  if (namedAnchors.length > 0) {
    issues.push({ severity: "critical", message: `Dış link metni kurum/site adı olmamalı, konuyla ilgili kelime olmalı: ${namedAnchors.map((a) => `"${a.text}"`).join(", ")}.` });
    score -= 10;
  }

  const soldAnchors = anchors.filter((a) => soldServiceFor(a.text));
  if (soldAnchors.length > 0) {
    issues.push({
      severity: "critical",
      message: `Sattığımız hizmet dış siteye linklenmiş; kendi sayfamıza link verilmeli: ${soldAnchors.map((a) => `"${a.text}" → ${soldServiceFor(a.text)!.path}`).join(", ")}.`,
    });
    score -= 20;
  }

  // 10c. Rakip firma adı yazıda geçmemeli
  const mentions = findCompetitorMentions([article.title, article.tldr, article.content, ...article.faq.map((f) => `${f.question} ${f.answer}`)].join(" "), competitorTerms);
  if (mentions.length > 0) {
    issues.push({ severity: "critical", message: `Rakip firma adı geçiyor, çıkarılmalı: ${mentions.join(", ")}.` });
    score -= 20;
  }

  // 10d. Yasaklı kelimeler (TÜRSAB, diyanetsiz)
  const banned = findBannedTerms([article.title, article.metaDescription, article.tldr, article.content, article.keywords, ...article.faq.map((f) => `${f.question} ${f.answer}`)].join(" "));
  if (banned.length > 0) {
    issues.push({ severity: "critical", message: `Yasaklı kelime geçiyor, çıkarılmalı: ${banned.join(", ")}.` });
    score -= 20;
  }

  // 11. Sayısal Veri / Birim Kontrolü
  const digitMatchCount = (article.content.match(/\d+[\s\w%₺$€]*|\d+\.\d+/g) || []).length;
  if (digitMatchCount < 3) {
    issues.push({ severity: "warning", message: "İçerikte yeterli sayısal veri veya tarih/fiyat bilgisi bulunmuyor." });
    score -= 5;
  }

  const finalScore = Math.max(0, score);
  const hasCritical = issues.some((i) => i.severity === "critical");
  const passed = finalScore >= 80 && !hasCritical;

  return {
    score: finalScore,
    passed,
    issues,
  };
}
