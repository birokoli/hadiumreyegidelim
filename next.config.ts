import type { NextConfig } from "next";

const nextConfig: any = {
  // Sayfalar build sırasında veritabanından önceden üretilir. İki Vercel projesi aynı anda
  // build ederken bağlantı sınırına takılmamak için işçi ve eş zamanlılık sınırlı; düşen
  // sayfa build'i bozmadan önce yeniden denenir.
  experimental: {
    cpus: 4,
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 40,
    staticGenerationRetryCount: 2,
  },
  async redirects() {
    return [
      {
        source: '/tasarla',
        destination: '/bireysel-umre',
        permanent: true,
      },
      // Yanlış slug prefix düzeltmesi: /blog/blog/:slug → /blog/:slug
      {
        source: '/blog/blog/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

};

export default nextConfig;
