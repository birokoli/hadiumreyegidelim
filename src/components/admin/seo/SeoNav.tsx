"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const SEO_CHAPTERS = [
  { href: "/admin/seo", n: "01", label: "Durum" },
  { href: "/admin/seo/denetim", n: "02", label: "Denetim" },
  { href: "/admin/seo/kelimeler", n: "03", label: "Kelimeler" },
  { href: "/admin/seo/siralar", n: "04", label: "Sıralar" },
  { href: "/admin/seo/rakipler", n: "05", label: "Rakipler" },
  { href: "/admin/seo/programatik", n: "06", label: "Programatik" },
];

export default function SeoNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="SEO bölümleri" className="mb-14 flex flex-wrap items-baseline gap-x-7 gap-y-3">
      <span className="mr-3 text-[15px] font-extrabold tracking-tight">SEO Masası</span>
      {SEO_CHAPTERS.map((c) => {
        const active = c.href === "/admin/seo" ? pathname === c.href : pathname.startsWith(c.href);
        return (
          <Link
            key={c.href}
            href={c.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-baseline gap-1.5 text-[15px] font-semibold transition-colors ${
              active ? "text-[var(--seo-ink)]" : "text-[var(--seo-ink-3)] hover:text-[var(--seo-ink)]"
            }`}
          >
            <span className={`text-[11px] tabular-nums ${active ? "text-[var(--seo-mark)]" : ""}`}>{c.n}</span>
            {c.label}
          </Link>
        );
      })}
      <Link href="/admin/ai-visibility" className="ml-auto text-[13px] font-semibold text-[var(--seo-ink-3)] hover:text-[var(--seo-ink)]">
        AI görünürlük analizi ↗
      </Link>
    </nav>
  );
}
