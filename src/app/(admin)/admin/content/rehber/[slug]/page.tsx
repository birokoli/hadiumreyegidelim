"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { SUFFIX, fromForm, toForm, words, type Form, type SectionForm } from "@/content/pages/form";

type Issue = { level: "hata" | "uyarı"; message: string };

const lbl = "mb-1.5 flex items-baseline justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant";
const inp = "w-full rounded-xl border border-outline-variant/30 bg-white px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50";
const area = `${inp} leading-relaxed`;
const count = (ok: boolean, text: string) => <span className={`font-mono normal-case tracking-normal ${ok ? "text-outline" : "text-error"}`}>{text}</span>;

export default function RehberEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [meta, setMeta] = useState<{ path: string; group: string; edited: boolean; savedAt: string | null; savedBy: string | null; codeNewer: boolean; knownPaths: string[] } | null>(null);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [busy, setBusy] = useState<"" | "check" | "save" | "reset">("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = () =>
    fetch(`/api/admin/content-pages?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) return setLoadError(j.error || "Sayfa alınamadı");
        setForm(toForm(j.page));
        setMeta({ path: j.path, group: j.page.group, edited: j.edited, savedAt: j.savedAt, savedBy: j.savedBy, codeNewer: j.codeNewer, knownPaths: j.knownPaths });
      })
      .catch(() => setLoadError("Sayfa alınamadı"));

  useEffect(() => { load(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalWords = useMemo(() => {
    if (!form) return 0;
    return words([form.title, form.description, form.h1, form.lead, ...form.sections.flatMap((s) => [s.h2, s.paragraphs, s.bullets, s.table.replace(/\|/g, " ")]), ...form.faq.flatMap((f) => [f.q, f.a])].join(" "));
  }, [form]);

  if (loadError) return <div className="p-8 text-sm text-error" role="alert">{loadError}</div>;
  if (!form || !meta) return <div className="p-8 text-xs text-on-surface-variant">Yükleniyor…</div>;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });
  const setSection = (i: number, patch: Partial<SectionForm>) => set("sections", form.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const moveSection = (i: number, d: -1 | 1) => {
    const next = [...form.sections];
    const [s] = next.splice(i, 1);
    next.splice(i + d, 0, s);
    set("sections", next);
  };

  const submit = async (dryRun: boolean) => {
    setBusy(dryRun ? "check" : "save"); setNotice(""); setError("");
    try {
      const res = await fetch("/api/admin/content-pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, page: fromForm(form), dryRun }) });
      const j = await res.json();
      setIssues(j.issues ?? []);
      if (j.error) setError(j.error);
      else if (j.saved) { setNotice("Kaydedildi ve yayına alındı. Sitedeki sayfa birkaç saniye içinde yenilenir."); load(); }
      else if (j.ok) setNotice("Denetim temiz: kaydedebilirsiniz.");
      else setError("Kaydedilmedi: aşağıdaki hataları düzeltin.");
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setBusy("");
    }
  };

  const reset = async () => {
    if (!confirm("Admin'de yapılan değişiklikler silinecek ve sayfa özgün sürümüne dönecek. Emin misiniz?")) return;
    setBusy("reset"); setNotice(""); setError("");
    const res = await fetch(`/api/admin/content-pages?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setBusy("");
    if (res.ok) { setIssues(null); setNotice("Özgün sürüme dönüldü."); load(); } else setError("Geri alınamadı.");
  };

  const errors = issues?.filter((i) => i.level === "hata") ?? [];
  const warnings = issues?.filter((i) => i.level === "uyarı") ?? [];
  const titleLen = (form.title + SUFFIX).length;
  const leadWords = words(form.lead);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 min-h-screen bg-surface text-on-surface pb-32">
      <div className="pb-5 border-b border-outline-variant/15">
        <Link href="/admin/content/rehber" className="text-[11px] font-semibold text-on-surface-variant hover:text-primary">← Rehber sayfaları</Link>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-2">{form.h1 || slug}</h1>
        <p className="mt-1 text-xs text-on-surface-variant">
          Adres: <a href={meta.path} target="_blank" className="text-primary underline">{meta.path}</a> (değiştirilemez) ·{" "}
          {meta.edited ? `Admin'de düzenlendi${meta.savedAt ? `: ${new Date(meta.savedAt).toLocaleString("tr-TR")}${meta.savedBy ? `, ${meta.savedBy}` : ""}` : ""}` : "Özgün sürüm"}
        </p>
        {meta.codeNewer && (
          <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Bu sayfanın kod sürümü, sizin kaydınızdan sonra güncellendi. Sitede sizin kaydınız görünüyor. Güncel kod sürümünü görmek için “Özgün sürüme dön”e basın (sizin değişiklikleriniz silinir).
          </p>
        )}
      </div>

      <details className="rounded-2xl border border-outline-variant/20 bg-white px-5 py-4 text-xs leading-relaxed text-on-surface-variant">
        <summary className="cursor-pointer font-bold text-primary">Nasıl yazılır? (bağlantılar ve kurallar)</summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Metin içinde bağlantı: <code className="rounded bg-surface-container-low px-1">[görünen metin](/bireysel-umre)</code>. Görünen metin okunur bir ifade olmalı, adres gibi yazılmamalı.</li>
          <li>Site dışına yalnızca resmî bilgi sayfalarına (Diyanet, Nusuk, Suudi resmî siteleri) konu kelimesi üzerinden bağlantı verilir. Vize, paket, otel, uçuş, transfer, tren, rehberlik gibi sattığımız hizmetler dışarıya bağlanmaz.</li>
          <li>Paragraflar arasında bir boş satır bırakın. Maddeler: her satır bir madde. Tablo: ilk satır başlık, hücreleri <code className="rounded bg-surface-container-low px-1">|</code> ile ayırın.</li>
          <li>“En ucuz”, “garanti”, “%… varan”, “eşsiz”, “son derece” gibi kanıtlanamayan ifadeler ve yasaklı kelimeler denetimden geçmez. Marka adı metinde en az bir kez geçmeli.</li>
          <li>Kaydederken “son gözden geçirme” tarihi bugün olarak güncellenir.</li>
        </ul>
      </details>

      <section className="grid gap-5 rounded-2xl border border-outline-variant/20 bg-white p-6 md:grid-cols-2">
        <label className="md:col-span-2 block"><span className={lbl}>Sayfa başlığı (Google'da görünen) {count(titleLen <= 60, `${titleLen}/60 site adıyla`)}</span><input className={inp} value={form.title} onChange={(e) => set("title", e.target.value)} /></label>
        <label className="md:col-span-2 block"><span className={lbl}>Açıklama (Google'daki kısa metin) {count(form.description.length >= 120 && form.description.length <= 158, `${form.description.length} / 120–158`)}</span><textarea rows={2} className={area} value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
        <label className="block"><span className={lbl}>Sayfadaki ana başlık (H1)</span><input className={inp} value={form.h1} onChange={(e) => set("h1", e.target.value)} /></label>
        <label className="block"><span className={lbl}>Hedef arama kelimesi</span><input className={inp} value={form.keyword} onChange={(e) => set("keyword", e.target.value)} /></label>
        {meta.group === "sozluk" && <label className="block"><span className={lbl}>Terim</span><input className={inp} value={form.term} onChange={(e) => set("term", e.target.value)} /></label>}
        <label className="md:col-span-2 block"><span className={lbl}>Giriş paragrafı (sorunun doğrudan cevabı) {count(leadWords >= 40 && leadWords <= 60, `${leadWords} kelime / 40–60`)}</span><textarea rows={4} className={area} value={form.lead} onChange={(e) => set("lead", e.target.value)} /></label>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-headline text-lg font-bold text-primary">Bölümler <span className="text-xs font-normal text-outline">(en az 4; en az 2 başlık soru olmalı)</span></h2>
          <span className="text-[11px] text-on-surface-variant">Toplam ≈ {totalWords} kelime (en az 700)</span>
        </div>
        {form.sections.map((s, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-outline-variant/20 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-outline">{i + 1}</span>
              <input className={`${inp} font-semibold`} placeholder="Ara başlık (H2)" value={s.h2} onChange={(e) => setSection(i, { h2: e.target.value })} />
              <button type="button" disabled={i === 0} onClick={() => moveSection(i, -1)} className="rounded-lg px-2 py-1 text-outline hover:text-primary disabled:opacity-30" aria-label="Yukarı taşı"><span className="material-symbols-outlined text-[18px]">arrow_upward</span></button>
              <button type="button" disabled={i === form.sections.length - 1} onClick={() => moveSection(i, 1)} className="rounded-lg px-2 py-1 text-outline hover:text-primary disabled:opacity-30" aria-label="Aşağı taşı"><span className="material-symbols-outlined text-[18px]">arrow_downward</span></button>
              <button type="button" onClick={() => confirm("Bu bölüm silinsin mi?") && set("sections", form.sections.filter((_, j) => j !== i))} className="rounded-lg px-2 py-1 text-outline hover:text-error" aria-label="Bölümü sil"><span className="material-symbols-outlined text-[18px]">delete</span></button>
            </div>
            <label className="block"><span className={lbl}>Paragraflar (aralarına boş satır)</span><textarea rows={7} className={area} value={s.paragraphs} onChange={(e) => setSection(i, { paragraphs: e.target.value })} /></label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block"><span className={lbl}>Maddeler (isteğe bağlı, her satır bir madde)</span><textarea rows={4} className={area} value={s.bullets} onChange={(e) => setSection(i, { bullets: e.target.value })} /></label>
              <label className="block"><span className={lbl}>Tablo (isteğe bağlı, ilk satır başlık, hücreler |)</span><textarea rows={4} className={`${area} font-mono text-xs`} value={s.table} onChange={(e) => setSection(i, { table: e.target.value })} /></label>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set("sections", [...form.sections, { h2: "", paragraphs: "", bullets: "", table: "" }])} className="rounded-xl border border-dashed border-primary/40 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/[0.04]">+ Bölüm ekle</button>
      </section>

      <section className="space-y-3 rounded-2xl border border-outline-variant/20 bg-white p-6">
        <h2 className="font-headline text-lg font-bold text-primary">Sık sorulan sorular <span className="text-xs font-normal text-outline">(3–6)</span></h2>
        {form.faq.map((f, i) => (
          <div key={i} className="grid gap-2 border-t border-outline-variant/15 pt-3 first:border-0 first:pt-0">
            <div className="flex gap-2">
              <input className={`${inp} font-semibold`} placeholder="Soru" value={f.q} onChange={(e) => set("faq", form.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
              <button type="button" onClick={() => set("faq", form.faq.filter((_, j) => j !== i))} className="rounded-lg px-2 text-outline hover:text-error" aria-label="Soruyu sil"><span className="material-symbols-outlined text-[18px]">delete</span></button>
            </div>
            <textarea rows={3} className={area} placeholder="Cevap" value={f.a} onChange={(e) => set("faq", form.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
          </div>
        ))}
        <button type="button" onClick={() => set("faq", [...form.faq, { q: "", a: "" }])} className="rounded-xl border border-dashed border-primary/40 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/[0.04]">+ Soru ekle</button>
      </section>

      <section className="grid gap-5 rounded-2xl border border-outline-variant/20 bg-white p-6 md:grid-cols-2">
        <label className="block"><span className={lbl}>Resmî kaynaklar (her satır: Metin | https://…)</span><textarea rows={4} className={`${area} text-xs`} value={form.sources} onChange={(e) => set("sources", e.target.value)} /></label>
        <label className="block">
          <span className={lbl}>İlgili sayfalar (3–6, her satır bir adres)</span>
          <textarea rows={4} className={`${area} font-mono text-xs`} value={form.related} onChange={(e) => set("related", e.target.value)} />
          <span className="mt-1 block text-[11px] text-on-surface-variant">/bireysel-umre bağlantısı metinde ya da burada bulunmalı.</span>
        </label>
        <details className="md:col-span-2 text-[11px] text-on-surface-variant">
          <summary className="cursor-pointer font-semibold text-primary">Bağlantı verilebilecek site içi adresler ({meta.knownPaths.length})</summary>
          <p className="mt-2 font-mono leading-6">{meta.knownPaths.join("  ·  ")}</p>
        </details>
      </section>

      {issues && (
        <section className={`rounded-2xl border p-5 text-sm ${errors.length ? "border-error/40 bg-error/[0.04]" : "border-secondary/30 bg-secondary/[0.05]"}`} aria-live="polite">
          <h2 className="font-bold text-on-surface">{errors.length ? `${errors.length} hata: kaydedilmeden önce düzeltilmeli` : "Denetim temiz"}{warnings.length ? ` · ${warnings.length} uyarı` : ""}</h2>
          {issues.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {issues.map((i, k) => <li key={k} className={i.level === "hata" ? "text-error" : "text-amber-800"}>{i.level === "hata" ? "Hata" : "Uyarı"}: {i.message}</li>)}
            </ul>
          )}
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/20 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
          <button type="button" disabled={!!busy} onClick={() => submit(true)} className="rounded-xl border border-primary/30 px-4 py-2.5 text-xs font-bold text-primary disabled:opacity-50">{busy === "check" ? "Denetleniyor…" : "Denetle"}</button>
          <button type="button" disabled={!!busy} onClick={() => submit(false)} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy === "save" ? "Kaydediliyor…" : "Kaydet ve yayınla"}</button>
          {meta.edited && <button type="button" disabled={!!busy} onClick={reset} className="rounded-xl px-3 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-error disabled:opacity-50">Özgün sürüme dön</button>}
          <span className="ml-auto text-xs" role="status">{notice && <span className="text-secondary font-semibold">{notice}</span>}{error && <span className="text-error font-semibold">{error}</span>}</span>
        </div>
      </div>
    </div>
  );
}
