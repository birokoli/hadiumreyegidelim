"use client";

// Aylık satış fiyatları (USD). Sitede planlayıcı, otel ve fiyat sayfaları bu tablodan beslenir.
import { useEffect, useMemo, useState } from "react";

type Service = { id: string; name: string; category: string; defaultPricingType: string; isPublic?: boolean; city?: string | null };
type Price = { serviceId: string; month: string; variant: string; salePriceUsd: number };

const CATEGORIES: Record<string, string> = { hotel: "Konaklama", transfer: "Transfer ve ulaşım", flight: "Uçuş (tahmini)", vize: "Vize", tur: "Gezi ve ziyaretler", extra: "Ekstra" };
const ORDER = ["hotel", "transfer", "flight", "vize", "tur", "extra"];
const UNIT: Record<string, string> = { per_person: "kişi başı", per_vehicle: "araç başı", per_room: "oda / gece", flat: "sabit" };
const ROOM_VARIANTS = [{ v: "2", label: "2 kişilik oda" }, { v: "3", label: "3 kişilik oda" }, { v: "4", label: "4 kişilik oda" }];
const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const label = (ym: string) => `${MONTHS_TR[Number(ym.slice(5)) - 1]} ${ym.slice(2, 4)}`;
const key = (s: string, m: string, v: string) => `${s}|${m}|${v}`;

