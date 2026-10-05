"use client";
// Destek formu: talep ContactRequest'e kaydedilir (admin → Talepler) ve yöneticiye WhatsApp bildirimi gider.
import { useState } from "react";
import { SUBJECTS } from "@/lib/help";



const field = "w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function SupportForm({ defaultSubject = "", whatsappNumber, extraLabel, initialMessage = "" }: { defaultSubject?: string; whatsappNumber: string; extraLabel?: string; initialMessage?: string }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", subject: defaultSubject, message: initialMessage, extra: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, phone: f.phone, email: f.email, subject: f.subject, message: [extraLabel && f.extra ? `${extraLabel}: ${f.extra}` : "", f.message].filter(Boolean).join("\n"), website: f.website }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.error) throw new Error(d.error || "Talebiniz gönderilemedi.");
      setTicket(d.ticket ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (ticket)
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-[#15803d]">check_circle</span>
        <h3 className="mt-3 font-headline text-2xl font-bold text-primary">Talebiniz alındı</h3>
        <p className="mt-2 text-on-surface-variant">Takip numaranız: <b className="font-mono text-on-surface">{ticket}</b></p>
        <p className="mt-1 text-sm text-on-surface-variant">Ekibimiz verdiğiniz numaradan size dönüş yapacak. Acil durumlarda WhatsApp&apos;tan bu numarayla yazabilirsiniz.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-on-surface">Adınız soyadınız *</span>
          <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-on-surface">Telefon (WhatsApp) *</span>
          <input required type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={field} autoComplete="tel" placeholder="05xx xxx xx xx" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-on-surface">E-posta (isteğe bağlı)</span>
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-on-surface">Konu *</span>
          <select required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={field}>
            <option value="">Konu seçin</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        {extraLabel && (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-on-surface">{extraLabel}</span>
            <input value={f.extra} onChange={(e) => setF({ ...f, extra: e.target.value })} className={field} />
          </label>
        )}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-on-surface">Talebiniz *</span>
        <textarea required minLength={10} rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className={field} />
      </label>
      {/* Bot tuzağı: insanlar görmez */}
      <input tabIndex={-1} autoComplete="off" aria-hidden value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} className="hidden" name="website" />
      {error && <p className="text-sm font-semibold text-error">{error} Dilerseniz <a className="underline" href={`https://wa.me/${whatsappNumber}`}>WhatsApp&apos;tan</a> yazın.</p>}
      <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white disabled:opacity-50">
        {busy ? "Gönderiliyor…" : "Talebi gönder"} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
      <p className="text-[13px] text-on-surface-variant">Talebiniz kayıt altına alınır ve size bir takip numarası verilir. Kayıt sırasında bir sorun olursa ekranda açıkça yazar; o durumda bize telefon ya da WhatsApp&apos;tan ulaşabilirsiniz.</p>
    </form>
  );
}
