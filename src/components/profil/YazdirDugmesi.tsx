"use client";
export default function YazdirDugmesi() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-2xl bg-[var(--h-blue)] px-5 py-3 text-sm font-bold text-white print:hidden">
      Yazdır / PDF olarak kaydet
    </button>
  );
}
