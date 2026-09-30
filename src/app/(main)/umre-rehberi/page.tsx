import { SITE_URL } from "@/lib/seo/site";
import Link from "next/link";
import { Metadata } from "next";
import { contentPath } from "@/content/pages";
import { getLiveContentPages } from "@/content/pages/store";
import { LastUpdated } from "@/components/seo/PageTrust";

export const metadata: Metadata = {
  title: "Umre Rehberi: Terimler ve Karşılaştırmalar",
  description: "İhram, tavaf, sa'y gibi umre terimlerinin anlamları; bireysel umre, dönem ve kişiye göre umre planlama rehberleri. Hadi Umreye Gidelim'in umre rehberi.",
  alternates: { canonical: `${SITE_URL}/umre-rehberi` },
};

const GROUPS = [
  { id: "sozluk", title: "Umre sözlüğü" },
  { id: "karsilastirma", title: "Karşılaştırmalar" },
  { id: "kisi", title: "Kime göre umre" },
  { id: "zaman", title: "Döneme göre umre" },
] as const;

/** Rehber sayfalarının merkezi (ana sayfada listelenmez; Google bu sayfadan ve sitemap'ten bulur) */
export default async function UmreRehberiHub() {
  const CONTENT_PAGES = await getLiveContentPages();
  const latest = CONTENT_PAGES.map((p) => p.reviewed).sort().at(-1);
  return (
    <main className="w-full pt-28 pb-16 bg-surface">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary">Umre rehberi</h1>
        <p className="mt-5 text-lg leading-relaxed text-on-surface">
          Umre ibadetinin adımlarını, sık geçen terimleri ve umreyi kime ve hangi döneme göre nasıl planlayacağınızı anlatan rehber sayfaları. Bireysel umrenizi planlamak için <Link href="/bireysel-umre" className="font-semibold text-primary underline underline-offset-4">tasarlayıcıyı</Link> kullanabilirsiniz.
        </p>
        {latest && <LastUpdated date={latest} className="mt-3" />}
        {GROUPS.map((g) => {
          const pages = CONTENT_PAGES.filter((p) => p.group === g.id);
          if (!pages.length) return null;
          return (
            <section key={g.id} className="mt-10">
              <h2 className="font-headline text-2xl font-bold text-primary">{g.title}</h2>
              <ul className="mt-4 divide-y divide-outline-variant/30 border-y border-outline-variant/30">
                {pages.map((p) => (
                  <li key={p.slug} className="py-4">
                    <Link href={contentPath(p)} className="font-semibold text-lg text-on-surface hover:text-primary">{p.h1}</Link>
                    <p className="mt-1 text-[15px] text-on-surface-variant">{p.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
