"use client";

import DeskNav from "./DeskNav";

export const SEO_CHAPTERS = [
  { href: "/admin/seo", n: "01", label: "Durum" },
  { href: "/admin/seo/denetim", n: "02", label: "Denetim" },
  { href: "/admin/seo/kelimeler", n: "03", label: "Kelimeler" },
  { href: "/admin/seo/siralar", n: "04", label: "Sıralar" },
  { href: "/admin/seo/rakipler", n: "05", label: "Rakipler" },
  { href: "/admin/seo/programatik", n: "06", label: "Programatik" },
  { href: "/admin/seo/blog", n: "07", label: "Blog" },
];

export default function SeoNav() {
  return <DeskNav title="SEO Masası" chapters={SEO_CHAPTERS} cross={{ href: "/admin/ai-visibility", label: "AI Görünürlük" }} />;
}
