import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Kaldırılan yazılar hâlâ Google'da görünüyordu (1 Ekim raporu): en yakın yaşayan yazıya
      { source: '/blog/mekke-medine-bebek-mamasi-bezi-temini-kolay-mi-2026', destination: '/blog/bebekle-umre-kolay-mi-2026-kurallar-ve-ipuclari', permanent: true },
      { source: '/blog/umre-turlari-2026-bireysel-umre', destination: '/blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari', permanent: true },
      { source: '/blog/2026-umre-turlari-hadi-umreye-gidelim-manevi-yenilenme', destination: '/blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari', permanent: true },
      { source: '/blog/ayak-tabanlarinin-su-toplamamasi-icin-harem-e-ozel-ayakkabi-corap-onerileri-2026', destination: '/blog/mescidi-haram-ziyaret-rehberi', permanent: true },
      // 3 Ekim (Açıklar analizi): aynı "Diyanet umre fiyatları" aramalarında yarışan iki yazı en güçlü yazıya birleştirildi
      { source: '/blog/umre-turlari-2026-bireysel-diyanet-fiyat-karsilastirma', destination: '/blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari', permanent: true },
      { source: '/blog/umre-turlari-2026-fiyat-karsilastirmalari-diyanet-bireysel-vip', destination: '/blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari', permanent: true },
      // G6-3: Kırık iç bağlantı kalıcı yönlendirmeleri (Faz I3)
      { source: "/blog/mescid-i-haram-ziyareti", destination: "/blog/mescidi-haram-ziyaret-rehberi", permanent: true },
      { source: "/blog/nusuk-uygulamasi-kullanimi", destination: "/blog/nusuk-uygulamasi-nasil-kullanilir", permanent: true },
      { source: "/otel-rezervasyonu", destination: "/bireysel-umre", permanent: true },
      { source: "/tren-bileti-al", destination: "/bireysel-umre", permanent: true },
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
