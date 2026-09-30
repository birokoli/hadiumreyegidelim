"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = { slug: string; group: string; path: string; h1: string; keyword: string; reviewed: string; edited: boolean; savedAt: string | null; savedBy: string | null; codeNewer: boolean };

const GROUPS: { id: string; title: string }[] = [
  { id: "sozluk", title: "Umre sözlüğü" },
  { id: "karsilastirma", title: "Karşılaştırmalar" },
  { id: "kisi", title: "Kime göre umre" },
  { id: "zaman", title: "Döneme göre umre" },
];

const fmt = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function RehberSayfalariPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/content-pages", { cache: "no-store" })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => (ok ? setRows(j.pages) : setError(j.error || "Liste alınamadı")))
      .catch(() => setError("Liste alınamadı"));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <div className="pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">İçerik Stüdyosu</span>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Rehber Sayfaları</h1>
        <p className="text-xs text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
          Google için açılan umre rehberi sayfaları (sözlük, karşılaştırma, kişiye ve döneme göre umre). Ana sayfada listelenmezler; arama sonuçlarında ve{" "}
          <a href="/umre-rehberi" target="_blank" className="text-primary underline">umre rehberi</a> sayfasında görünürler. Düzenleyip kaydettiğiniz metin, kalite denetiminden geçerse hemen yayına girer.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      {!rows && !error && <p className="text-xs text-on-surface-variant">Yükleniyor…</p>}

      {rows && GROUPS.map((g) => {
        const list = rows.filter((r) => r.group === g.id);
        if (!list.length) return null;
        return (
          <section key={g.id}>
            <h2 className="font-headline text-lg font-bold text-primary">{g.title} <span className="text-xs font-normal text-outline">({list.length})</span></h2>
            <ul className="mt-3 divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/20 bg-white">
              {list.map((r) => (
                <li key={r.slug} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/admin/content/rehber/${r.slug}`} className="font-semibold text-on-surface hover:text-primary">{r.h1}</Link>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant truncate">
                      {r.path} · kelime: {r.keyword} · son gözden geçirme {r.reviewed}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {r.codeNewer && <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Kodda daha yeni sürüm var</span>}
                    {r.edited ? (
                      <span title={r.savedAt ? `${fmt(r.savedAt)} · ${r.savedBy ?? ""}` : undefined} className="rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-[10px] font-bold text-primary">Admin'de düzenlendi</span>
                    ) : (
                      <span className="rounded-full border border-outline-variant/30 px-2.5 py-1 text-[10px] font-bold text-outline">Özgün sürüm</span>
                    )}
                    <a href={r.path} target="_blank" className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant hover:text-primary">Sitede gör</a>
                    <Link href={`/admin/content/rehber/${r.slug}`} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white">Düzenle</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
