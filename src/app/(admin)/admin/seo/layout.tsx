import type { Metadata } from "next";
import SeoNav from "@/components/admin/seo/SeoNav";
import { deskGrotesk, deskMono } from "@/components/admin/seo/fonts";
import "./seo.css";

export const metadata: Metadata = { title: "SEO Masası" };

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`seo-desk ${deskGrotesk.variable} ${deskMono.variable}`}>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12 pt-8 pb-24">
        <SeoNav />
        {children}
      </div>
    </div>
  );
}
