"use client";
import { useState } from "react";
import Link from "next/link";
import HugIcon from "@/components/icons/HugIcon";
import PasswordInput from "./PasswordInput";
import { fieldClass, fieldIcon, primaryButton } from "./fields";

export default function UyeOlForm({ next }: { next: string }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", kvkk: false, marketing: false, website: "" });
  const [error, setError] = useState("");
  const [field, setField] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [exists, setExists] = useState(false);
  const [busy, setBusy] = useState(false);

  const fail = (msg: string, fld = "") => {
    setError(msg);
    setField(fld);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    fail("");
    setSuggestion("");
    setExists(false);
    if (f.name.trim().length < 2) return fail("Lütfen adınızı ve soyadınızı yazın.", "name");
    if (!f.email.trim()) return fail("E-posta adresinizi yazın.", "email");
    if (f.password.length < 8) return fail("Şifreniz en az 8 karakter olmalı.", "password");
    if (!f.kvkk) return fail("Devam etmek için KVKK bilgilendirmesini onaylayın.", "kvkk");
    setBusy(true);
    try {
      let utm = "";
      try { utm = localStorage.getItem("lead:utm") ?? ""; } catch { /* gizli pencere */ }
      const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, utm }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) {
        if (d.suggestion) setSuggestion(d.suggestion);
        if (d.exists) setExists(true);
        return fail(d.error || "Kayıt yapılamadı.", d.field || "");
      }
      try { localStorage.setItem("lead:tavaf-kitapcigi", "1"); localStorage.setItem("lead:say-kitapcigi", "1"); localStorage.setItem("lead:dua-haritasi", "1"); } catch { /* gizli pencere */ }
      window.location.href = next;
    } catch {
      fail("Bağlantı kurulamadı; lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-blue)]/70">Ücretsiz üyelik</p>
      <h2 className="mt-2 text-2xl font-bold text-[var(--h-blue)] md:text-[28px]">Hesabınızı oluşturun</h2>
      <p className="mt-1.5 text-sm text-[#5b6680]">
        Zaten üye misiniz? <Link href={`/profil/giris${next !== "/profil" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-[var(--h-blue)] underline underline-offset-4">Giriş yapın</Link>
      </p>
      <div className="mt-7 space-y-3">
        <label className="relative block">
          <span className="sr-only">Adınız soyadınız</span>
          <HugIcon name="bireysel" size={20} className={fieldIcon} />
          <input className={fieldClass(field === "name")} autoComplete="name" placeholder="Adınız soyadınız" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </label>
        <label className="relative block">
          <span className="sr-only">E-posta adresiniz</span>
          <HugIcon name="eposta" size={20} className={fieldIcon} />
          <input className={fieldClass(field === "email")} type="email" inputMode="email" autoComplete="email" placeholder="E-posta adresiniz" value={f.email} onChange={(e) => { setF({ ...f, email: e.target.value }); setSuggestion(""); }} />
        </label>
        {suggestion && (
          <button type="button" onClick={() => { setF({ ...f, email: suggestion }); setSuggestion(""); fail(""); }} className="flex w-full items-center gap-2 rounded-2xl bg-[#fbf4e1] px-4 py-2.5 text-left text-sm text-[#5a4612] ring-1 ring-[var(--h-sand)]">
            <HugIcon name="bilgi" size={16} className="text-[#b8862f]" /> <span>Bunu mu demek istediniz: <b className="underline underline-offset-4">{suggestion}</b></span>
          </button>
        )}
        <label className="relative block">
          <span className="sr-only">Telefon veya WhatsApp numaranız</span>
          <HugIcon name="telefon" size={20} className={fieldIcon} />
          <input className={fieldClass(field === "phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="Telefon / WhatsApp (isteğe bağlı)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </label>
        <PasswordInput value={f.password} onChange={(v) => setF({ ...f, password: v })} placeholder="Şifre (en az 8 karakter)" autoComplete="new-password" hasError={field === "password"} />
        <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      </div>

      <div className="mt-5 space-y-2 rounded-2xl bg-[var(--h-white)] p-4">
        <label className={`flex cursor-pointer items-start gap-3 text-[13px] leading-snug ${field === "kvkk" ? "text-red-700" : "text-[#14213d]"}`}>
          <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--h-blue)]" checked={f.kvkk} onChange={(e) => setF({ ...f, kvkk: e.target.checked })} />
          <span><Link href="/kvkk" target="_blank" className="font-bold text-[var(--h-blue)] underline underline-offset-2">KVKK Aydınlatma Metni</Link>&apos;ni okudum; kişisel verilerimin bu kapsamda işlenmesine ilişkin bilgilendirildim.</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-[#5b6680]">
          <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--h-blue)]" checked={f.marketing} onChange={(e) => setF({ ...f, marketing: e.target.checked })} />
          <span>Umre programları ve bilgilendirmeler için e-posta, SMS ve WhatsApp ile benimle iletişime geçilmesine izin veriyorum. <span className="text-[#8a94ab]">(İsteğe bağlı)</span></span>
        </label>
      </div>

      {error && !suggestion && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <HugIcon name="bilgi" size={16} className="mt-0.5" />
          <span>{error}{exists && <> <Link href={`/profil/giris?next=${encodeURIComponent(next)}`} className="font-bold underline">Giriş yap</Link> · <Link href={`/profil/sifremi-unuttum?email=${encodeURIComponent(f.email)}`} className="font-bold underline">Şifremi unuttum</Link></>}</span>
        </p>
      )}
      <button type="submit" disabled={busy} className={`${primaryButton} mt-6`}>
        <HugIcon name="onay" size={18} className="text-[var(--h-sand)]" /> {busy ? "Hesabınız açılıyor…" : "Üye ol"}
      </button>
    </form>
  );
}
