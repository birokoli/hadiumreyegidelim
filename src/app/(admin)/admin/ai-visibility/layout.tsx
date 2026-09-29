import type { Metadata } from "next";
import { AiVisProvider } from "@/components/admin/ai-vis/AiVisProvider";
import { AiNav } from "@/components/admin/ai-vis/parts";
import { deskGrotesk, deskMono } from "@/components/admin/seo/fonts";
import "../seo/seo.css";

export const metadata: Metadata = { title: "AI Görünürlük" };

export default function AiVisibilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`seo-desk ${deskGrotesk.variable} ${deskMono.variable}`}>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12 pt-8 pb-24">
        <AiNav />
        <AiVisProvider>{children}</AiVisProvider>
      </div>
    </div>
  );
}
