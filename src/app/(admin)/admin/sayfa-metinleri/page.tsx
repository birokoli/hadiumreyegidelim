"use client";
// Sayfa Metinleri: sitedeki sabit metinler (başlık, giriş, SSS, düğme yazıları…) sayfa sayfa düzenlenir.
import { useEffect, useMemo, useState } from "react";

type Field = { key: string; label: string; default: string; multiline?: boolean; help?: string };
type Page = { id: string; label: string; path: string; fields: Field[] };

const input = "w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm focus:border-primary outline-none";

export default function PageTextsAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [active, setActive] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/admin/page-texts")
      .then((r) => r.json())
      .then((d) => {
        if (!d.pages) return setMsg(d.error || "Yüklenemedi.");
        setPages(d.pages);
        setValues(d.values ?? {});
        if (d.pages[0]) {
          setActive(d.pages[0].id);
          setDraft(Object.fromEntries((d.pages[0] as Page).fields.map((f) => [f.key, d.values?.[d.pages[0].id]?.[f.key] ?? f.default])));
        }
      })
      .catch(() => setMsg("Bağlantı hatası."));
  }, []);

  const page = pages.find((p) => p.id === active);
  const draftFor = (p: Page, v: Record<string, Record<string, string>>) => Object.fromEntries(p.fields.map((f) => [f.key, v[p.id]?.[f.key] ?? f.default]));
  const open = (id: string) => {
    const p = pages.find((x) => x.id === id);
    setActive(id);
    setMsg("");
    if (p) setDraft(draftFor(p, values));
  };

  const list = useMemo(() => pages.filter((p) => !q || (p.label + p.path).toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"))), [pages, q]);

  const save = async () => {
    if (!page) return;
    setSaving(true);
    const r = await fetch("/api/admin/page-texts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: page.id, values: draft }) }).then((x) => x.json()).catch(() => ({ error: "Bağlantı hatası." }));
    setSaving(false);
    if (r.error) return setMsg(r.error);
    const changed = Object.fromEntries(page.fields.filter((f) => draft[f.key]?.trim() && draft[f.key].trim() !== f.default).map((f) => [f.key, draft[f.key].trim()]));
    setValues((v) => ({ ...v, [page.id]: changed }));
    setMsg(`Kaydedildi (${r.saved} alan varsayılandan farklı). Sitede birkaç saniye içinde görünür.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-primary">Sayfa Metinleri</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Sitedeki sayfaların başlık, giriş, SSS ve düğme yazıları. Bir alanı boşaltırsanız koddaki varsayılan metin geri gelir.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-2">
          <input className={input} placeholder="Sayfa ara…" value={q} onChange={(e) => setQ(e.target.value)} />
          <ul className="space-y-1">
            {list.map((p) => (
              <li key={p.id}>
                <button onClick={() => open(p.id)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${active === p.id ? "bg-primary text-white" : "hover:bg-surface-container-low"}`}>
                  <span className="block font-semibold">{p.label}</span>
                  <span className={`block text-[11px] ${active === p.id ? "text-white/70" : "text-on-surface-variant"}`}>{p.path} · {p.fields.length} alan{values[p.id] && Object.keys(values[p.id]).length ? ` · ${Object.keys(values[p.id]).length} değişti` : ""}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {page && (
          <section className="space-y-4 rounded-2xl border border-outline-variant/20 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-bold text-primary">{page.label} <a href={page.path} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs font-semibold underline">sayfayı aç</a></p>
              <button onClick={save} disabled={saving} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Kaydediliyor…" : "Kaydet"}</button>
            </div>
            {msg && <p className="text-sm font-semibold text-primary" role="status">{msg}</p>}
            {page.fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 flex items-center justify-between text-xs font-bold text-on-surface-variant">
                  {f.label}
                  {draft[f.key] !== f.default && <button type="button" onClick={() => setDraft((d) => ({ ...d, [f.key]: f.default }))} className="font-semibold text-primary underline">varsayılana dön</button>}
                </span>
                {f.multiline ? (
                  <textarea className={input} rows={4} value={draft[f.key] ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />
                ) : (
                  <input className={input} value={draft[f.key] ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />
                )}
                {f.help && <span className="mt-1 block text-[11px] text-on-surface-variant">{f.help}</span>}
              </label>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
