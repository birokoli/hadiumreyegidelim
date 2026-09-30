// Bütün rehber sayfalarının kaydı. Yeni sayfa: src/content/pages/<slug>.ts dosyasını yaz,
// buraya import et ve CONTENT_PAGES listesine ekle. Sonra: npx tsx scripts/check-content-pages.mts
import type { ContentPage } from "./types";
import ihramNedir from "./ihram-nedir";

export const CONTENT_PAGES: ContentPage[] = [ihramNedir];

export const getContentPage = (slug: string) => CONTENT_PAGES.find((p) => p.slug === slug);
export { contentPath } from "./types";
export type { ContentPage, ContentGroup, ContentSection } from "./types";
