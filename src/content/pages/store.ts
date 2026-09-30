// Rehber sayfalarının canlı hâli: kod dosyası (src/content/pages/<slug>.ts) varsayılandır,
// admin → İçerik Stüdyosu → Rehber Sayfaları'nda kaydedilen sürüm onun yerine geçer.
// Kayıt Setting tablosunda "CONTENT_PAGE:<slug>" anahtarıyla tutulur (site ayarları önbelleğine girmez).
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CONTENT_PAGES } from "./index";
import { contentPath, type ContentPage } from "./types";

export const CONTENT_OVERRIDE_PREFIX = "CONTENT_PAGE:";
export const CONTENT_PAGES_TAG = "content-pages";

/** Admin'de kaydedilen sürüm; `baseReviewed` kaydedildiği andaki kod sürümünün tarihi */
export type ContentOverride = { page: ContentPage; savedAt: string; savedBy: string; baseReviewed: string };

async function queryOverrides(): Promise<Record<string, ContentOverride>> {
  const rows = await prisma.setting.findMany({ where: { key: { startsWith: CONTENT_OVERRIDE_PREFIX } }, select: { key: true, value: true } });
  const out: Record<string, ContentOverride> = {};
  for (const r of rows) {
    try {
      out[r.key.slice(CONTENT_OVERRIDE_PREFIX.length)] = JSON.parse(r.value) as ContentOverride;
    } catch {
      /* bozuk kayıt: kod sürümü kullanılır */
    }
  }
  return out;
}

const readOverrides = unstable_cache(queryOverrides, ["content-pages-v1"], { tags: [CONTENT_PAGES_TAG], revalidate: 600 });

/** Önbellek ya da veritabanı hata verirse kod sürümleri kullanılır; sayfa asla boş kalmaz */
export async function getContentOverrides(fresh = false): Promise<Record<string, ContentOverride>> {
  try {
    return fresh ? await queryOverrides() : await readOverrides();
  } catch {
    return {};
  }
}

/** Slug ve grup (dolayısıyla adres) her zaman koddan gelir; admin yalnızca içeriği değiştirir */
function merge(code: ContentPage, ov?: ContentOverride): ContentPage {
  return ov ? { ...ov.page, slug: code.slug, group: code.group } : code;
}

export async function getLiveContentPages(): Promise<ContentPage[]> {
  const ov = await getContentOverrides();
  return CONTENT_PAGES.map((p) => merge(p, ov[p.slug]));
}

export async function getLiveContentPage(slug: string): Promise<ContentPage | undefined> {
  const code = CONTENT_PAGES.find((p) => p.slug === slug);
  if (!code) return undefined;
  const ov = await getContentOverrides();
  return merge(code, ov[slug]);
}

/** Kayıttan sonra: sayfa, rehber merkezi, sitemap ve llms.txt beklemeden tazelenir */
export function revalidateContentPage(page: Pick<ContentPage, "group" | "slug">) {
  const paths = [contentPath(page), "/umre-rehberi", "/sitemap.xml", "/llms.txt"];
  try {
    revalidateTag(CONTENT_PAGES_TAG, { expire: 0 });
  } catch {
    /* tazeleme kaydı engellemez */
  }
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      /* tazeleme kaydı engellemez */
    }
  }
}
