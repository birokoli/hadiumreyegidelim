import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeoAdmin } from "@/lib/seo/guard";

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  try {
    const aiVisSetting = await prisma.setting.findUnique({ where: { key: "AI_VIS_CONFIG" } });
    const aiVisConfig = aiVisSetting?.value ? JSON.parse(aiVisSetting.value) : {};
    const prompts: string[] = Array.isArray(aiVisConfig.prompts) ? aiVisConfig.prompts : [];

    const seoTrackedSetting = await prisma.setting.findUnique({ where: { key: "SEO_TRACKED_KEYWORDS" } });
    const trackedKeywords: string[] = seoTrackedSetting?.value ? JSON.parse(seoTrackedSetting.value) : [];

    const existingPosts = await prisma.post.findMany({
      select: { title: true, focusKeyword: true },
    });
    const existingTitles = new Set(existingPosts.map((p) => (p.focusKeyword || p.title).toLowerCase()));

    const opportunities = [
      ...prompts.map((p) => ({ topic: p, source: "ai_visibility" as const })),
      ...trackedKeywords.map((k) => ({ topic: k, source: "tracked_keyword" as const })),
    ].filter((op) => op.topic && !existingTitles.has(op.topic.toLowerCase()));

    return NextResponse.json({ opportunities });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fırsatlar alınamadı." }, { status: 500 });
  }
}
