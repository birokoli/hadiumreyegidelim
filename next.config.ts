import type { NextConfig } from "next";

const nextConfig: any = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.hadiumreyegidelim.com' }],
        destination: 'https://hadiumreyegidelim.com/:path*',
        permanent: true,
      },
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

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
