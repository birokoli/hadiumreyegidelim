// Bütün rehber sayfalarının kaydı. Yeni sayfa: src/content/pages/<slug>.ts dosyasını yaz,
// buraya import et ve CONTENT_PAGES listesine ekle. Sonra: npx tsx scripts/check-content-pages.mts
import type { ContentPage } from "./types";
import ihramNedir from "./ihram-nedir";
import tavafNedir from "./tavaf-nedir";
import sayNedir from "./say-nedir";
import mikatNedir from "./mikat-nedir";
import tirasNedir from "./tiras-nedir";

export const CONTENT_PAGES: ContentPage[] = [
  ihramNedir,
  tavafNedir,
  sayNedir,
  mikatNedir,
  tirasNedir,
];

export const getContentPage = (slug: string) => CONTENT_PAGES.find((p) => p.slug === slug);
export { contentPath } from "./types";
export type { ContentPage, ContentGroup, ContentSection } from "./types";
