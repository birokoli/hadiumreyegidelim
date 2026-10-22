// Blog tabloları. Quill'in tablo modülü <th>/<thead> tanımıyor: başlık hücreleri olan bir yazı editörde açılıp kaydedilince
// başlık satırı tek hücreye eziliyordu ("Dönem2 kişilik oda3 kişilik oda"). Bu yüzden editöre başlıklar normal hücre (<td>)
// olarak verilir; sitede ilk satır başlık olarak gösterilir (22 Ekim).

/** Editöre yüklemeden önce: <thead> kaldırılır, <th> → <td>. Değişiklik yoksa aynı dize döner (editör imleci kaymasın). */
export function thToTd(html: string): string {
  if (!/<t(h|head)[\s>]/i.test(html)) return html;
  return html
    .replace(/<\/thead>\s*<tbody[^>]*>/gi, "") // başlık satırı gövdenin ilk satırı olur
    .replace(/<thead[^>]*>/gi, "<tbody>")
    .replace(/<\/thead>/gi, "</tbody>")
    .replace(/<th(\s[^>]*)?>/gi, (_, a = "") => `<td${a}>`)
    .replace(/<\/th>/gi, "</td>");
}

/** Sitede: başlık hücresi olmayan tablolarda ilk satır <th> yapılır. */
export function promoteHeaderRow(tableHtml: string): string {
  if (/<th[\s>]/i.test(tableHtml)) return tableHtml;
  return tableHtml.replace(/<tr(\s[^>]*)?>([\s\S]*?)<\/tr>/i, (_, a = "", inner: string) =>
    `<tr${a}>${inner.replace(/<td(\s[^>]*)?>/gi, (_m: string, x = "") => `<th scope="col"${x}>`).replace(/<\/td>/gi, "</th>")}</tr>`,
  );
}

const plain = (s: string) =>
  s.replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Sözlükte olmayan başlık: küçük harf/rakam/")"/"?" ile büyük harf ya da harf ile rakam arasından bölünür ("Dönem2 kişilik oda").
 * Yalnızca parça sayısı sütun sayısını tutarsa kullanılır. */
function autoSplit(text: string): string[] {
  return text.split(/(?<=[a-zçğıöşü)?.])(?=[A-ZÇĞİÖŞÜ0-9])|(?<=[a-zçğıöşü])(?=[0-9])/).map((p) => p.trim()).filter(Boolean);
}

/** Ezilmiş başlık satırını (tek hücre, metni sözlükte) sözlükteki hücrelere böler; hücre sayısı alt satırla aynı olmalı. */
export function splitMergedHeaders(html: string, map: Record<string, string[]>): { html: string; fixed: string[] } {
  const fixed: string[] = [];
  const out = html.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
    const rows = [...table.matchAll(/<tr(\s[^>]*)?>([\s\S]*?)<\/tr>/gi)];
    if (rows.length < 2) return table;
    const cells = (r: string) => [...r.matchAll(/<t[dh](\s[^>]*)?>([\s\S]*?)<\/t[dh]>/gi)];
    const first = cells(rows[0][2]);
    const cols = cells(rows[1][2]).length;
    if (first.length !== 1 || cols < 2) return table;
    const text = plain(first[0][2]);
    const parts = map[text] ?? autoSplit(text);
    if (!parts || parts.length !== cols) return table;
    const attrs = first[0][1] ?? "";
    const tr = `<tr${rows[0][1] ?? ""}>${parts.map((p) => `<td${attrs}>${esc(p)}</td>`).join("")}</tr>`;
    fixed.push(parts.join(" | "));
    return table.replace(rows[0][0], tr);
  });
  return { html: out, fixed };
}
