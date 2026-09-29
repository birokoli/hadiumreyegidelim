import { prisma } from "@/lib/prisma";
import { loadInventory } from "@/lib/geo-blog/inventory";
import { researchTopic, type TopicResearch } from "@/lib/geo-blog/research";
import { writeArticle } from "@/lib/geo-blog/write";
import { evaluateArticleQuality } from "@/lib/geo-blog/gate";

export type GenerateStep = "researching" | "writing" | "evaluating" | "retrying" | "saved";

export type GenerateProgressCallback = (step: GenerateStep, data?: unknown) => void;

export async function generateBlogDraft(
  topic: string,
  onProgress?: GenerateProgressCallback
) {
  if (!topic || !topic.trim()) {
    throw new Error("Konu başlığı zorunludur.");
  }

  // 1. Envanter ve Araştırma
  onProgress?.("researching", { message: "Konu web aramaları ile araştırılıyor..." });
  const inventory = await loadInventory();
  const research = await researchTopic(topic);

  // 2. Yazım
  onProgress?.("writing", { message: "SEO + GEO uyumlu makale yazılıyor...", research });
  let article = await writeArticle(research, inventory);

  // 3. Kalite Değerlendirme
  onProgress?.("evaluating", { message: "Kalite kapısı kontrolleri çalıştırılıyor..." });
  let gateReport = evaluateArticleQuality(article, research, inventory);

  // 4. Yeniden Yazım (Gerekirse 1 kez)
  if (!gateReport.passed) {
    onProgress?.("retrying", { message: "Kalite şartlarını karşılamak için yeniden yazılıyor...", gateReport });
    const retryResearch: TopicResearch = {
      ...research,
      userIntent: `${research.userIntent} (DÜZELTME NOTU: Lütfen şu eksikleri gider: ${gateReport.issues.map((i) => i.message).join("; ")})`,
    };
    article = await writeArticle(retryResearch, inventory);
    gateReport = evaluateArticleQuality(article, research, inventory);
  }

  // 5. Slug benzersizleştirme ve Veritabanına Taslak Olarak Kayıt
  let slug = article.slug;
  const existingCount = await prisma.post.count({
    where: { slug: { startsWith: slug } },
  });

  if (existingCount > 0) {
    slug = `${slug}-${existingCount + 1}`;
  }

  const post = await prisma.post.create({
    data: {
      title: article.title,
      slug,
      description: article.metaDescription,
      content: article.content,
      tldr: article.tldr,
      faq: JSON.stringify(article.faq),
      keywords: article.keywords,
      focusKeyword: topic,
      seoScore: gateReport.score,
      references: JSON.stringify(article.externalLinksUsed),
      published: false,
      author: "Hadi Umre'ye Gidelim Editörü",
    },
  });

  const result = {
    postId: post.id,
    slug: post.slug,
    title: post.title,
    gateReport,
    article,
  };

  onProgress?.("saved", result);

  return result;
}
