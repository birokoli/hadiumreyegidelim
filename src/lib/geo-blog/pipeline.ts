import { prisma } from "@/lib/prisma";
import { loadInventory } from "@/lib/geo-blog/inventory";
import { researchTopic } from "@/lib/geo-blog/research";
import { writeArticle } from "@/lib/geo-blog/write";
import { evaluateArticleQuality } from "@/lib/geo-blog/gate";
import { loadCompetitorTerms, stripDisallowedLinks } from "@/lib/geo-blog/external-policy";
import { slugify } from "@/lib/seo/programmatic";

export type GenerateStep = "researching" | "writing" | "evaluating" | "retrying" | "saved";
export type GenerateProgressCallback = (step: GenerateStep, data?: unknown) => void;

// Vercel fonksiyonları 300 sn'de kesilir. Araştırma + yazım genelde 120-200 sn sürer;
// ikinci yazım yalnızca süre kalıyorsa yapılır, aksi hâlde taslak sorunlarıyla kaydedilir.
const RETRY_BUDGET_MS = 150_000;

/** "Yapay Zeka (AI)" sayfasının okuduğu AILog kaydını günceller; kayıt hatası üretimi durdurmaz */
async function logStatus(logId: string | undefined, status: string, details: string, extra: Record<string, unknown> = {}) {
  if (!logId) return;
  await prisma.aILog.update({ where: { id: logId }, data: { status, details: details.slice(0, 1000), ...extra } }).catch(() => {});
}

async function uniqueSlug(base: string) {
  const root = slugify(base) || `umre-rehberi-${Date.now().toString(36)}`;
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const taken = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function generateBlogDraft(topic: string, onProgress?: GenerateProgressCallback, options: { logId?: string } = {}) {
  const clean = topic?.trim();
  if (!clean) throw new Error("Konu başlığı zorunludur.");
  const started = Date.now();
  const logId =
    options.logId ??
    (await prisma.aILog
      .create({ data: { topic: clean, status: "INTERNET_SEARCH", details: "GEO motoru: web araması başlıyor" } })
      .then((l) => l.id)
      .catch(() => undefined));

  try {
    // 1. Envanter ve araştırma
    onProgress?.("researching", { message: "Konu web aramasıyla araştırılıyor…" });
    await logStatus(logId, "INTERNET_SEARCH", `"${clean}" için web araması yapılıyor`, { topic: clean });
    const [inventory, research] = await Promise.all([loadInventory(), researchTopic(clean)]);

    // 2. Yazım
    const researchNote = `${research.sources.length} kaynak, ${research.facts.length} doğrulanmış bilgi${research.droppedFacts ? `, ${research.droppedFacts} doğrulanamayan bilgi atıldı` : ""}`;
    onProgress?.("writing", { message: `Yazı hazırlanıyor (${researchNote})…`, research });
    await logStatus(logId, "WRITING_CONTENT", `Yazılıyor: ${researchNote}`);
    let article = await writeArticle(research, inventory);
    const competitorTerms = await loadCompetitorTerms();

    // 3. Kalite kapısı; gerekirse ve süre varsa bir kez düzelttir
    onProgress?.("evaluating", { message: "Kalite kapısı çalışıyor…" });
    let gateReport = evaluateArticleQuality(article, research, inventory, competitorTerms);
    if (!gateReport.passed && Date.now() - started < RETRY_BUDGET_MS) {
      onProgress?.("retrying", { message: "Kalite şartları için yeniden yazılıyor…", gateReport });
      await logStatus(logId, "WRITING_CONTENT", `Kalite kapısı ${gateReport.score}/100; düzeltiliyor`);
      const retried = await writeArticle(research, inventory, gateReport.issues.map((i) => i.message));
      const retriedReport = evaluateArticleQuality(retried, research, inventory, competitorTerms);
      // İkinci deneme daha kötüyse ilkini tut
      if (retriedReport.score >= gateReport.score) {
        article = retried;
        gateReport = retriedReport;
      }
    }

    // Son güvence: kapıdan geçmese de taslakta izinsiz dış link kalmasın
    article = { ...article, content: stripDisallowedLinks(article.content).html };

    // 4. Taslak olarak kaydet (yayın yalnızca onayla ya da GEO_BLOG_AUTOPUBLISH ile)
    const slug = await uniqueSlug(article.slug || clean);
    const author = await prisma.author.findFirst({ select: { id: true, name: true } }).catch(() => null);
    const references = research.sources
      .filter((s) => article.externalLinksUsed.includes(s.url))
      .concat(research.sources.filter((s) => !article.externalLinksUsed.includes(s.url)))
      .slice(0, 12)
      .map((s) => `${s.title?.trim() || new URL(s.url).hostname} — ${s.url}`)
      .join("\n");

    const post = await prisma.post.create({
      data: {
        title: article.title,
        metaTitle: article.title,
        slug,
        description: article.metaDescription,
        content: article.content,
        tldr: article.tldr,
        // Blog şablonu SSS'yi {q, a} biçiminde okur (FAQPage şeması da buradan üretilir)
        faq: JSON.stringify(article.faq.map((f) => ({ q: f.question, a: f.answer }))),
        keywords: article.keywords,
        focusKeyword: clean,
        seoScore: gateReport.score,
        references: references || null,
        published: false,
        ...(author ? { authorId: author.id, author: author.name } : { author: "Hadi Umreye Gidelim Editörü" }),
      },
    });

    const seconds = Math.round((Date.now() - started) / 1000);
    await logStatus(
      logId,
      "COMPLETED",
      `Taslak hazır: "${post.title}" · kalite ${gateReport.score}/100${gateReport.passed ? "" : " (kapıdan geçmedi)"} · ${seconds} sn · SEO Masası → 07 Blog'dan onaylayın`,
      { completedAt: new Date() },
    );

    const result = { postId: post.id, slug: post.slug, title: post.title, gateReport, article, logId };
    onProgress?.("saved", result);
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await logStatus(logId, "FAILED", `GEO motoru hatası: ${message}`, { completedAt: new Date() });
    throw e;
  }
}
