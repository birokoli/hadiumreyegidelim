"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type Chapter = { href: string; n: string; label: string };

export default function DeskNav({ title, chapters, cross }: { title: string; chapters: Chapter[]; cross: { href: string; label: string } }) {
  const pathname = usePathname();
  const root = chapters[0].href;
  return (
    <nav aria-label={`${title} bölümleri`} className="mb-14 flex flex-wrap items-baseline gap-x-7 gap-y-3">
      <span className="mr-3 text-[15px] font-extrabold tracking-tight">{title}</span>
      {chapters.map((c) => {
        const active = c.href === root ? pathname === c.href : pathname.startsWith(c.href);
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
      <Link href={cross.href} className="ml-auto text-[13px] font-semibold text-[var(--seo-ink-3)] hover:text-[var(--seo-ink)]">
        {cross.label} ↗
      </Link>
    </nav>
  );
}
