import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";

// SEO Masası ve AI Görünürlük aynı masa düzenini paylaşır
export const deskGrotesk = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-seo",
});

export const deskMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-seo-mono",
});
