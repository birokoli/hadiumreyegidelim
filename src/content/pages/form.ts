// Admin düzenleyicisinin form biçimi <-> ContentPage dönüşümü (istemci ve test ortak kullanır)
import type { ContentPage } from "./types";

/** Düzenleyicideki bölüm: listeler düz metin alanı olarak tutulur */
export type SectionForm = { h2: string; paragraphs: string; bullets: string; table: string };
export type Form = {
  keyword: string; title: string; description: string; h1: string; lead: string; term: string;
  sections: SectionForm[]; faq: { q: string; a: string }[]; sources: string; related: string;
};

export const SUFFIX = " | Hadi Umre'ye Gidelim";
export const words = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).filter(Boolean).length;
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function toForm(p: ContentPage): Form {
  return {
    keyword: p.keyword, title: p.title, description: p.description, h1: p.h1, lead: p.lead, term: p.term ?? "",
    sections: p.sections.map((s) => ({
      h2: s.h2,
      paragraphs: s.paragraphs.join("\n\n"),
      bullets: (s.bullets ?? []).join("\n"),
      table: s.table ? [s.table.head, ...s.table.rows].map((r) => r.join(" | ")).join("\n") : "",
    })),
    faq: p.faq.map((f) => ({ ...f })),
    sources: p.sources.map((s) => `${s.text} | ${s.href}`).join("\n"),
    related: p.related.join("\n"),
  };
}

export function fromForm(f: Form) {
  return {
    keyword: f.keyword, title: f.title, description: f.description, h1: f.h1, lead: f.lead, term: f.term,
    sections: f.sections.map((s) => {
      const rows = lines(s.table).map((l) => l.split("|").map((c) => c.trim()));
      return {
        h2: s.h2,
        paragraphs: s.paragraphs.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean),
        bullets: lines(s.bullets),
        table: rows.length > 1 ? { head: rows[0], rows: rows.slice(1) } : undefined,
      };
    }),
    faq: f.faq,
    sources: lines(f.sources).map((l) => {
      const i = l.lastIndexOf("|");
      return i > 0 ? { text: l.slice(0, i).trim(), href: l.slice(i + 1).trim() } : { text: l, href: "" };
    }),
    related: lines(f.related),
  };
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strList = (v: unknown, max = 5000) => (Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean) : []);

/** Formdan gelen veriyi ContentPage biçimine sokar; slug ve grup koddan gelir, değiştirilemez */
export function sanitizeContentPage(input: Record<string, unknown>, code: ContentPage): ContentPage {
  const sections = Array.isArray(input.sections) ? input.sections : [];
  const faq = Array.isArray(input.faq) ? input.faq : [];
  const sources = Array.isArray(input.sources) ? input.sources : [];
  return {
    slug: code.slug,
    group: code.group,
    keyword: str(input.keyword, 120) || code.keyword,
    title: str(input.title, 120),
    description: str(input.description, 300),
    h1: str(input.h1, 160),
    lead: str(input.lead, 2000),
    term: code.group === "sozluk" ? str(input.term, 80) || undefined : undefined,
    sections: sections.slice(0, 20).map((raw) => {
      const s = (raw ?? {}) as Record<string, unknown>;
      const table = s.table as { head?: unknown; rows?: unknown } | undefined;
      const head = strList(table?.head, 200);
      const rows = Array.isArray(table?.rows) ? (table!.rows as unknown[]).map((r) => strList(r, 500)).filter((r) => r.length) : [];
      const bullets = strList(s.bullets, 1000);
      return {
        h2: str(s.h2, 200),
        paragraphs: strList(s.paragraphs),
        ...(bullets.length ? { bullets } : {}),
        ...(head.length && rows.length ? { table: { head, rows } } : {}),
      };
    }).filter((s) => s.h2),
    faq: faq.slice(0, 10).map((raw) => {
      const f = (raw ?? {}) as Record<string, unknown>;
      return { q: str(f.q, 300), a: str(f.a, 2000) };
    }).filter((f) => f.q && f.a),
    sources: sources.slice(0, 10).map((raw) => {
      const s = (raw ?? {}) as Record<string, unknown>;
      return { text: str(s.text, 200), href: str(s.href, 500) };
    }).filter((s) => s.text && s.href),
    related: strList(input.related, 200).slice(0, 10),
    reviewed: today(),
  };
}
