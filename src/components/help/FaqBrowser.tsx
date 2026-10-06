"use client";
import HugIcon from "@/components/icons/HugIcon";
import { useMemo, useState } from "react";

export type FaqItem = { cat: string; q: string; a: string };

export default function FaqBrowser({ items }: { items: FaqItem[] }) {
  const cats = useMemo(() => [...new Set(items.map((i) => i.cat))], [items]);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const list = items.filter((i) => (!cat || i.cat === cat) && (!q.trim() || `${i.q} ${i.a}`.toLocaleLowerCase("tr-TR").includes(q.trim().toLocaleLowerCase("tr-TR"))));

  return (
    <div className="rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
      <label className="block max-w-xl">
        <span className="mb-1.5 block text-sm font-semibold text-on-surface">Sorular içinde ara</span>
        <span className="relative block">
          <HugIcon name="ara" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Örn. vize, ödeme, iptal" className="w-full rounded-xl border border-outline-variant/40 py-3 pl-11 pr-10 focus:border-primary focus:outline-none" />
          {q && <button type="button" aria-label="Aramayı temizle" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>}
        </span>
      </label>
      <div className="mt-5 flex flex-wrap gap-2">
        {[null, ...cats].map((c) => (
          <button key={c ?? "all"} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${cat === c ? "border-primary bg-primary text-white" : "border-outline-variant/40 text-on-surface hover:border-primary/40"}`}>
            {c ?? "Tüm sorular"}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm text-on-surface-variant">{list.length} soru</p>
      <div className="mt-2 divide-y divide-outline-variant/20 border-t border-outline-variant/20">
        {list.map((i) => {
          const idx = items.indexOf(i);
          const isOpen = open === idx;
          return (
            <div key={idx}>
              <button type="button" onClick={() => setOpen(isOpen ? null : idx)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                <span className="text-base font-semibold text-on-surface md:text-lg">{i.q}</span>
                <span className={`material-symbols-outlined shrink-0 text-primary transition-transform ${isOpen ? "rotate-45" : ""}`}>add</span>
              </button>
              {isOpen && <p className="-mt-1 pb-5 pr-8 leading-relaxed text-on-surface-variant">{i.a}</p>}
            </div>
          );
        })}
        {list.length === 0 && <p className="py-8 text-center text-on-surface-variant">Aramanıza uygun soru bulunamadı. Destek formundan bize yazabilirsiniz.</p>}
      </div>
    </div>
  );
}
