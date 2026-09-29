// Hata raporu: Claude / Antigravity gibi bir kod asistanına yapıştırılmak üzere
// tek Markdown belgesi. Önce otomatik tespit edilen sorunlar, sonra ilgili
// dosyalar, en sonda ham veri (JSON). Sır değeri içermez.

import type { DiagEntry } from "./log";

type Probe = { ok: boolean; ms: number; detail?: unknown; error?: string };

export type ServerDiag = {
  app: { commit: string; env: string; region: string | null; serverTime: string };
  envVars: Record<string, boolean>;
  probes: { database: Probe; dataforseo: Probe; anthropic: Probe };
  seo: {
    audit: unknown;
    trackedKeywords: unknown;
    competitors: { backlinkError?: string | null } | unknown;
  };
  ai:
    | {
        availableEngines: string[];
        selectedEngines: string[];
        failedRuns: { engine: string; prompt: string; at: string; error?: string; note?: string }[];
        notes: string[];
        [k: string]: unknown;
      }
    | unknown;
};

const FILES = {
  seo: [
    "src/app/(admin)/admin/seo/*  (sayfalar: Durum, Denetim, Kelimeler, Sıralar, Rakipler, Programatik)",
    "src/app/api/admin/seo/*/route.ts  (audit, keywords, ranks, competitors, programmatic, status)",
    "src/lib/seo/dataforseo.ts  (DataForSEO istemcisi, yeniden deneme, hata açıklamaları)",
    "src/lib/seo/audit.ts  (site denetimi kuralları ve puan)",
    "src/lib/seo/programmatic.ts, src/lib/seo/store.ts, src/lib/seo/guard.ts",
    "src/components/admin/seo/ui.tsx  (api() yardımcısı, ortak arayüz)",
  ],
  ai: [
    "src/app/(admin)/admin/ai-visibility/*  (sayfalar: Durum, Sorular, Yanıtlar, Kaynaklar, Rakipler, Hazırlık)",
    "src/app/api/admin/ai-vis/*/route.ts  (data, config, run, save, readiness)",
    "src/lib/ai-vis/engines.ts  (ChatGPT/Gemini/Perplexity/Google: DataForSEO; Claude: Anthropic SDK)",
    "src/lib/ai-vis/analyze.ts, metrics.ts  (anılma, sıra, kaynak sınıflama, oranlar)",
    "src/lib/ai-vis/store.ts  (Setting tablosunda AI_VIS_* anahtarları)",
    "src/components/admin/ai-vis/AiVisProvider.tsx  (istemci tarafı çalıştırma sırası)",
  ],
};

function problems(server: ServerDiag | null, serverError: string | null, log: DiagEntry[], alerts: string[]) {
  const out: string[] = [];
  if (serverError) out.push(`[tanı uç noktası] /api/admin/diagnostics okunamadı: ${serverError}`);
  if (server) {
    const { probes, envVars } = server;
    if (!probes.database.ok) out.push(`[veritabanı] okunamıyor: ${probes.database.error}`);
    if (!envVars.DATAFORSEO_API_KEY && !(envVars.DATAFORSEO_LOGIN && envVars.DATAFORSEO_PASSWORD)) {
      out.push("[DataForSEO] ortam değişkenleri eksik (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD)");
    } else if (!probes.dataforseo.ok) {
      out.push(`[DataForSEO] hesap sorgusu başarısız: ${probes.dataforseo.error}`);
    } else {
      const d = probes.dataforseo.detail as { balance?: number | null } | undefined;
      if (d?.balance != null && d.balance < 0.2) out.push(`[DataForSEO] bakiye düşük: $${d.balance}`);
    }
    if (!probes.anthropic.ok) out.push(`[Anthropic/Claude] ${probes.anthropic.error}`);
    const comp = server.seo.competitors as { backlinkError?: string | null } | null;
    if (comp?.backlinkError) out.push(`[SEO/Rakipler] backlink verisi: ${comp.backlinkError}`);
    const ai = server.ai as { failedRuns?: { engine: string; error?: string }[] } | null;
    // Aynı hata her yanıtta farklı request_id taşır; gruplamadan önce ayıkla
    const normalize = (err = "") =>
      /credit balance is too low/i.test(err)
        ? "Anthropic kredisi bitti (console.anthropic.com → Plans & Billing)"
        : err.replace(/,?\s*"request_id"\s*:\s*"[^"]*"/g, "").replace(/\breq_[A-Za-z0-9]+/g, "").trim();
    const grouped = new Map<string, { engine: string; error: string; n: number }>();
    for (const r of ai?.failedRuns ?? []) {
      const error = normalize(r.error);
      const key = `${r.engine}\u0000${error}`;
      const row = grouped.get(key) ?? { engine: r.engine, error, n: 0 };
      row.n++;
      grouped.set(key, row);
    }
    for (const g of grouped.values()) out.push(`[AI/${g.engine}] ${g.n} yanıtta hata: ${g.error}`);
  }
  const apiErrors = new Map<string, number>();
  for (const e of log.filter((x) => x.error)) {
    const key = e.kind === "api" ? `${e.method} ${e.url} → ${e.status ?? "ağ"}: ${e.error}` : `JS hatası: ${e.error}`;
    apiErrors.set(key, (apiErrors.get(key) ?? 0) + 1);
  }
  for (const [k, n] of apiErrors) out.push(`[tarayıcı] ${k}${n > 1 ? ` (${n} kez)` : ""}`);
  for (const a of alerts) if (!out.some((o) => o.includes(a))) out.push(`[ekranda] ${a}`);
  return out;
}

