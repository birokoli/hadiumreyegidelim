"use client";
// Ücretsiz materyali indirmeden önce ad + e-posta ya da telefon ister (12 Ekim, kullanıcı: müşteri havuzu).
// Kayıt /api/leads'e gider; başarılıysa dosya iner. Aynı tarayıcıda bir kez kayıt olan tekrar sorulmaz.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

type Props = { source: string; fileUrl: string; fileName: string; className?: string; children: ReactNode };

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function LeadGateDownload({ source, fileUrl, fileName, className, children }: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", kvkk: false, marketing: false, website: "" });
  const dialog = useRef<HTMLDialogElement>(null);
  const key = `lead:${source}`;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const start = () => {
    let known = false;
    try { known = localStorage.getItem(key) === "1"; } catch { /* gizli pencere */ }
    if (known) return download(fileUrl, fileName);
    setError("");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() && !form.phone.trim()) return setError("E-posta adresinizi ya da telefon numaranızı yazın.");
    if (!form.kvkk) return setError("Devam etmek için KVKK bilgilendirmesini onaylayın.");
    setBusy(true);
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source, referrer: typeof document !== "undefined" ? document.referrer : "" }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok === false) throw new Error(d.error || "Kaydedilemedi; lütfen tekrar deneyin.");
      try { localStorage.setItem(key, "1"); } catch { /* gizli pencere */ }
      setDone(true);
      download(fileUrl, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-xl border border-[#b8c9e3] bg-white px-4 py-3 text-[15px] text-[#14213d] placeholder:text-[#8a94ab] focus:border-[#1d428a] focus:outline-none focus:ring-2 focus:ring-[#1d428a]/15";

  return (
    <>
      <button type="button" onClick={start} className={className}>{children}</button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === dialog.current) setOpen(false); }}
        className="m-auto w-[min(92vw,440px)] rounded-3xl p-0 text-left backdrop:bg-[#12295a]/60 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 md:p-7">
          <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="absolute right-4 top-4 rounded-full p-1.5 text-[#5b6680] hover:bg-[#edf1fe]">✕</button>
          {done ? (
            <div className="py-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/70">Teşekkürler</p>
              <h2 className="mt-2 text-2xl font-bold text-[#1d428a]">İndirme başladı</h2>
              <p className="mt-3 text-sm text-[#5b6680]">İnmediyse <a href={fileUrl} download={fileName} className="font-semibold text-[#1d428a] underline">buraya tıklayın</a>. Tavafta bizleri de dualarınızdan eksik etmeyin.</p>
              <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-[#1d428a] px-6 py-3 text-sm font-bold text-white">Kapat</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/70">Ücretsiz · PDF</p>
              <h2 className="mt-2 pr-8 text-2xl font-bold leading-tight text-[#1d428a]">Kitapçığınızı hemen indirin</h2>
              <p className="mt-2 text-sm text-[#5b6680]">Adınızı ve size ulaşabileceğimiz bir iletişim bilgisini yazın; indirme hemen başlar.</p>
              <div className="mt-5 space-y-3">
                <input className={input} placeholder="Adınız soyadınız" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className={input} type="email" placeholder="E-posta adresiniz" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a94ab]"><span className="h-px flex-1 bg-[#d7e0f0]" />ya da<span className="h-px flex-1 bg-[#d7e0f0]" /></div>
                <input className={input} type="tel" inputMode="tel" placeholder="Telefon numaranız (05xx xxx xx xx)" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {/* bal küpü: insanlar görmez, botlar doldurur */}
                <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <label className="mt-4 flex items-start gap-2.5 text-[13px] leading-snug text-[#14213d]">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1d428a]" checked={form.kvkk} onChange={(e) => setForm({ ...form, kvkk: e.target.checked })} />
                <span><Link href="/kvkk" target="_blank" className="font-semibold text-[#1d428a] underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum; kişisel verilerimin bu kapsamda işlenmesine ilişkin bilgilendirildim.</span>
              </label>
              <label className="mt-2.5 flex items-start gap-2.5 text-[13px] leading-snug text-[#5b6680]">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1d428a]" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} />
                <span>Umre programları ve bilgilendirmeler için e-posta, SMS ve WhatsApp ile benimle iletişime geçilmesine izin veriyorum. (İsteğe bağlı)</span>
              </label>
              {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy} className="mt-5 w-full rounded-xl bg-[#1d428a] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#12295a] disabled:opacity-60">
                {busy ? "Kaydediliyor…" : "Kitapçığı indir"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
