import { ButtonLink, ChipLink, EmptyState, Panel, PostCard, Section } from "@/components/ui/kit";

type Post = { id: string; slug: string; title: string; description: string | null; imageUrl: string | null; createdAt: Date; author: string | null; authorModel: { name: string } | null };
type Category = { id: string; slug: string; name: string };

/** Blog konu satırı: "Tümü" + yayında yazısı olan kategoriler */
export function BlogTopics({ categories, active }: { categories: Category[]; active?: string }) {
  return (
    <nav aria-label="Blog konuları" className="mt-6 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
      <ChipLink href="/blog" active={!active}>Tümü</ChipLink>
      {categories.map((c) => (
        <ChipLink key={c.id} href={`/blog/kategori/${c.slug}`} active={active === c.slug}>{c.name}</ChipLink>
      ))}
    </nav>
  );
}

/** Yazı ızgarası + altta planlayıcı çağrısı */
export function BlogGrid({ posts }: { posts: Post[] }) {
  return (
    <>
      <Section className="pt-0 md:pt-0">
          {posts.length === 0 ? (
            <EmptyState onWhite>Bu konuda henüz yayınlanmış yazı yok.</EmptyState>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {posts.map((p) => (
                <PostCard key={p.id} href={`/blog/${p.slug}`} title={p.title} description={p.description} image={p.imageUrl} date={p.createdAt} author={p.authorModel?.name ?? p.author?.trim()} />
              ))}
            </div>
          )}
      </Section>
      <Section className="pt-0 md:pt-0">
          <Panel tone="primary" className="md:flex md:items-center md:justify-between gap-6 p-6 md:p-8">
            <div>
              <h2 className="font-headline text-xl md:text-2xl font-bold">Okudunuz, şimdi planlayın</h2>
              <p className="mt-1 text-sm text-white/80 max-w-xl">Tarihlerinizi, Mekke ve Medine otelinizi, transferinizi seçin; fiyatı anında görün.</p>
            </div>
            <ButtonLink href="/bireysel-umre" tone="light" className="mt-4 md:mt-0 shrink-0">Umremi planla</ButtonLink>
          </Panel>
      </Section>
    </>
  );
}
