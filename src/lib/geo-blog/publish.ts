import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { loadConfig, saveConfig } from "@/lib/ai-vis/store";
import { readJson, SEO_KEYS, writeJson } from "@/lib/seo/store";
import type { TrackedKeyword } from "@/lib/seo/types";

const fold = (s: string) => s.toLocaleLowerCase("tr").trim();
const MAX_TRACKED = 50;
const MAX_PROMPTS = 60;

/**
 * Yazıyı yayınlar ve ölçüme bağlar: odak kelime SEO sıra takibine, yazının cevapladığı
 * soru AI Görünürlük sorularına eklenir. Hem yayınla düğmesi hem cron bunu kullanır.
 */
export async function publishPost(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Yazı bulunamadı.");

  const updated = post.published ? post : await prisma.post.update({ where: { id: postId }, data: { published: true, scheduledAt: null } });
  const notes: string[] = [];

  // 1. Odak kelime → sıra takibi (50 kelime sınırı)
  const keyword = updated.focusKeyword?.trim();
  if (keyword) {
    const tracked = await readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []);
    if (tracked.some((t) => fold(t.keyword) === fold(keyword))) notes.push("kelime zaten takipte");
    else if (tracked.length >= MAX_TRACKED) notes.push("sıra takibi dolu (50), kelime eklenmedi");
    else {
      await writeJson(SEO_KEYS.tracked, [...tracked, { keyword: fold(keyword), addedAt: new Date().toISOString(), history: [] }]);
      notes.push("kelime sıra takibine eklendi");
    }
  }

  // 2. Yazının cevapladığı soru → AI Görünürlük (başlık soru değilse kelimeden soru kurulur)
  const promptText = updated.title.trim().endsWith("?")
    ? updated.title.trim()
    : `${keyword || updated.title.trim()} hakkında bilgi verir misin?`;
  const config = await loadConfig();
  if (config.prompts.some((p) => fold(p.text) === fold(promptText))) notes.push("soru zaten AI takibinde");
  else if (config.prompts.length >= MAX_PROMPTS) notes.push("AI soru listesi dolu (60), soru eklenmedi");
  else {
    config.prompts.push({ id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, text: promptText, tags: ["blog"], createdAt: new Date().toISOString() });
    await saveConfig(config);
    notes.push("soru AI Görünürlük'e eklendi");
  }

  for (const path of ["/blog", `/blog/${updated.slug}`, "/sitemap.xml", "/llms.txt", "/"]) {
    try {
      revalidatePath(path);
    } catch {
      /* önbellek temizliği yayını engellemez */
    }
  }
  return { post: updated, notes };
}
