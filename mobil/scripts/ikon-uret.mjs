// Uygulama ikonları: sitenin marka ikon seti (public/ikon/*.svg, dolgulu, 1024'lük) ve marketing panelinin
// Apple çizgisindeki arayüz ikonları (src/components/influencer/Ikon.tsx, 24'lük, çizgi). Tek kaynak sitede kalır;
// değişince: node mobil/scripts/ikon-uret.mjs
import fs from "fs";
import path from "path";
const kok = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const marka = {};
for (const f of fs.readdirSync(path.join(kok, "public/ikon")).filter((f) => f.endsWith(".svg"))) {
  const s = fs.readFileSync(path.join(kok, "public/ikon", f), "utf8");
  marka[f.replace(".svg", "")] = [...s.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, " ").trim());
}
const ikon = fs.readFileSync(path.join(kok, "src/components/influencer/Ikon.tsx"), "utf8");
const blok = ikon.slice(ikon.indexOf("const CIZIM"), ikon.indexOf("};", ikon.indexOf("const CIZIM")));
const cizgi = {};
for (const m of blok.matchAll(/^\s*["']?([\w-]+)["']?: S\((\[[\s\S]*?\]|"[^"]*")\),?$/gm)) cizgi[m[1]] = JSON.parse(m[2].startsWith("[") ? m[2] : `[${m[2]}]`);
const cikti = `// OTOMATİK ÜRETİLDİ: node mobil/scripts/ikon-uret.mjs (elle düzenlemeyin)\nexport const MARKA: Record<string, string[]> = ${JSON.stringify(marka)};\nexport const CIZGI: Record<string, string[]> = ${JSON.stringify(cizgi)};\n`;
fs.writeFileSync(path.join(kok, "mobil/src/ikonlar/veri.ts"), cikti);
console.log("marka", Object.keys(marka).length, "çizgi", Object.keys(cizgi).length);
