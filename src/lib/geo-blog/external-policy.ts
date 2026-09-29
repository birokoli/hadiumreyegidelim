// Dış link politikası: blog yazılarında yalnızca resmî kurumların bilgi sayfalarına link verilir
// (Diyanet, Nusuk, Suudi devlet siteleri). Sattığımız hizmetlerin (vize, otel, uçuş, transfer,
// tren, paket, rehberlik) dış sayfalarına link verilmez; o konular kendi sayfamıza bağlanır. Rakip firma sitelerine link verilmez ve
// rakip adları yazıda geçmez. Link, kurum adına değil konuyla ilgili kelimeye verilir
// ("umre vizesi başvurusu" gibi; "Nusuk sitesi" gibi değil).

import { loadConfig } from "@/lib/ai-vis/store";

/** İzinli alan adları; alt alan adları da geçerlidir (hac.diyanet.gov.tr, haj.gov.sa). */
const ALLOWED_DOMAINS = ["diyanet.gov.tr", "nusuk.sa", "gov.sa"];

/** Claude web aramasının bakabileceği siteler (arama sonuçları yalnızca bunlardan gelir).
 *  Vize portalları ve turizm/rezervasyon siteleri bilerek yok: o hizmetleri biz satıyoruz. */
export const RESEARCH_DOMAINS = ["diyanet.gov.tr", "hac.diyanet.gov.tr", "nusuk.sa", "haj.gov.sa", "moh.gov.sa"];

/**
 * Sattığımız hizmetler: bu konularda müşteriyi dışarı göndermeyiz, kendi sayfamıza link veririz.
 * Sıra önemli: ilk eşleşen kullanılır.
 */
export const SOLD_SERVICES: { label: string; path: string; pattern: RegExp }[] = [
  { label: "vize", path: "/umre-vizesi", pattern: /vize|visa/i },
  { label: "paket", path: "/paketler", pattern: /paket|tur(u|lar|ları)?\b|fiyat/i },
  { label: "rehberlik", path: "/rehberlik", pattern: /rehber(li|lik)?\b/i },
  { label: "transfer / tren", path: "/hizmetler", pattern: /transfer|tren|haramain/i },
  { label: "otel / uçuş", path: "/bireysel-umre", pattern: /otel|konaklama|u[çc]u[şs]|u[çc]ak|bilet|rezervasyon/i },
];

/** Satış yaptığımız bir konuyu anlatan metinse, müşterinin gideceği kendi sayfamızı döndürür */
export function soldServiceFor(text: string) {
  return SOLD_SERVICES.find((s) => s.pattern.test(text)) ?? null;
}

// Alan adı izinli olsa bile satış/rezervasyon sayfaları dışarıda kalır (vize portalı, otel, uçuş, paket)
const SALES_HOST = /^(visa|evisa|umrah|booking|shop|store)\./i;
const SALES_PATH = /visa|vize|booking|book|reserv|hotel|otel|flight|transfer|train|package|paket|shop|store|buy|checkout|cart/i;

export function isAllowedExternal(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (!ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return false;
    return !SALES_HOST.test(host) && !SALES_PATH.test(u.pathname + u.search);
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
 * İzinsiz dış linkleri temizler: sattığımız bir hizmeti anlatan link kendi sayfamıza çevrilir,
 * diğer izinsiz linkler kaldırılır ve metni düz yazı olarak kalır.
 * Eski yazıları temizlemek ve kalite kapısından sonra son güvence için kullanılır.
 */
export function stripDisallowedLinks(html: string) {
  let removed = 0;
  let redirected = 0;
  const out = html.replace(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (full, href: string, inner: string) => {
    if (/^https?:\/\/(www\.)?hadiumreyegidelim\.com/i.test(href)) return full;
    const service = soldServiceFor(inner.replace(/<[^>]+>/g, " "));
    if (service) {
      redirected++;
      return `<a href="${service.path}">${inner}</a>`;
    }
    if (isAllowedExternal(href)) return full;
    removed++;
    return inner;
  });
  return { html: out, removed, redirected };
}
