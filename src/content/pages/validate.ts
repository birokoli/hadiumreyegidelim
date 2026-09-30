// Rehber sayfası kalite kuralları (docs/SAYFA-GRUPLARI.md). Hem denetim betiği hem build öncesi kontrol kullanır.
import { BANNED_TERMS, isAllowedExternal, soldServiceFor } from "@/lib/geo-blog/external-policy";
import type { ContentPage } from "./types";

const SUFFIX = " | Hadi Umre'ye Gidelim";
const words = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).filter(Boolean).length;
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export type Issue = { level: "hata" | "uyarı"; message: string };

export function validateContentPage(p: ContentPage, knownPaths: Set<string>): Issue[] {
  const out: Issue[] = [];
  const err = (m: string) => out.push({ level: "hata", message: m });
  const warn = (m: string) => out.push({ level: "uyarı", message: m });

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) err(`slug yalnızca küçük harf, rakam ve tire olmalı: ${p.slug}`);
  if ((p.title + SUFFIX).length > 60) err(`başlık + site adı 60 karakteri geçiyor (${(p.title + SUFFIX).length})`);
  if (p.description.length < 120 || p.description.length > 158) err(`açıklama 120–158 karakter olmalı (${p.description.length})`);
  const lw = words(p.lead);
  if (lw < 40 || lw > 60) err(`giriş paragrafı 40–60 kelime olmalı (${lw})`);
  if (p.sections.length < 4) err(`en az 4 bölüm olmalı (${p.sections.length})`);
  const questions = p.sections.filter((s) => s.h2.trim().endsWith("?")).length;
  if (questions < 2) err(`en az 2 ara başlık soru biçiminde olmalı (${questions})`);
  if (p.faq.length < 3 || p.faq.length > 6) err(`SSS 3–6 soru olmalı (${p.faq.length})`);
  if (!p.sources.length) err("en az 1 resmî kaynak gerekli");
  if (p.related.length < 3 || p.related.length > 6) err(`3–6 iç bağlantı olmalı (${p.related.length})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.reviewed)) err("reviewed YYYY-MM-DD olmalı");
  if (p.group === "sozluk" && !p.term) err("sözlük sayfasında term alanı zorunlu");

  const allText = [p.title, p.description, p.h1, p.lead, ...p.sections.flatMap((s) => [s.h2, ...s.paragraphs, ...(s.bullets ?? []), ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : [])]), ...p.faq.flatMap((f) => [f.q, f.a])].join(" ");
  const total = words(allText);
  if (total < 700) err(`toplam metin en az 700 kelime olmalı (${total})`);

  const lower = allText.toLocaleLowerCase("tr");
  for (const b of BANNED_TERMS) if (lower.includes(b.toLocaleLowerCase("tr"))) err(`yasaklı kelime: ${b}`);
  if (!/hadi\s*umre'?ye\s*gidelim/i.test(allText)) err("marka (Hadi Umreye Gidelim) metinde en az 1 kez doğal biçimde geçmeli");
  if (/en ucuz|garanti|%\s?\d+'?[ae] varan|misafirlerimiz|eşsiz|son derece|sonuç olarak/i.test(allText)) err("doğrulanmamış iddia ya da yasak kalıp (en ucuz, garanti, %… varan, misafirlerimiz, eşsiz, son derece, sonuç olarak)");

  // Linkler: iç link bilinen bir yol olmalı; dış link resmî kurum bilgi sayfası, sattığımız hizmet için değil
  const links = [...allText.matchAll(LINK_RE)].map((m) => ({ text: m[1], href: m[2] }));
  const hrefs = [...links.map((l) => l.href), ...p.related, ...p.sources.map((s) => s.href)];
  let hasPlanLink = p.related.includes("/bireysel-umre");
  for (const l of links) {
    if (l.href.startsWith("/")) {
      if (!knownPaths.has(l.href)) err(`bilinmeyen iç link: ${l.href}`);
      if (l.href === "/bireysel-umre") hasPlanLink = true;
    } else if (!isAllowedExternal(l.href)) err(`izinsiz dış link: ${l.href}`);
    else if (soldServiceFor(l.text)) err(`sattığımız hizmet dışarı linklenmiş: "${l.text}"`);
    else if (/diyanet|nusuk|bakanlı|sitesi|portal/i.test(l.text)) err(`dış link metni kurum adı olmamalı: "${l.text}"`);
  }
  for (const r of p.related) if (!knownPaths.has(r)) err(`bilinmeyen iç bağlantı (related): ${r}`);
  for (const s of p.sources) if (!isAllowedExternal(s.href)) err(`kaynak resmî kurum değil: ${s.href}`);
  if (!hasPlanLink) err("/bireysel-umre bağlantısı yok (metinde ya da related'da)");
  const counts = new Map<string, number>();
  for (const h of hrefs) counts.set(h, (counts.get(h) ?? 0) + 1);
  for (const [h, c] of counts) if (c > 3) warn(`aynı bağlantı ${c} kez geçiyor: ${h}`);
  return out;
}
