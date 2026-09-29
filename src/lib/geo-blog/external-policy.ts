// Dış link politikası: blog yazılarında yalnızca resmî kurumlara link verilir
// (Diyanet, Nusuk, Suudi devlet siteleri). Rakip firma sitelerine link verilmez ve
// rakip adları yazıda geçmez. Link, kurum adına değil konuyla ilgili kelimeye verilir
// ("umre vizesi başvurusu" gibi; "Nusuk sitesi" gibi değil).

import { loadConfig } from "@/lib/ai-vis/store";

/** İzinli alan adları; alt alan adları da geçerlidir (hac.diyanet.gov.tr, visa.mofa.gov.sa). */
const ALLOWED_DOMAINS = ["diyanet.gov.tr", "nusuk.sa", "gov.sa", "visitsaudi.com"];

/** Claude web aramasının bakabileceği siteler (arama sonuçları yalnızca bunlardan gelir) */
export const RESEARCH_DOMAINS = [
  "diyanet.gov.tr",
  "hac.diyanet.gov.tr",
  "nusuk.sa",
  "haj.gov.sa",
  "mofa.gov.sa",
  "visa.mofa.gov.sa",
  "moh.gov.sa",
  "my.gov.sa",
  "visitsaudi.com",
];

export function isAllowedExternal(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

// Link metni kurum/site adı ya da adres olmamalı; konu kelimesi olmalı
const INSTITUTION_ANCHOR = /diyanet|nusuk|bakanlı|başkanlı|resm[iî] (site|sayfa)|sitesi|portal|https?:|www\.|\.gov|\.sa\b|\.com\b/i;

export function anchorLooksLikeName(anchor: string) {
  return INSTITUTION_ANCHOR.test(anchor.trim());
}

/** HTML içindeki dış linkleri (href + görünen metin) çıkarır */
export function externalAnchors(html: string) {
  return [...html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .filter((m) => !/^https?:\/\/(www\.)?hadiumreyegidelim\.com/i.test(m[1]))
    .map((m) => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, "").trim(), raw: m[0] }));
}

/** AI Görünürlük'e girilen rakiplerin adları, takma adları ve alan adları */
export async function loadCompetitorTerms(): Promise<string[]> {
  const config = await loadConfig().catch(() => null);
  const terms = (config?.competitors ?? []).flatMap((c) => [c.name, ...c.aliases, ...c.domains.map((d) => d.replace(/^www\./, ""))]);
  return [...new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 3))];
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Metinde geçen rakip adlarını bulur (Türkçe harflerde doğru çalışan tam kelime eşleşmesi) */
export function findCompetitorMentions(text: string, terms: string[]) {
  const plain = text.replace(/<[^>]+>/g, " ");
  return terms.filter((t) => new RegExp(`(?<!\\p{L})${escapeRe(t)}(?!\\p{L})`, "iu").test(plain));
}

/**
 * İzinsiz dış linkleri kaldırır, link metnini düz yazı olarak bırakır.
 * Eski yazıları temizlemek ve kalite kapısından sonra son güvence için kullanılır.
 */
export function stripDisallowedLinks(html: string) {
  let removed = 0;
  const out = html.replace(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (full, href: string, inner: string) => {
    if (/^https?:\/\/(www\.)?hadiumreyegidelim\.com/i.test(href) || isAllowedExternal(href)) return full;
    removed++;
    return inner;
  });
  return { html: out, removed };
}