export function buildReport(input: {
  note: string;
  server: ServerDiag | null;
  serverError: string | null;
  log: DiagEntry[];
  alerts: string[];
  page: string;
}) {
  const { note, server, serverError, log, alerts, page } = input;
  const scope = page.startsWith("/admin/ai-visibility") ? "ai" : "seo";
  const found = problems(server, serverError, log, alerts);
  const json = (v: unknown) => "```json\n" + JSON.stringify(v, null, 2) + "\n```";

  return [
    `# Hata raporu: ${scope === "ai" ? "AI Görünürlük" : "SEO Masası"} (admin.hadiumreyegidelim.com)`,
    "",
    "> Bu rapor admin panelindeki \"Hata raporu\" düğmesiyle otomatik üretildi. Sır değeri içermez (ortam değişkenleri yalnızca tanımlı/tanımsız).",
    "> Kod asistanı için: önce **Tespit edilen sorunlar**, sonra **İlgili dosyalar**. Repo: github.com/birokoli/hadiumreyegidelim · Next.js 16.2 (AGENTS.md: bu sürümde kırıcı değişiklikler var, node_modules/next/dist/docs okunmalı) · Prisma + Supabase · veriler `Setting` tablosunda `SEO_*` ve `AI_VIS_*` anahtarlarında JSON.",
    "",
    `- **Sayfa:** ${page}`,
    `- **Zaman:** ${new Date().toISOString()}`,
    `- **Sürüm:** ${server ? `commit ${server.app.commit} (${server.app.env}${server.app.region ? `, ${server.app.region}` : ""})` : "bilinmiyor"}`,
    `- **Tarayıcı:** ${typeof navigator !== "undefined" ? navigator.userAgent : ""} · ${typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : ""}`,
    "",
    "## Kullanıcının notu",
    note.trim() || "_(not yazılmadı)_",
    "",
    "## Tespit edilen sorunlar",
    found.length ? found.map((f) => `- ${f}`).join("\n") : "- Otomatik tespit edilen sorun yok. Kullanıcının notuna ve aşağıdaki kayıtlara bakın.",
    "",
    "## İlgili dosyalar",
    FILES[scope].map((f) => `- ${f}`).join("\n"),
    "",
    "## Bağlantı testleri ve ortam",
    json(server ? { app: server.app, envVars: server.envVars, probes: server.probes } : { error: serverError }),
    "",
    "## SEO durumu",
    json(server?.seo ?? null),
    "",
    "## AI Görünürlük durumu",
    json(server?.ai ?? null),
    "",
    `## Tarayıcı istek kaydı (son ${log.length})`,
    log.length ? json(log) : "_(bu oturumda kayıtlı istek yok; sayfa yenilendiyse kayıt sıfırlanır)_",
    "",
  ].join("\n");
}
