import { getCatalog } from "@/lib/catalog";
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { turkeyCities } from '@/lib/turkey-cities';
import { contentPath } from '@/content/pages';
import { getLiveContentPages } from '@/content/pages/store';
import { SITE_URL } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

// sayfa içeriği gerçekten değişince elle güncellenir
const STATIC_REVIEWED = "2026-10-02";
const CITY_TEMPLATE_REVIEWED = "2026-10-02";

// 4. Otomatik Sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Yalnızca yayındaki yazılar (taslaklar Google'a bildirilmez)
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { updatedAt: 'desc' }
  }).catch(() => []);

  const categories = await prisma.category.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { posts: { where: { published: true } } }
      }
    }
  }).catch(() => []);

  const packages = await prisma.package.findMany({
    where: { published: true },
    orderBy: { updatedAt: 'desc' }
  }).catch(() => []);

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.filter((c) => c._count.posts > 0).map((category) => ({
    url: `${baseUrl}/blog/kategori/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  const CONTENT_PAGES = await getLiveContentPages();

  const packageUrls = packages.map((pkg) => ({
    url: `${baseUrl}/paketler/${pkg.slug}`,
    lastModified: pkg.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 1.0, // Products are very important
  }));

  // Otel sayfaları (3 Ekim): menüde yok, Google site haritasından bulur
  const hotelUrls: { url: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = (await getCatalog())
    .filter((c) => c.category === "hotel" && c.slug)
    .map((h) => ({ url: `${baseUrl}/oteller/${h.slug}`, changeFrequency: "monthly" as const, priority: 0.6 }));
  hotelUrls.push({ url: `${baseUrl}/yorumlar`, changeFrequency: "weekly" as const, priority: 0.6 });
  if (hotelUrls.length > 1) hotelUrls.unshift({ url: `${baseUrl}/oteller`, changeFrequency: "weekly" as const, priority: 0.7 });

  const latestPostDate = posts[0]?.updatedAt ? posts[0].updatedAt.toISOString().split("T")[0] : STATIC_REVIEWED;

  return [
    {
      url: baseUrl,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/hizmetler`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...["eylul-umresi", "ilk-umrem", "hanim-umresi"].map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/kvkk`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanim-sartlari`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/bireysel-umre`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/paketler`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rehberlik`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/umre-vizesi`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/umre-vizesi/basvuru`,
      lastModified: STATIC_REVIEWED,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...blogUrls,
    ...hotelUrls,
    ...packageUrls,
    // Rehber sayfaları (3.2): ana sayfada listelenmez, Google sitemap ve /umre-rehberi'den bulur
    {
      url: `${baseUrl}/umre-rehberi`,
      lastModified: CONTENT_PAGES.map((p) => p.reviewed).sort().at(-1) ?? STATIC_REVIEWED,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...CONTENT_PAGES.map((p) => ({
      url: `${baseUrl}${contentPath(p)}`,
      lastModified: p.reviewed,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...turkeyCities.map((city) => ({
      url: `${baseUrl}/${city.slug}-cikisli-bireysel-umre`,
      lastModified: CITY_TEMPLATE_REVIEWED,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
