// Otomatik yazı: cron ve "Yapay Zeka (AI)" sayfasındaki "Şimdi yaz" düğmesi bunu kullanır.
// Konu fırsat kuyruğundan seçilir, yazı taslak olarak kaydedilir; otomatik yayın yalnızca
// GEO_BLOG_AUTOPUBLISH açıksa ve kalite kapısı geçtiyse yapılır.

import { prisma } from "@/lib/prisma";
import { getBlogOpportunities } from "@/lib/geo-blog/opportunities";
import { generateBlogDraft } from "@/lib/geo-blog/pipeline";
import { publishPost } from "@/lib/geo-blog/publish";

const FALLBACK_TOPIC = "bireysel umre nasıl planlanır";
const STALE_MS = 10 * 60 * 1000;

async function flag(key: string, envValue: string | undefined) {
  const row = await prisma.setting.findUnique({ where: { key } }).catch(() => null);
  return row ? row.value === "true" : envValue === "true";
}

export const isAutoBlogEnabled = () => flag("AUTO_BLOG_ENABLED", process.env.AUTO_BLOG_ENABLED);
export const isAutoPublishEnabled = () => flag("GEO_BLOG_AUTOPUBLISH", process.env.GEO_BLOG_AUTOPUBLISH);

/** 10 dakikadan eski, bitmemiş kayıtlar takılmış sayılır ve kapatılır */
export async function runningJob() {
  await prisma.aILog
    .updateMany({
      where: { status: { notIn: ["COMPLETED", "FAILED"] }, updatedAt: { lt: new Date(Date.now() - STALE_MS) } },
      data: { status: "FAILED", details: "Zaman aşımı: işlem 10 dakikada bitmedi (Vercel süresi dolmuş olabilir).", completedAt: new Date() },
    })
    .catch(() => {});
  return prisma.aILog.findFirst({ where: { status: { notIn: ["COMPLETED", "FAILED"] } }, orderBy: { createdAt: "desc" } }).catch(() => null);
}

export async function pickTopic() {
  const opportunities = await getBlogOpportunities().catch(() => []);
  return opportunities[0]?.topic?.trim() || FALLBACK_TOPIC;
}

export async function runAutoBlog(options: { logId?: string; topic?: string } = {}) {
  const topic = options.topic ?? (await pickTopic());
  const result = await generateBlogDraft(topic, undefined, { logId: options.logId });
  let published = false;
  if (result.gateReport.passed && (await isAutoPublishEnabled())) {
    await publishPost(result.postId);
    published = true;
    if (result.logId) {
      await prisma.aILog
        .update({ where: { id: result.logId }, data: { details: `Yayınlandı: "${result.title}" · kalite ${result.gateReport.score}/100 (otomatik yayın açık)` } })
        .catch(() => {});
    }
  }
  return { ...result, published, topic };
}
