import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-noto-serif" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hadiumreyegidelim.com"),
  title: {
    template: "%s | Hadi Umreye Gidelim",
    default: "Umre Fiyatları ve Turları 2026 | Özel, VIP ve Bireysel Umre",
  },
  description: "2026 Yılı Umre Turları, VIP, Lüks, ve Bireysel Aile Umresi paketleri. En uygun fiyatlarla lüks otellerde maneviyat dolu özel bir Umre deneyimi planlayın.",
  keywords: ["umre", "umre turları", "umre fiyatları 2026", "bireysel umre", "vip umre", "lüks umre", "özel umre turları", "aile umresi", "mekke otelleri", "medine otelleri"],
  icons: {
    icon: '/favicon.png?v=2',
    apple: '/favicon.png?v=2'
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: "Umre Turları ve Fiyatları 2026 | Özel Bireysel Umre & VIP Konfor",
    description: "2026 Umre Paketleri: Diyanet Onaylı vizelerle, sadece ailenize ve size özel, konforlu, Mescid-i Haram'a sıfır lüks butik ve VIP Bireysel Umre organizasyonu.",
    url: 'https://hadiumreyegidelim.com',
    siteName: "Hadi Umreye Gidelim",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Kabe Manzaralı VIP Butik Umre Deneyimi',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: "https://hadiumreyegidelim.com",
  }
};

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hadi Umreye Gidelim",
    "image": "https://hadiumreyegidelim.com/logo.png",
    "@id": "https://hadiumreyegidelim.com",
    "url": "https://hadiumreyegidelim.com",
    "telephone": "+905404010038",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR"
    },
    "description": "2026 Yılı Özel, Lüks, ve Bireysel Aile Umresi Planlama Platformu. Size özel tasarım VIP turlarla maneviyat dolu bir seyahat organizatörü.",
    "sameAs": [
      "https://instagram.com/hadiumreyegidelim",
      "https://youtube.com/@hadiumreyegidelim"
    ]
  };

  return (
    <html lang="tr" className={`${inter.variable} ${notoSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@300,0,0&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface text-neutral-900 font-body selection:bg-tertiary-fixed-dim selection:text-on-tertiary-fixed">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
