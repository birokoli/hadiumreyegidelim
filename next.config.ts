import type { NextConfig } from "next";

const nextConfig: any = {
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
