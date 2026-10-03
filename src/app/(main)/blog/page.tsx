import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/ui/kit";
import { getPageTexts } from "@/lib/page-texts";
import { BlogGrid, BlogTopics } from "@/components/blog/BlogList";

export const metadata = {
  title: "Umre Rehber Yazıları",
  description: "Umre vizesi, Mekke ve Medine otel seçimi, Haremeyn treni, ziyaret yerleri ve bireysel umre hazırlığı üzerine güncel rehber yazıları.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 60;

export default async function BlogIndexPage() {
  const t = await getPageTexts("blog");
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, description: true, imageUrl: true, createdAt: true, author: true, authorModel: { select: { name: true } } },
    }),
    prisma.category.findMany({ where: { posts: { some: { published: true } } }, orderBy: { name: "asc" }, select: { id: true, slug: true, name: true } }),
  ]);

  return (
    <main>
      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Blog" }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
      >
        <BlogTopics categories={categories} />
      </PageHero>
      <BlogGrid posts={posts} />
    </main>
  );
}
