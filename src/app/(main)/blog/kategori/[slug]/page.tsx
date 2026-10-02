import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/ui/kit";
import { BlogGrid, BlogTopics } from "@/components/blog/BlogList";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Kategori bulunamadı", robots: { index: false } };
  return {
    title: `${category.name}: Umre Rehber Yazıları`,
    description: category.description || `${category.name} konusundaki umre rehber yazıları.`,
    alternates: { canonical: `/blog/kategori/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        posts: {
          where: { published: true },
          orderBy: { createdAt: "desc" },
          select: { id: true, slug: true, title: true, description: true, imageUrl: true, createdAt: true, author: true, authorModel: { select: { name: true } } },
        },
      },
    }),
    prisma.category.findMany({ where: { posts: { some: { published: true } } }, orderBy: { name: "asc" }, select: { id: true, slug: true, name: true } }),
  ]);
  if (!category) notFound();

  return (
    <main>
      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Blog", href: "/blog" }, { label: category.name }]}
        kicker={`Blog · ${category.posts.length} yazı`}
        title={category.name}
        lead={category.description || undefined}
      >
        <BlogTopics categories={categories} active={slug} />
      </PageHero>
      <BlogGrid posts={category.posts} />
    </main>
  );
}
