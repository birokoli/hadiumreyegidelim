// Rehber sayfalarını kurallara göre denetler: npx tsx scripts/check-content-pages.mts
import { CONTENT_PAGES, contentPath } from "../src/content/pages/index";
import { validateContentPage } from "../src/content/pages/validate";
import { turkeyCities } from "../src/lib/turkey-cities";

const known = new Set<string>([
  "/", "/bireysel-umre", "/paketler", "/umre-vizesi", "/ilk-umrem", "/hanim-umresi", "/eylul-umresi", "/rehberlik",
  "/hizmetler", "/blog", "/iletisim", "/hakkimizda", "/umre-rehberi",
  ...turkeyCities.map((c) => `/${c.slug}-cikisli-bireysel-umre`),
  ...CONTENT_PAGES.map(contentPath),
]);
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
