"use client";

import { useState } from "react";
import { useDiagReport } from "@/lib/diag/useDiagReport";

/** SEO Masası ve AI Görünürlük menüsündeki "Hata raporu" düğmesi ve paneli */
export default function DiagButton() {
  const [open, setOpen] = useState(false);
  const { note, setNote, busy, status, report, copy, download } = useDiagReport();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="ml-auto text-[13px] font-semibold text-[var(--seo-ink-3)] hover:text-[var(--seo-mark)]"
      >
        Hata raporu
      </button>
      {open && (
        <div className="order-last basis-full rounded-[4px] bg-[var(--seo-paper-2)] p-5">
          <p className="text-[15px] font-bold">Hata raporu</p>
          <p className="mt-1 max-w-[720px] text-[13px] leading-relaxed text-[var(--seo-ink-2)]">
            Bu sayfadaki istekleri, hata mesajlarını, sürümü ve bağlantı testlerini (DataForSEO bakiyesi, Anthropic, veritabanı) tek bir Markdown belgesinde toplar.
            Şifre ve anahtar değerleri rapora girmez. Hatayı yaşadıktan sonra, sayfayı yenilemeden oluşturun.
          </p>
          <label htmlFor="diag-note" className="mt-4 block text-[12px] font-semibold text-[var(--seo-ink-3)]">Ne yapıyordunuz, ne bekliyordunuz? (isteğe bağlı)</label>
          <textarea
            id="diag-note"
            rows={3}
            className="seo-input mt-1 w-full max-w-[720px] resize-y bg-white text-[14px]"
            placeholder="Ör. Sorular sayfasında Sor'a bastım, ChatGPT sütununda kırmızı ! çıktı."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button className="seo-btn" onClick={copy} disabled={busy}>{busy ? "Hazırlanıyor" : "Raporu kopyala"}</button>
            <button className="seo-link text-[14px]" onClick={download} disabled={busy}>.md olarak indir</button>
            {status && <span className="text-[13px] font-semibold text-[var(--seo-mark)]" aria-live="polite">{status}</span>}
          </div>
          {report && (
            <details className="mt-4">
              <summary className="cursor-pointer text-[13px] text-[var(--seo-ink-3)]">Raporu göster ({report.length.toLocaleString("tr-TR")} karakter)</summary>
              <pre className="seo-mono mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-[4px] bg-white p-4 text-[12px]">{report}</pre>
            </details>
          )}
        </div>
      )}
    </>
  );
}
