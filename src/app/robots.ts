import { MetadataRoute } from 'next';

// 4. Otomatik Robots.txt
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Güvenlik için admin panelini robotlardan gizle
    },
    sitemap: 'https://hadiumreyegidelim.com/sitemap.xml',
  };
}