export default function MonthlyPricesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [onlyPublic, setOnlyPublic] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [copy, setCopy] = useState({ from: "", to: "", percent: 5, category: "", overwrite: false });

  const load = async () => {
    const [s, p] = await Promise.all([fetch("/api/admin/service-library").then((r) => r.json()), fetch("/api/admin/service-prices?n=12").then((r) => r.json())]);
    if (s.error || p.error) return setMsg(s.error || p.error);
    setServices(s.services ?? []);
    setMonths(p.months ?? []);
    const v: Record<string, string> = {};
    for (const x of (p.prices ?? []) as Price[]) v[key(x.serviceId, x.month, x.variant)] = String(x.salePriceUsd);
    setValues(v);
    setDirty(new Set());
    setCopy((c) => ({ ...c, from: c.from || p.months?.[0] || "", to: c.to || p.months?.[1] || "" }));
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    const list = services.filter((s) => !onlyPublic || s.isPublic);
    return ORDER.flatMap((cat) => {
      const items = list.filter((s) => s.category === cat);
      if (!items.length) return [];
      return [{ head: CATEGORIES[cat] ?? cat }, ...items.flatMap((s) =>
        s.defaultPricingType === "per_room" ? ROOM_VARIANTS.map((r, i) => ({ s, variant: r.v, sub: r.label, first: i === 0 })) : [{ s, variant: "", sub: UNIT[s.defaultPricingType] ?? "", first: true }],
      )];
    });
  }, [services, onlyPublic]);

  const set = (k: string, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    setDirty((prev) => new Set(prev).add(k));
  };

  const save = async () => {
    setBusy(true); setMsg("");
    const cells = [...dirty].map((k) => {
      const [serviceId, month, variant] = k.split("|");
      const raw = values[k]?.replace(",", ".").trim();
      return { serviceId, month, variant, salePriceUsd: raw ? Number(raw) : null };
    });
    const r = await fetch("/api/admin/service-prices", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cells }) }).then((x) => x.json());
    setBusy(false);
    if (r.error) return setMsg(r.error);
    setMsg(`${r.saved} fiyat kaydedildi, ${r.removed} boş hücre silindi. Site birkaç saniye içinde güncellenir.`);
    load();
  };

  const runCopy = async () => {
    if (dirty.size && !confirm("Kaydedilmemiş değişiklikler var; önce kaydedin. Yine de kopyalansın mı?")) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/service-prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "copy", ...copy, category: copy.category || undefined }) }).then((x) => x.json());
    setBusy(false);
    if (r.error) return setMsg(r.error);
    setMsg(`${label(copy.from)} → ${label(copy.to)}: ${r.copied} fiyat kopyalandı (%${copy.percent})${r.skipped ? `, ${r.skipped} dolu hücre korundu` : ""}.`);
    load();
  };

  const cell = "w-20 rounded-md border border-outline-variant/30 bg-white px-2 py-1 text-right font-mono text-xs focus:border-primary/50 focus:outline-none";
  const sel = "rounded-lg border border-outline-variant/30 bg-white px-2 py-1.5 text-xs";

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 min-h-screen bg-surface text-on-surface">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-outline-variant/15">
        <div>
          <a href="/admin/fiyat-teklifleri/hizmetler" className="text-[11px] font-semibold text-on-surface-variant hover:text-primary">← Hizmet Kütüphanesi</a>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Aylık satış fiyatları (USD)</h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">Sitedeki planlayıcı, otel ve fiyat sayfaları bu fiyatlarla çalışır. Boş hücre = o ay satışta değil. Maliyet burada değil, Hizmet Kütüphanesi'nde; sitede asla gösterilmez.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={onlyPublic} onChange={(e) => setOnlyPublic(e.target.checked)} className="accent-[#003781]" /> Yalnızca sitede görünenler</label>
          <button onClick={save} disabled={busy || !dirty.size} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? "Kaydediliyor…" : `Kaydet${dirty.size ? ` (${dirty.size})` : ""}`}</button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-outline-variant/20 bg-white p-4 text-xs">
        <span className="font-bold text-primary">Ayı kopyala</span>
        <label>Kaynak <select value={copy.from} onChange={(e) => setCopy({ ...copy, from: e.target.value })} className={sel}>{months.map((m) => <option key={m} value={m}>{label(m)}</option>)}</select></label>
        <label>Hedef <select value={copy.to} onChange={(e) => setCopy({ ...copy, to: e.target.value })} className={sel}>{months.map((m) => <option key={m} value={m}>{label(m)}</option>)}</select></label>
        <label>Artış % <input type="number" value={copy.percent} onChange={(e) => setCopy({ ...copy, percent: Number(e.target.value) })} className={`${sel} w-16`} /></label>
        <label>Kategori <select value={copy.category} onChange={(e) => setCopy({ ...copy, category: e.target.value })} className={sel}><option value="">Hepsi</option>{ORDER.map((c) => <option key={c} value={c}>{CATEGORIES[c]}</option>)}</select></label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={copy.overwrite} onChange={(e) => setCopy({ ...copy, overwrite: e.target.checked })} className="accent-[#003781]" /> Hedefte dolu hücrelerin üzerine yaz</label>
        <button onClick={runCopy} disabled={busy || copy.from === copy.to} className="rounded-lg border border-primary/30 px-3 py-1.5 font-bold text-primary disabled:opacity-50">Kopyala</button>
      </div>

      {msg && <p className="text-xs font-semibold text-secondary" role="status">{msg}</p>}

      {!rows.length ? (
        <p className="rounded-2xl border border-dashed border-outline-variant/40 py-12 text-center text-xs text-on-surface-variant">
          {onlyPublic ? "Sitede görünen hizmet yok. Hizmet Kütüphanesi'nde bir hizmeti düzenleyip \"Sitede göster\"i işaretleyin." : "Henüz hizmet yok."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-white">
          <table className="text-xs">
            <thead className="bg-surface-container-low text-[10px] uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="sticky left-0 z-10 bg-surface-container-low px-3 py-2 text-left">Hizmet</th>
                {months.map((m) => <th key={m} className="px-2 py-2 text-right whitespace-nowrap">{label(m)}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((r, i) =>
                "head" in r ? (
                  <tr key={`h${i}`}><td colSpan={months.length + 1} className="sticky left-0 bg-primary/[0.04] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-primary">{r.head}</td></tr>
                ) : (
                  <tr key={`${r.s.id}${r.variant}`}>
                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5 min-w-[220px]">
                      {r.first && <span className="block font-semibold text-on-surface">{r.s.name}</span>}
                      <span className="block text-[10px] text-on-surface-variant">{r.sub}</span>
                    </td>
                    {months.map((m) => {
                      const k = key(r.s.id, m, r.variant);
                      return (
                        <td key={m} className="px-1.5 py-1">
                          <input inputMode="decimal" aria-label={`${r.s.name} ${r.sub} ${label(m)}`} value={values[k] ?? ""} onChange={(e) => set(k, e.target.value)} className={`${cell} ${dirty.has(k) ? "border-amber-400 bg-amber-50" : ""}`} />
                        </td>
                      );
                    })}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
