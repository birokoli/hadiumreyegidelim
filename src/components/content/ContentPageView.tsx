import React from "react";
import Link from "next/link";
import type { ContentPage } from "@/content/pages/types";
import { contentPath } from "@/content/pages/types";
import { BlogEndCta, BlogInlineCta } from "@/components/blog/BlogBrandCta";
import { LastUpdated } from "@/components/seo/PageTrust";
import { SITE_URL } from "@/lib/seo/site";

const SITE = SITE_URL;
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** "[metin](/yol)" ve "[metin](https://…)" bağlantılarını React öğelerine çevirir */
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    const [, label, href] = m;
    parts.push(
      href.startsWith("/") ? (
        <Link key={i} href={href} className="font-semibold text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary">{label}</Link>
      ) : (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary">{label}</a>
      ),
    );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

const plain = (t: string) => t.replace(LINK_RE, "$1");

const GROUP_LABEL: Record<ContentPage["group"], string> = {
  kisi: "Kime göre umre",
  zaman: "Döneme göre umre",
  karsilastirma: "Karşılaştırma",
  sozluk: "Umre sözlüğü",
};

/** Rehber sayfası: kişi, zaman, karşılaştırma ve sözlük gruplarının ortak şablonu */
export default function ContentPageView({ page, whatsappNumber, relatedTitles }: { page: ContentPage; whatsappNumber: string; relatedTitles: Record<string, string> }) {
  const url = `${SITE}${contentPath(page)}`;
  const isGuide = page.group === "karsilastirma" || page.group === "sozluk";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.h1,
      description: page.description,
      inLanguage: "tr-TR",
      dateModified: page.reviewed,
      datePublished: page.reviewed,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Hadi Umreye Gidelim", url: SITE },
      publisher: { "@type": "Organization", name: "Hadi Umreye Gidelim", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE },
        ...(isGuide ? [{ "@type": "ListItem", position: 2, name: "Umre rehberi", item: `${SITE}/umre-rehberi` }] : []),
        { "@type": "ListItem", position: isGuide ? 3 : 2, name: page.h1, item: url },
      ],
    },
    ...(page.term
      ? [{ "@context": "https://schema.org", "@type": "DefinedTerm", name: page.term, description: plain(page.lead), inDefinedTermSet: `${SITE}/umre-rehberi`, url }]
      : []),
  ];

  const mid = Math.min(2, page.sections.length);

  const renderSection = (s: ContentPage["sections"][number]) => (
    <section key={s.h2} className="mt-12">
      <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary">{s.h2}</h2>
      {s.paragraphs.map((p, i) => (
        <p key={i} className="mt-4 text-[17px] leading-[1.9] text-on-surface-variant">
          <RichText text={p} />
        </p>
      ))}
      {s.bullets && (
        <ul className="mt-4 space-y-2 pl-5 list-disc marker:text-primary">
          {s.bullets.map((b) => (
            <li key={b} className="text-[16px] leading-relaxed text-on-surface-variant"><RichText text={b} /></li>
          ))}
        </ul>
      )}
      {s.table && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-outline-variant/30">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-surface-container-low">
              <tr>{s.table.head.map((h) => <th key={h} className="px-4 py-3 font-semibold text-primary">{h}</th>)}</tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, i) => (
                <tr key={i} className="border-t border-outline-variant/20">
                  {r.map((c, j) => <td key={j} className={`px-4 py-3 ${j === 0 ? "font-semibold text-on-surface" : "text-on-surface-variant"}`}><RichText text={c} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <main className="w-full pt-28 pb-16 bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto px-5 md:px-6">
        <nav aria-label="Sayfa yolu" className="text-[13px] text-on-surface-variant">
          <Link href="/" className="hover:text-primary">Anasayfa</Link>
          {isGuide && (<> <span aria-hidden="true">/</span> <Link href="/umre-rehberi" className="hover:text-primary">Umre rehberi</Link></>)}
          <span aria-hidden="true"> / </span><span>{page.h1}</span>
        </nav>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">{GROUP_LABEL[page.group]}</p>
        <h1 className="mt-2 font-headline text-3xl md:text-5xl font-bold text-primary leading-tight">{page.h1}</h1>
        <p className="mt-6 text-lg md:text-xl leading-relaxed text-on-surface"><RichText text={page.lead} /></p>
        <LastUpdated date={page.reviewed} className="mt-4" />

        {page.sections.slice(0, mid).map(renderSection)}
        <BlogInlineCta whatsappNumber={whatsappNumber} topic={page.h1} />
        {page.sections.slice(mid).map(renderSection)}

        <section className="mt-14">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary">Sık sorulan sorular</h2>
          <div className="mt-4 divide-y divide-outline-variant/30 border-y border-outline-variant/30">
            {page.faq.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="font-semibold text-lg text-on-surface">{f.q}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-on-surface-variant"><RichText text={f.a} /></p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-surface-container-low p-6">
          <h2 className="font-headline text-xl font-bold text-primary">Resmî kaynaklar</h2>
          <ul className="mt-3 space-y-1 text-[15px]">
            {page.sources.map((s) => (
              <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{s.text}</a></li>
            ))}
          </ul>
        </section>

        <nav aria-label="İlgili sayfalar" className="mt-10">
          <h2 className="font-headline text-xl font-bold text-primary">İlgili sayfalar</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {page.related.map((r) => (
              <li key={r}>
                <Link href={r} className="block rounded-xl border border-outline-variant/30 px-4 py-3 font-semibold text-on-surface hover:border-primary/50">{relatedTitles[r] ?? r}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
      <BlogEndCta whatsappNumber={whatsappNumber} />
    </main>
  );
}
