import type { NextConfig } from "next";

const nextConfig: any = {
  async redirects() {
    return [
      {
        source: '/tasarla',
        destination: '/bireysel-umre',
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
