"use client";
import { useState } from "react";
import Link from "next/link";
import HugIcon from "@/components/icons/HugIcon";
import PasswordInput from "./PasswordInput";
import { fieldClass, fieldIcon, primaryButton } from "./fields";

export default function GirisForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("E-posta ve şifrenizi yazın.");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) return setError(d.error || "Giriş yapılamadı.");
      window.location.href = next;
    } catch {
      setError("Bağlantı kurulamadı; lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-blue)]/70">Giriş yap</p>
      <h2 className="mt-2 text-2xl font-bold text-[var(--h-blue)] md:text-[28px]">Hesabınıza girin</h2>
      <p className="mt-1.5 text-sm text-[#5b6680]">
        Hesabınız yok mu? <Link href={`/profil/uye-ol${next !== "/profil" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-[var(--h-blue)] underline underline-offset-4">Ücretsiz üye olun</Link>
      </p>
      <div className="mt-7 space-y-3">
        <label className="relative block">
          <span className="sr-only">E-posta adresiniz</span>
          <HugIcon name="eposta" size={20} className={fieldIcon} />
          <input className={fieldClass(false)} type="email" inputMode="email" autoComplete="email" placeholder="E-posta adresiniz" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <PasswordInput value={password} onChange={setPassword} placeholder="Şifreniz" autoComplete="current-password" hasError={false} />
      </div>
      <div className="mt-3 text-right">
        <Link href={`/profil/sifremi-unuttum${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="text-sm font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Şifremi unuttum</Link>
      </div>
      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"><HugIcon name="bilgi" size={16} className="mt-0.5" /> {error}</p>
      )}
      <button type="submit" disabled={busy} className={`${primaryButton} mt-6`}>
        <HugIcon name="ok" size={18} className="text-[var(--h-sand)]" /> {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
