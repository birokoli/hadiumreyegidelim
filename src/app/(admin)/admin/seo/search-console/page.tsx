"use client";

import { useEffect, useState } from "react";
import { api, ErrorLine, formatNumber, PageHead, Section, Sparkline } from "@/components/admin/seo/ui";

type Row = { key: string; clicks: number; impressions: number; ctr: number; position: number; prevPosition?: number | null };
type Totals = { clicks: number; impressions: number; ctr: number; position: number };
type Data = {
  configured: boolean;
  serviceEmail?: string | null;
  error?: string;
  site?: string;
  range?: { startDate: string; endDate: string };
  totals?: Totals;
  prevTotals?: Totals;
  daily?: { date: string; clicks: number; impressions: number; position: number }[];
  queries?: Row[];
  pages?: Row[];
  devices?: Row[];
  countries?: Row[];
};

const pct = (n: number) => `%${(n * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
const pos = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
const DEVICE: Record<string, string> = { MOBILE: "Mobil", DESKTOP: "Masaüstü", TABLET: "Tablet" };
const path = (u: string) => { try { return decodeURIComponent(new URL(u).pathname); } catch { return u; } };

function Change({ now, prev, lowerIsBetter = false, format = (n: number) => formatNumber(n) }: { now: number; prev: number; lowerIsBetter?: boolean; format?: (n: number) => string }) {
  if (!prev) return null;
  const diff = now - prev;
  if (Math.abs(diff) < 1e-9) return <span className="text-[12px] text-[var(--seo-ink-3)]">değişmedi</span>;
  const good = lowerIsBetter ? diff < 0 : diff > 0;
  return <span className={`text-[12px] font-semibold ${good ? "text-[var(--seo-mark)]" : "text-[var(--seo-danger)]"}`}>{diff > 0 ? "+" : "−"}{format(Math.abs(diff))} önceki döneme göre</span>;
}

function Table({ rows, label, render = (k: string) => k, showPrev = false }: { rows: Row[]; label: string; render?: (k: string) => string; showPrev?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-wide text-[var(--seo-ink-3)]">
            <th className="py-2 pr-4 font-semibold">{label}</th>
            <th className="py-2 pr-4 text-right font-semibold">Tıklama</th>
            <th className="py-2 pr-4 text-right font-semibold">Gösterim</th>
            <th className="py-2 pr-4 text-right font-semibold">TO</th>
            <th className="py-2 text-right font-semibold">Sıra</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-[var(--seo-rule)]">
              <td className="max-w-[420px] truncate py-2 pr-4" title={r.key}>{render(r.key)}</td>
              <td className="py-2 pr-4 text-right tabular-nums font-semibold">{formatNumber(r.clicks)}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{formatNumber(r.impressions)}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{pct(r.ctr)}</td>
              <td className="py-2 text-right tabular-nums">
                {pos(r.position)}
                {showPrev && r.prevPosition != null && Math.abs(r.prevPosition - r.position) >= 0.5 && (
                  <span className={`ml-1.5 text-[11px] ${r.prevPosition > r.position ? "text-[var(--seo-mark)]" : "text-[var(--seo-danger)]"}`}>
                    {r.prevPosition > r.position ? "▲" : "▼"}{pos(Math.abs(r.prevPosition - r.position))}
                  </span>
                )}
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="py-4 text-[var(--seo-ink-3)]">Veri yok.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function SearchConsolePage() {
  const [days, setDays] = useState(28);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    api<Data>(`/api/admin/seo/gsc?days=${days}`)
      .then((d) => { if (alive) { setData(d); setError(""); } })
      .catch((e: Error & { configured?: boolean }) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [days]);

  const t = data?.totals;
  const p = data?.prevTotals;
  // Fırsat: 1. sayfanın altında ya da 2. sayfada, gösterimi olan ama az tıklanan aramalar
  const opportunities = (data?.queries ?? []).filter((q) => q.impressions >= 20 && q.position >= 4 && q.position <= 20).sort((a, b) => b.impressions - a.impressions).slice(0, 15);

  return (
    <>
      <PageHead
        n="07"
        title="Search Console"
        lede="Google'ın kendi verisi: hangi aramalarda göründüğünüz, kaç tıklama aldığınız ve ortalama sıranız. Veri 2–3 gün geriden gelir; önceki eşit dönemle karşılaştırılır."
      >
        {[7, 28, 90].map((d) => (
          <button key={d} className={`seo-btn ${days === d ? "" : "opacity-60"}`} onClick={() => { setData(null); setDays(d); }} aria-pressed={days === d}>
            Son {d} gün
          </button>
        ))}
      </PageHead>

      <ErrorLine>{error || data?.error}</ErrorLine>

      {data && !data.configured && (
        <div className="max-w-[680px] rounded-[4px] bg-[var(--seo-paper-2)] p-6 text-[14px] leading-relaxed">
          <p className="text-[16px] font-bold">Search Console bağlı değil</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[var(--seo-ink-2)]">
            <li>Google Cloud'da Search Console API'yi etkinleştirin ve bir servis hesabı oluşturun.</li>
            <li>Servis hesabına JSON anahtarı oluşturup indirin (kimseyle paylaşmayın).</li>
            <li>Search Console → Ayarlar → Kullanıcılar ve izinler: servis hesabının e-postasını <b>Kısıtlı</b> kullanıcı olarak ekleyin.</li>
            <li>Vercel → Environment Variables: <code className="seo-mono">GSC_SERVICE_ACCOUNT_JSON</code> = JSON dosyasının tüm içeriği. Mülk adres mülküyse ayrıca <code className="seo-mono">GSC_SITE_URL</code>.</li>
            <li>Yeniden dağıtımdan sonra bu sayfa veriyi gösterir.</li>
          </ol>
        </div>
      )}

      {data?.configured && data.error && data.serviceEmail && (
        <p className="mt-2 text-[13px] text-[var(--seo-ink-2)]">Servis hesabı: <span className="seo-mono">{data.serviceEmail}</span>. Bu adresin Search Console'da mülke kullanıcı olarak ekli olduğundan emin olun.</p>
      )}

      {!data && !error && <p className="text-[14px] text-[var(--seo-ink-3)]">Search Console verisi alınıyor…</p>}

      {t && p && (
        <>
          <p className="text-[13px] text-[var(--seo-ink-3)]">{data?.site} · {data?.range?.startDate} – {data?.range?.endDate}</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-[13px] text-[var(--seo-ink-3)]">Tıklama</p><p className="text-[36px] font-extrabold tabular-nums">{formatNumber(t.clicks)}</p><Change now={t.clicks} prev={p.clicks} /></div>
            <div><p className="text-[13px] text-[var(--seo-ink-3)]">Gösterim</p><p className="text-[36px] font-extrabold tabular-nums">{formatNumber(t.impressions)}</p><Change now={t.impressions} prev={p.impressions} /></div>
            <div><p className="text-[13px] text-[var(--seo-ink-3)]">Tıklama oranı</p><p className="text-[36px] font-extrabold tabular-nums">{pct(t.ctr)}</p><Change now={t.ctr} prev={p.ctr} format={pct} /></div>
            <div><p className="text-[13px] text-[var(--seo-ink-3)]">Ortalama sıra</p><p className="text-[36px] font-extrabold tabular-nums">{pos(t.position)}</p><Change now={t.position} prev={p.position} lowerIsBetter format={pos} /></div>
          </div>

          <Section title="Günlük">
            <div className="grid gap-6 lg:grid-cols-2">
              <div><p className="mb-2 text-[13px] text-[var(--seo-ink-3)]">Tıklama</p><Sparkline values={(data?.daily ?? []).map((d) => d.clicks)} width={560} height={80} /></div>
              <div><p className="mb-2 text-[13px] text-[var(--seo-ink-3)]">Gösterim</p><Sparkline values={(data?.daily ?? []).map((d) => d.impressions)} width={560} height={80} /></div>
            </div>
          </Section>

          <Section title="Fırsatlar" aside="4–20. sıradaki, gösterimi olan aramalar: başlık ve açıklamayla tıklama artırılabilir">
            <Table rows={opportunities} label="Arama" showPrev />
          </Section>

          <Section title="Aramalar" aside={<button className="seo-link" onClick={() => setShowAll((v) => !v)}>{showAll ? "İlk 25" : "Tümü"}</button>}>
            <Table rows={(data?.queries ?? []).slice(0, showAll ? 200 : 25)} label="Arama" showPrev />
          </Section>

          <Section title="Sayfalar">
            <Table rows={(data?.pages ?? []).slice(0, showAll ? 200 : 25)} label="Sayfa" render={path} />
          </Section>

          <div className="grid gap-10 lg:grid-cols-2">
            <Section title="Cihaz"><Table rows={data?.devices ?? []} label="Cihaz" render={(k) => DEVICE[k] ?? k} /></Section>
            <Section title="Ülke"><Table rows={data?.countries ?? []} label="Ülke" render={(k) => k.toUpperCase()} /></Section>
          </div>
        </>
      )}
    </>
  );
}
