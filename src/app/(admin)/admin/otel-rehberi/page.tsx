"use client";
// Otel rehberi (7 Ekim): Paximum'dan satılan Mekke otelleri için Google otel verisi → yalnızca bu veriden yazılmış metin →
// kullanıcı onayı → fiyatsız otel sayfası (/oteller/<slug>). Onaylanmayan otel sitede görünmez.
import HubTabs from "@/components/admin/HubTabs";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  slug: string;
  name: string;
  district: string;
  districtLabel: string;
  kaabaMeters: number | null;
  stars: number | null;
  google: { title: string; matchScore: number; about: boolean; amenities: number; neighborhood?: string | null } | null;
  content: { description: string; faq: { q: string; a: string }[]; note: string | null; approved: boolean } | null;
  published: boolean;
};

const TARGET = new Set(["ajyad", "cebel-omer", "cerval", "mescid-i-cin", "mahbes", "nuzha", "misfele"]);
const DISTRICT_OPTIONS: [string, string][] = [
  ["ajyad", "Ajyad"],
  ["cebel-omer", "Cebel Ömer"],
  ["cerval", "Cerval"],
  ["mescid-i-cin", "Mescid-i Cin"],
  ["mahbes", "Mahbes"],
  ["nuzha", "Nüzha"],
  ["misfele", "Misfele"],
  ["aziziye", "Aziziye (hedef dışı)"],
  ["utaybiye", "Utaybiye (hedef dışı)"],
  ["diger", "Diğer (hedef dışı)"],
];
const API = "/api/admin/hotel-guide";
const km = (m: number | null) => (m == null ? "—" : m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);

