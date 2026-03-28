import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-noto-serif" });

export const metadata: Metadata = {
  title: "Hadi Umre'ye Gidelim | Özel Aile & Vip Umre Tasarımınız",
  description: "Ruhunuzun ritmini kalabalıklara teslim etmeyin. Sadece ailenize ve size özel, konforlu, butik ve maneviyat dolu Umre organizasyonu.",
  icons: {
    icon: '/favicon.png?v=2',
    apple: '/favicon.png?v=2'
  }
};

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${notoSerif.variable}`}>
      <head>
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
