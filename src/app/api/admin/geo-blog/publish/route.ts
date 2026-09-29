import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSeoAdmin } from "@/lib/seo/guard";
import { readJson, writeJson, SEO_KEYS } from "@/lib/seo/store";
import type { TrackedKeyword } from "@/lib/seo/types";
import { loadConfig, saveConfig } from "@/lib/ai-vis/store";

const fold = (s: string) => s.toLocaleLowerCase("tr").trim();

export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  try {
    const { postId } = await req.json();
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "postId zorunludur." }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { published: true },
    });

    let addedToTracked = false;
    let addedToAiVis = false;

    // 1. Odak kelimeyi SEO_TRACKED_KEYWORDS'e ekle
    if (updated.focusKeyword && updated.focusKeyword.trim()) {
      const keywordToTrack = updated.focusKeyword.trim();
      const tracked = await readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []);
      const exists = tracked.some((t) => fold(t.keyword) === fold(keywordToTrack));

      if (!exists) {
        const nextTracked: TrackedKeyword[] = [
          ...tracked,
          {
            keyword: keywordToTrack,
            addedAt: new Date().toISOString(),
            history: [],
          },
        ];
        await writeJson(SEO_KEYS.tracked, nextTracked);
        addedToTracked = true;
      }
    }

    // 2. Ana başlığı / soruyu AI_VIS_CONFIG.prompts'a ekle (etiket: ["blog"])
    if (updated.title && updated.title.trim()) {
      const promptText = updated.title.trim();
      const config = await loadConfig();
      const exists = config.prompts.some((p) => fold(p.text) === fold(promptText));

      if (!exists) {
        const promptId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        config.prompts.push({
          id: promptId,
          text: promptText,
          tags: ["blog"],
          createdAt: new Date().toISOString(),
        });
        await saveConfig(config);
        addedToAiVis = true;
      }
    }

    // 3. Yolu ve sayfaları önbellekten temizle
    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/seo/blog");
    revalidatePath("/admin/seo/kelimeler");
    revalidatePath("/admin/ai-visibility/sorular");

    return NextResponse.json({
      success: true,
      post: updated,
      addedToTracked,
      addedToAiVis,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Yayınlama hatası." },
      { status: 500 }
    );
  }
}
