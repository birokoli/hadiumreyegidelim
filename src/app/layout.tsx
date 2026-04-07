import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-noto-serif" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hadiumreyegidelim.com"),
  title: {
    template: "%s | Hadi Umreye Gidelim",
    default: "Bireysel Umre Nasıl Yapılır? Vize ve Özel Paket Fiyatları 2026",
  },
  description: "Bireysel umre vizesi nasıl alınır? Diyanete veya turlara bağımlı kalmadan, 2026 Özel Bireysel Umre ve VIP Aile umresi fiyatları hakkında şeffaf rehber.",
  keywords: ["bireysel umre", "bireysel umre vizesi", "bireysel umre nasıl yapılır", "bireysel umre vizesi nasıl alınır", "diyanetsiz umre", "umre fiyatları 2026", "özel umre", "kendi imkanlarıyla umre", "vip umre"],
  icons: {
    icon: '/logo.png?v=5',
    apple: '/logo.png?v=5'
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: "Bireysel Umre Rehberi | Suudi Arabistan e-Vize & Özel Fiyatlar 2026",
    description: "Bireysel umre vizesi nasıl alınır? Diyanet turlarına bağlanmadan, Mescid-i Haram'a sıfır, sadece ailenize özel butik umre organizasyonu kurun ve tasarruf edin.",
    url: 'https://hadiumreyegidelim.com',
    siteName: "Hadi Umreye Gidelim",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Bireysel VIP Umre Deneyimi ve Rehberlik',
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
  const jsonLd = [
    {
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
      "description": "2026 Yılı Özel, Lüks, ve Bireysel Aile Umresi Planlama Platformu.",
      "sameAs": [
        "https://instagram.com/hadiumreyegidelim",
        "https://youtube.com/@hadiumreyegidelim"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Bireysel umre nasıl yapılır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bireysel umre, kafilelere bağlı kalmadan kendi otel ve uçuş tarihlerinizi seçtiğiniz konforlu bir ibadet yöntemidir. Isı haritamızdan yeşil fırsat günlerini seçerek vize, transfer ve lüks konaklamanızı anında organize edebilir, tasarruf edebilirsiniz."
          }
        },
        {
          "@type": "Question",
          "name": "Bireysel umre vizesi nasıl alınır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bireysel umre vizeleri tamamen yasal olarak 24 saat içinde Nusuk sistemiyle tarafımızca alınmaktadır. Otel ve uçak kombinasyonunuz kesinleştikten sonra bürokrasiye takılmadan 1 yıllık çok girişli turistik veya Suudi Arabistan e-vizeniz temin edilir."
          }
        },
        {
          "@type": "Question",
          "name": "Diyanet turları olmadan kendi imkanlarıyla umre yapılabilir mi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Evet. Suudi Arabistan'ın son esnek kuralları sayesinde, yüksek komisyon alan tur şirketlerine mahkum kalmadan diyanetsiz bireysel umre yapmak son derece kolay ve yasaldır."
          }
        }
      ]
    }
  ];

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
