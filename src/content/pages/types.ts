// Programatik rehber sayfaları (3.2): kişi, zaman, karşılaştırma, sözlük.
// Her sayfa bu tipte bir veri dosyasıdır (src/content/pages/<slug>.ts); şablon
// src/components/content/ContentPageView.tsx, kurallar docs/SAYFA-GRUPLARI.md.
//
// Metin içinde link: [görünen metin](/ic-sayfa) ya da [konu kelimesi](https://resmi-kurum...).
// Dış link yalnızca resmî kurum bilgi sayfası olabilir (external-policy.ts denetler).

export type ContentGroup = "kisi" | "zaman" | "karsilastirma" | "sozluk";

export type ContentSection = {
  /** Ara başlık (H2). En az 2 bölüm soru biçiminde olmalı ("…?") */
  h2: string;
  /** Paragraflar; her biri kendi başına alıntılanabilir 40–120 kelime */
  paragraphs: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
};

export type ContentPage = {
  slug: string;
  group: ContentGroup;
  /** Hedef arama kelimesi (SEO Masası → Programatik'teki kelime) */
  keyword: string;
  /** <title> çekirdeği; site adı şablonla eklenir. Çekirdek + " | Hadi Umre'ye Gidelim" ≤ 60 */
  title: string;
  /** Meta açıklama, 120–158 karakter */
  description: string;
  h1: string;
  /** İlk paragraf: sorunun doğrudan cevabı, 40–60 kelime (AI motorları buradan alıntılar) */
  lead: string;
  sections: ContentSection[];
  faq: { q: string; a: string }[];
  /** Resmî kaynaklar (en az 1): diyanet.gov.tr, nusuk.sa, *.gov.sa bilgi sayfaları */
  sources: { text: string; href: string }[];
  /** İç bağlantılar (3–6): mevcut sayfa yolları, ör. "/bireysel-umre" */
  related: string[];
  /** İçeriğin son gözden geçirildiği gün (YYYY-MM-DD) */
  reviewed: string;
  /** Sözlük sayfalarında terim (DefinedTerm şeması) */
  term?: string;
};

/** Grup → yayın yolu */
export function contentPath(page: Pick<ContentPage, "group" | "slug">) {
  return page.group === "kisi" || page.group === "zaman" ? `/${page.slug}` : `/umre-rehberi/${page.slug}`;
}