export default function OtelRehberiPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [failed, setFailed] = useState<{ slug: string; name: string; reason: string }[]>([]);
  const [retryKw, setRetryKw] = useState<Record<string, string>>({});
  const [fetched, setFetched] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"hedef" | "hepsi">("hedef");

  const load = useCallback(async () => {
    const d = await fetch(API).then((r) => r.json()).catch(() => null);
    if (d?.ok) {
      setRows(d.hotels);
      setFailed(d.failed);
      setFetched(d.fetched);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: object, key: string, okText: (d: Record<string, unknown>) => string) => {
    setBusy(key);
    setMsg(null);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 504) throw new Error("Sunucu süresi doldu; çekilen oteller kaydedildi. Sayfayı yenileyip devam edin.");
      if (!r.ok || d.ok === false) throw new Error(d.error || "İşlem başarısız.");
      setMsg({ ok: true, text: okText(d) });
      await load();
      return d;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const list = useMemo(() => rows.filter((r) => filter === "hepsi" || TARGET.has(r.district)).sort((a, b) => (a.kaabaMeters ?? 1e9) - (b.kaabaMeters ?? 1e9)), [rows, filter]);
  const stats = useMemo(() => {
    const t = rows.filter((r) => TARGET.has(r.district));
    return { target: t.length, written: t.filter((r) => r.content).length, published: t.filter((r) => r.published).length };
  }, [rows]);

  return (
    <div className="space-y-6">
      <HubTabs hub="urun" />
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Otel Rehberi</h1>
        <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
          Paximum&apos;dan sattığımız Mekke otelleri. Bilgiler Google&apos;ın otel kaydından çekilir, metin yalnızca bu veriden yazılır. Siz onaylamadan sayfa sitede görünmez; fiyat hiçbir yerde yazmaz.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Google verisi çekilen", `${fetched} / 91`],
          ["Hedef bölgelerde", String(stats.target)],
          ["Metni yazılan", String(stats.written)],
          ["Yayında", String(stats.published)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <p className="text-xs text-on-surface-variant">{k}</p>
            <p className="mt-1 text-xl font-bold text-on-surface">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => post({ action: "fetch" }, "fetch", (d) => {
            const res = d.results as { slug: string; ok: boolean; reason?: string }[];
            const okN = res.filter((x) => x.ok).length;
            const errs = [...new Set(res.filter((x) => !x.ok).map((x) => x.reason))].slice(0, 2).join(" | ");
            return `${res.length} otel denendi, ${okN} tanesi çekildi, maliyet ${d.cost} $. Kalan: ${d.remaining}.${errs ? ` Hata: ${errs}` : ""}`;
          })}
          disabled={!!busy || fetched >= 91}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy === "fetch" ? "Google verisi çekiliyor…" : "Google verisini çek (8 otel)"}
        </button>
        <button
          onClick={() => post({ action: "about" }, "about", (d) => `${d.checked} otel kontrol edildi, ${d.filled} tanesine İngilizce tanıtım eklendi, maliyet ${d.cost} $.`)}
          disabled={!!busy}
          className="rounded-xl border border-outline-variant/40 px-4 py-2.5 text-sm font-bold text-primary disabled:opacity-50"
        >
          {busy === "about" ? "Tanıtımlar tamamlanıyor…" : "Eksik tanıtımları tamamla (8 otel)"}
        </button>
        <select value={filter} onChange={(e) => setFilter(e.target.value as "hedef" | "hepsi")} className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm">
          <option value="hedef">Hedef bölgeler</option>
          <option value="hepsi">Bütün oteller</option>
        </select>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low text-left text-xs text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Otel</th>
              <th className="px-4 py-3">Bölge</th>
              <th className="px-4 py-3">Kâbe&apos;ye</th>
              <th className="px-4 py-3">Google kaydı</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <Fragment key={r.slug}>
                <tr className="border-t border-outline-variant/10">
                  <td className="px-4 py-3 font-semibold text-on-surface">
                    {r.name}
                    {r.stars ? <span className="ml-1 text-xs font-normal text-on-surface-variant">· {r.stars}★</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.district}
                      onChange={(e) => post({ action: "district", slug: r.slug, district: e.target.value }, `d-${r.slug}`, () => `${r.name}: bölge güncellendi.`)}
                      disabled={!!busy}
                      className={`rounded-lg border px-2 py-1 text-xs ${TARGET.has(r.district) ? "border-outline-variant/30 bg-white" : "border-amber-300 bg-amber-50"}`}
                    >
                      {DISTRICT_OPTIONS.map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    {r.google?.neighborhood && <p className="mt-1 text-[11px] text-on-surface-variant">Google: {r.google.neighborhood}</p>}
                  </td>
                  <td className="px-4 py-3">{km(r.kaabaMeters)}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.google ? (
                      <>
                        {r.google.title}
                        <span className={`ml-1 ${r.google.matchScore < 0.75 ? "text-amber-700" : "text-on-surface-variant"}`}>(eşleşme {Math.round(r.google.matchScore * 100)}%)</span>
                        {!r.google.about && <span className="ml-1 text-amber-700">· tanıtım yok</span>}
                      </>
                    ) : (
                      <span className="text-on-surface-variant">henüz çekilmedi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.published ? <span className="rounded-full bg-green-100 px-2 py-1 font-bold text-green-800">Yayında</span> : r.content ? <span className="rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-800">Onay bekliyor</span> : <span className="text-on-surface-variant">Metin yok</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {r.google && !r.content && (
                      <button onClick={() => post({ action: "write", slug: r.slug }, r.slug, () => "Metin yazıldı; okuyup onaylayın.").then(() => { setOpen(r.slug); })} disabled={!!busy} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                        {busy === r.slug ? "Yazılıyor…" : "Metin yaz"}
                      </button>
                    )}
                    {r.content && (
                      <button onClick={() => { setOpen(open === r.slug ? null : r.slug); setDraft(r.content!.description); }} className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold text-primary">
                        {open === r.slug ? "Kapat" : "Oku"}
                      </button>
                    )}
                  </td>
                </tr>
                {open === r.slug && r.content && (
                  <tr className="bg-surface-container-low/50">
                    <td colSpan={6} className="space-y-3 px-4 py-4">
                      {r.content.note && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Not: {r.content.note}</p>}
                      <textarea value={draft || r.content.description} onChange={(e) => setDraft(e.target.value)} rows={7} className="w-full rounded-xl border border-outline-variant/30 bg-white p-3 text-sm leading-relaxed" />
                      {r.content.faq.length > 0 && (
                        <div className="space-y-2">
                          {r.content.faq.map((f) => (
                            <div key={f.q} className="rounded-xl bg-white p-3 text-sm">
                              <p className="font-semibold">{f.q}</p>
                              <p className="text-on-surface-variant">{f.a}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => post({ action: "approve", slug: r.slug, approved: true, description: draft }, `ap-${r.slug}`, () => "Onaylandı; sayfa yayında.")} disabled={!!busy || !TARGET.has(r.district)} className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                          {TARGET.has(r.district) ? "Onayla ve yayınla" : "Hedef bölge dışında"}
                        </button>
                        {r.content.approved && (
                          <button onClick={() => post({ action: "approve", slug: r.slug, approved: false }, `un-${r.slug}`, () => "Yayından kaldırıldı.")} disabled={!!busy} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700">
                            Yayından kaldır
                          </button>
                        )}
                        <button onClick={() => post({ action: "write", slug: r.slug }, r.slug, () => "Metin yeniden yazıldı.")} disabled={!!busy} className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold text-primary">
                          Yeniden yaz
                        </button>
                        <a href={`/oteller/${r.slug}`} target="_blank" className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold text-primary">
                          Sayfayı aç
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-sm text-on-surface-variant">Liste boş. Önce &quot;Google verisini çek&quot; ile başlayın.</p>}
      </div>

      {failed.length > 0 && (
        <details className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Google&apos;da eşleşmeyen oteller ({failed.length})</summary>
          <ul className="mt-2 space-y-1 text-xs text-on-surface-variant">
            {failed.map((f) => (
              <li key={f.slug} className="flex flex-wrap items-center gap-2 py-1">
                <span className="font-semibold text-on-surface">{f.name}</span>
                <span>{f.reason}</span>
                <input
                  value={retryKw[f.slug] ?? ""}
                  onChange={(e) => setRetryKw({ ...retryKw, [f.slug]: e.target.value })}
                  placeholder="Google'daki adı (ör. Mövenpick Hotel Makkah)"
                  className="w-72 rounded-lg border border-outline-variant/30 bg-white px-2 py-1 text-xs"
                />
                <button
                  onClick={() => post({ action: "retry", slug: f.slug, keyword: retryKw[f.slug] }, `r-${f.slug}`, () => `${f.name} bulundu ve kaydedildi.`)}
                  disabled={!!busy || !retryKw[f.slug]}
                  className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busy === `r-${f.slug}` ? "Aranıyor…" : "Bu adla ara"}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
