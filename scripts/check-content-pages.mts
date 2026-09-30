// Rehber sayfalarını kurallara göre denetler: npx tsx scripts/check-content-pages.mts
import { CONTENT_PAGES, contentPath } from "../src/content/pages/index";
import { validateContentPage } from "../src/content/pages/validate";
import { knownContentPaths } from "../src/content/pages/known-paths";

const known = knownContentPaths();
const slugs = new Set<string>();
let errors = 0;
for (const p of CONTENT_PAGES) {
  if (slugs.has(p.slug)) { console.log(`✗ ${p.slug}: slug tekrar ediyor`); errors++; }
  slugs.add(p.slug);
  const issues = validateContentPage(p, known);
  const e = issues.filter((i) => i.level === "hata");
  errors += e.length;
  console.log(`${e.length ? "✗" : "✓"} ${contentPath(p)}${issues.length ? "" : "  (sorun yok)"}`);
  for (const i of issues) console.log(`    ${i.level === "hata" ? "HATA" : "uyarı"}: ${i.message}`);
}
console.log(`\n${CONTENT_PAGES.length} sayfa, ${errors} hata`);
process.exit(errors ? 1 : 0);
