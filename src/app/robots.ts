import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

// 4. Otomatik Robots.txt
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profil/'], // Güvenlik için admin panelini robotlardan gizle
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
