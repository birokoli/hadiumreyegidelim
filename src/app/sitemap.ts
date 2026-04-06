import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { turkeyCities } from '@/lib/turkey-cities';

// 4. Otomatik Sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hadiumreyegidelim.com';

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  const categories = await prisma.category.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.filter((c: any) => c._count.posts > 0).map((category: any) => ({
    url: `${baseUrl}/blog/kategori/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/bireysel-umre`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/paketler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rehberlik`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/umre-vizesi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...blogUrls,
    ...turkeyCities.map((city) => ({
      url: `${baseUrl}/${city.slug}-cikisli-bireysel-umre`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
