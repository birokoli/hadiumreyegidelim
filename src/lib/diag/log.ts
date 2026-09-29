// Tarayıcı tarafı tanı kaydı: SEO Masası ve AI Görünürlük sayfalarında yapılan
// her API isteğini ve yakalanmamış hataları hafızada tutar (sayfa yenilenince silinir).
// "Hata raporu" düğmesi bu kaydı rapora ekler. İstek gövdeleri kısaltılır,
// sır olabilecek alanlar maskelenir.

export type DiagEntry = {
  at: string;
  kind: "api" | "error";
  method?: string;
  url?: string;
  status?: number;
  ms?: number;
  request?: string;
  error?: string;
  page: string;
};

const MAX = 60;
const entries: DiagEntry[] = [];
let installed = false;

const SECRET = /(pass(word)?|secret|token|api[_-]?key|authorization)"?\s*[:=]\s*"?[^",}\s]+/gi;

export function redact(s: string) {
  return s.replace(SECRET, (m) => m.split(/[:=]/)[0] + ': "***"');
}

function page() {
  return typeof window === "undefined" ? "" : window.location.pathname + window.location.search;
}

export function recordDiag(e: Omit<DiagEntry, "at" | "page">) {
  entries.push({
    ...e,
    request: e.request ? redact(e.request).slice(0, 400) : undefined,
    error: e.error ? redact(e.error).slice(0, 800) : undefined,
    at: new Date().toISOString(),
    page: page(),
  });
  if (entries.length > MAX) entries.splice(0, entries.length - MAX);
}

export function getDiagLog() {
  return [...entries];
}

/** window hata olaylarını yakalar; bir kez kurulur */
export function installDiagHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (ev) => {
    recordDiag({ kind: "error", error: `${ev.message} @ ${ev.filename}:${ev.lineno}` });
  });
  window.addEventListener("unhandledrejection", (ev) => {
    const r = ev.reason;
    recordDiag({ kind: "error", error: `unhandledrejection: ${r instanceof Error ? `${r.message}\n${r.stack ?? ""}` : String(r)}` });
  });
}
