// Tip burada tanımlı (FaqBrowser'daki FaqItem ile aynı): mobil uygulama da bu dosyayı kullanır, site bileşenini içe aktaramaz
type FaqItem = { cat: string; q: string; a: string };

/** Sayfa Metinleri → SSS "Sorular" alanı: "Kategori | Soru" satırı, altında cevap, bloklar arası boş satır */
export function parseFaq(raw: string): FaqItem[] {
  return raw
    .split(/\n\s*\n/)
    .map((block) => {
      const [head, ...rest] = block.trim().split("\n");
      const [cat, q] = head.includes("|") ? head.split("|").map((x) => x.trim()) : ["Genel", head.trim()];
      return { cat: cat || "Genel", q: q || "", a: rest.join(" ").trim() };
    })
    .filter((i) => i.q && i.a);
}

/** Admin SSS düzenleyicisi: listeyi "Sorular" alanının metin biçimine çevirir (parseFaq'ın tersi) */
export function serializeFaq(items: FaqItem[]): string {
  return items
    .filter((i) => i.q.trim() && i.a.trim())
    .map((i) => `${(i.cat || "Genel").trim()} | ${i.q.trim()}\n${i.a.trim().replace(/\s*\n\s*/g, " ")}`)
    .join("\n\n");
}
