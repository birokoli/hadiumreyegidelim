"use client";
import { useState } from "react";
import Link from "next/link";
import HugIcon from "@/components/icons/HugIcon";
import PasswordInput from "./PasswordInput";
import { fieldClass, fieldIcon, primaryButton } from "./fields";

export default function SifreForm({ initialEmail }: { initialEmail: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [field, setField] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/auth/sifre", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, ...body }) });
    return { ok: r.ok, d: await r.json().catch(() => ({})) };
  };

  const start = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!email.trim()) return setError("E-posta adresinizi yazın.");
    setBusy(true);
    try {
      const { ok, d } = await post({ action: "start" });
      if (!ok) return setError(d.error || "Kod gönderilemedi.");
      setStep("code");
    } catch {
      setError("Bağlantı kurulamadı; lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setField("");
    setBusy(true);
    try {
      const { ok, d } = await post({ code, password });
      if (!ok || !d.success) {
        setField(d.field || "");
        return setError(d.error || "Şifre değiştirilemedi.");
      }
      window.location.href = "/profil";
    } catch {
      setError("Bağlantı kurulamadı; lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const hata = error && (
    <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"><HugIcon name="bilgi" size={16} className="mt-0.5" /> {error}</p>
  );

  return step === "email" ? (
    <form onSubmit={start} noValidate>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-blue)]/70">Şifremi unuttum</p>
      <h2 className="mt-2 text-2xl font-bold text-[var(--h-blue)] md:text-[28px]">Şifrenizi yenileyin</h2>
      <p className="mt-1.5 text-sm text-[#5b6680]">Üye olduğunuz e-posta adresini yazın; 6 haneli bir kod gönderelim.</p>
      <label className="relative mt-7 block">
        <span className="sr-only">E-posta adresiniz</span>
        <HugIcon name="eposta" size={20} className={fieldIcon} />
        <input className={fieldClass(false)} type="email" inputMode="email" autoComplete="email" placeholder="E-posta adresiniz" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {hata}
      <button type="submit" disabled={busy} className={`${primaryButton} mt-6`}>
        <HugIcon name="eposta" size={18} className="text-[var(--h-sand)]" /> {busy ? "Gönderiliyor…" : "Kod gönder"}
      </button>
      <p className="mt-5 text-center text-sm text-[#5b6680]"><Link href="/profil/giris" className="font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Girişe dön</Link></p>
    </form>
  ) : (
    <form onSubmit={reset} noValidate>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-blue)]/70">Son adım</p>
      <h2 className="mt-2 text-2xl font-bold text-[var(--h-blue)] md:text-[28px]">Kodu ve yeni şifrenizi yazın</h2>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--h-white)] p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--h-blue)] text-[var(--h-sand)]"><HugIcon name="eposta" size={20} /></span>
        <p className="text-sm leading-snug text-[#3d4a66]">Bu adrese kayıtlı bir hesap varsa kodu gönderdik:<br /><b className="break-all text-[#14213d]">{email}</b></p>
      </div>
      <div className="mt-5 space-y-3">
        <input
          className={`${fieldClass(field === "code")} pl-4 text-center font-bold tracking-[0.5em]`}
          inputMode="numeric" autoComplete="one-time-code" placeholder="6 haneli kod" aria-label="Sıfırlama kodu"
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <PasswordInput value={password} onChange={setPassword} placeholder="Yeni şifre (en az 8 karakter)" autoComplete="new-password" hasError={field === "password"} />
      </div>
      {hata}
      <button type="submit" disabled={busy} className={`${primaryButton} mt-6`}>
        <HugIcon name="onay" size={18} className="text-[var(--h-sand)]" /> {busy ? "Kaydediliyor…" : "Şifremi değiştir ve giriş yap"}
      </button>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={() => start()} className="font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Kodu tekrar gönder</button>
        <button type="button" onClick={() => { setStep("email"); setError(""); }} className="text-[#5b6680] underline-offset-4 hover:underline">E-postayı değiştir</button>
      </div>
      <p className="mt-4 text-center text-xs text-[#8a94ab]">E-posta gelmediyse Spam ya da Gereksiz klasörüne bakın.</p>
    </form>
  );
}
