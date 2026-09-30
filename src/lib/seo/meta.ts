// Sayfa başlığı ve açıklaması için ortak kurallar (denetimdeki title-long / description sorunları).
// Kök düzen başlığa " | Hadi Umre'ye Gidelim" ekler; sayfa başlığında site adı tekrar yazılmaz.

export const SITE_NAME = "Hadi Umre'ye Gidelim";
const TEMPLATE_SUFFIX = ` | ${SITE_NAME}`;
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 158;

export const DEFAULT_OG_IMAGE = {
  url: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1200&auto=format&fit=crop",
  width: 1200,
  height: 630,
  alt: "Mescid-i Haram ve Kâbe",
};

const BRAND_RE = /\s*[|—–-]\s*hadi\s*umre'?ye\s*gidelim\b/gi;

/** Metni kelime ortasında kesmeden en fazla `max` karaktere indirir */
export function clampText(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const atSentence = cut.lastIndexOf(". ");
  if (atSentence > max * 0.6) return cut.slice(0, atSentence + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]+$/, "").trim();
}

/**
 * Site adı sığıyorsa şablonla bir kez eklenir, sığmıyorsa hiç eklenmez;
 * sayfanın kendi başlığındaki site adı temizlenir.
 */
export function pageTitle(raw: string): string | { absolute: string } {
  const core = raw.replace(BRAND_RE, "").replace(/\s{2,}/g, " ").trim();
  if (core.length + TEMPLATE_SUFFIX.length <= MAX_TITLE) return core;
  return { absolute: clampText(core, MAX_TITLE) };
}

export function metaDescription(raw: string | null | undefined) {
  return raw ? clampText(raw, MAX_DESCRIPTION) : undefined;
}
