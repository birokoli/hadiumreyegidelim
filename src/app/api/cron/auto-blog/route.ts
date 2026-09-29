import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getBlogOpportunities } from "@/lib/geo-blog/opportunities";
import { generateBlogDraft } from "@/lib/geo-blog/pipeline";
import { readJson, writeJson, SEO_KEYS } from "@/lib/seo/store";
import type { TrackedKeyword } from "@/lib/seo/types";
import { loadConfig, saveConfig } from "@/lib/ai-vis/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const fold = (s: string) => s.toLocaleLowerCase("tr").trim();

export async function GET(request: Request) {
  // 1. Vercel Cron yetkilendirmesi
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "true";

  // 2. Auto-blog aktif mi? (DB toggle env var'a önceliklidir)
  let autoBlogEnabled = process.env.AUTO_BLOG_ENABLED === "true";
  try {
    const dbToggle = await prisma.setting.findUnique({ where: { key: "AUTO_BLOG_ENABLED" } });
    if (dbToggle) autoBlogEnabled = dbToggle.value === "true";
  } catch {
    // fallback
  }

  if (!autoBlogEnabled && !force) {
    return NextResponse.json({ success: true, message: "Auto-blog devre dışı." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY eksik" }, { status: 500 });
  }

  // 3. Günlük sınırlama: bugün zaten yeni bir yazı/taslak oluşturulduysa atla
  if (!force) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = await prisma.post.count({
      where: { createdAt: { gte: todayStart } },
    });
    if (todayCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Bugün zaten ${todayCount} blog yazısı/taslağı oluşturuldu.`,
      });
    }
  }

  // 4. Yeni GEO Blog motorundan fırsat konusu seç
  const opportunities = await getBlogOpportunities();
  let selectedTopic = opportunities[0]?.topic;

  if (!selectedTopic) {
    selectedTopic = "Bireysel Umre Rehberi 2026";
  }

  // 5. Yeni GEO motoru ile taslak üret (published: false olarak kaydedilir)
  const result = await generateBlogDraft(selectedTopic);

  // 6. Otomatik yayın politikası:
  // Yalnızca GEO_BLOG_AUTOPUBLISH=true (DB veya env) VE kalite kapısı geçtiyse otomatik yayınlanır.
  let autoPublishSetting = process.env.GEO_BLOG_AUTOPUBLISH === "true";
  try {
    const dbAutoPub = await prisma.setting.findUnique({ where: { key: "GEO_BLOG_AUTOPUBLISH" } });
    if (dbAutoPub) autoPublishSetting = dbAutoPub.value === "true";
  } catch {
    // fallback
  }

  let autoPublished = false;

  if (autoPublishSetting && result.gateReport.passed) {
    const updated = await prisma.post.update({
      where: { id: result.postId },
      data: { published: true },
    });

    autoPublished = true;

    // SEO Takip Edilen Kelimelere Ekle
    if (updated.focusKeyword && updated.focusKeyword.trim()) {
      const keywordToTrack = updated.focusKeyword.trim();
      const tracked = await readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []);
      if (!tracked.some((t) => fold(t.keyword) === fold(keywordToTrack))) {
        await writeJson(SEO_KEYS.tracked, [
          ...tracked,
          { keyword: keywordToTrack, addedAt: new Date().toISOString(), history: [] },
        ]);
      }
    }

    // AI Görünürlük Sorularına Ekle
    if (updated.title && updated.title.trim()) {
      const promptText = updated.title.trim();
      const config = await loadConfig();
      if (!config.prompts.some((p) => fold(p.text) === fold(promptText))) {
        config.prompts.push({
          id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          text: promptText,
          tags: ["blog"],
          createdAt: new Date().toISOString(),
        });
        await saveConfig(config);
      }
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/seo/blog");
    revalidatePath("/admin/seo/kelimeler");
    revalidatePath("/admin/ai-visibility/sorular");
  }

  return NextResponse.json({
    success: true,
    postId: result.postId,
    slug: result.slug,
    title: result.title,
    seoScore: result.gateReport.score,
    gatePassed: result.gateReport.passed,
    published: autoPublished,
    status: autoPublished ? "PUBLISHED" : "DRAFT_CREATED",
  });
}
