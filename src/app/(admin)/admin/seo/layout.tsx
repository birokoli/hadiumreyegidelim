import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import SeoNav from "@/components/admin/seo/SeoNav";
import "./seo.css";

const grotesk = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-seo",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-seo-mono",
});

export const metadata: Metadata = { title: "SEO Masası" };

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`seo-desk ${grotesk.variable} ${mono.variable}`}>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12 pt-8 pb-24">
        <SeoNav />
        {children}
      </div>
    </div>
  );
}
