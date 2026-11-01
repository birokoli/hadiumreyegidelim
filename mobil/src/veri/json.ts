// Veritabanında metin olarak saklanan JSON alanları (paket galerisi, içerik listesi…). Eski kayıtlarda çift kodlanmış olabilir.
export function jsonDizi(v: unknown): string[] {
  let x: unknown = v;
  for (let i = 0; i < 2 && typeof x === "string"; i++) {
    try {
      x = JSON.parse(x);
    } catch {
      return String(v).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return Array.isArray(x) ? x.map(String) : [];
}
export function jsonNesne<T = Record<string, unknown>>(v: unknown): T | null {
  if (v && typeof v === "object") return v as T;
  try {
    const x = JSON.parse(String(v ?? ""));
    return x && typeof x === "object" ? (x as T) : null;
  } catch {
    return null;
  }
}
export const temizDizi = (l: unknown) => (Array.isArray(l) ? l.map((s) => String(s).trim()).filter(Boolean) : []);
