"use client";

import { useState } from "react";
import { useDiagReport } from "@/lib/diag/useDiagReport";

/** Admin sayfalarında sağ alttaki "Hata raporu" düğmesi (SEO Masası dışındaki bölümler için) */
export default function FloatingDiagButton() {
  const [open, setOpen] = useState(false);
  const { note, setNote, busy, status, report, copy, download } = useDiagReport('main [role="alert"], [data-diag-alert]');

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(92vw,420px)] rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-[0_20px_50px_-20px_rgba(0,25,68,0.45)]">
          <p className="font-bold text-primary">Hata raporu</p>
          <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">
            Bu sayfadaki istekleri, hata mesajlarını, sürümü ve bağlantı testlerini tek bir belgede toplar. Şifre ve anahtar değerleri rapora girmez. Hatayı yaşadıktan sonra, sayfayı yenilemeden oluşturun.
          </p>
          <label htmlFor="float-diag-note" className="mt-3 block text-[12px] font-semibold text-on-surface-variant">Ne yapıyordunuz, ne bekliyordunuz? (isteğe bağlı)</label>
          <textarea
            id="float-diag-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ör. Excel Fiyat Motoru'nda dosyayı yükledim, toplam fiyat 0 çıktı."
            className="mt-1 w-full resize-y rounded-xl border border-outline-variant/40 px-3 py-2 text-[14px] outline-none focus:border-primary"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={copy} disabled={busy} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {busy ? "Hazırlanıyor" : "Raporu kopyala"}
            </button>
            <button type="button" onClick={download} disabled={busy} className="text-sm font-semibold text-primary underline underline-offset-4">.md olarak indir</button>
          </div>
          {status && <p className="mt-2 text-[13px] font-semibold text-secondary" aria-live="polite">{status}</p>}
          {report && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[12px] text-on-surface-variant">Raporu göster ({report.length.toLocaleString("tr-TR")} karakter)</summary>
              <pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-low p-3 text-[11px]">{report}</pre>
            </details>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded-full border border-outline-variant/30 bg-white px-4 py-2 text-[13px] font-semibold text-on-surface-variant shadow-md hover:text-primary"
      >
        {open ? "Kapat" : "Hata raporu"}
      </button>
    </div>
  );
}
