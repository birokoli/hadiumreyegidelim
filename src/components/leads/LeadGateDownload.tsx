"use client";
// Ücretsiz materyali indirmeden önce ad + e-posta ya da telefon ister (12 Ekim, kullanıcı: müşteri havuzu).
// 13 Ekim: e-posta yazana 6 haneli kod gönderilir (uydurma adresler için); kod girilince ya da e-postadaki bağlantıya
// dokunulunca dosya iner. Reklam kaynağı (utm_*, fbclid, gclid) ilk gelişte saklanır ve kayda eklenir.
// Aynı tarayıcıda bir kez kayıt olan tekrar sorulmaz.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

type Props = { source: string; fileUrl: string; fileName: string; className?: string; children: ReactNode; doneNote?: string };
type Step = "form" | "code" | "done";

const UTM_KEY = "lead:utm";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function readUtm(): string {
  try {
    return localStorage.getItem(UTM_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function LeadGateDownload({ source, fileUrl, fileName, className, children, doneNote }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", kvkk: false, marketing: false, website: "" });
  const [leadId, setLeadId] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const key = `lead:${source}`;

  // Reklamdan gelişin izini ilk ziyarette sakla (sonradan başka sayfaya geçse de kayıtla eşleşsin)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const found = UTM_PARAMS.filter((p) => q.get(p)).map((p) => `${p}=${p.endsWith("clid") ? "1" : q.get(p)}`);
      if (found.length && !localStorage.getItem(UTM_KEY)) localStorage.setItem(UTM_KEY, found.join("&").slice(0, 300));
    } catch { /* gizli pencere */ }
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (step === "code") codeInput.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const fail = (msg: string, field = "") => {
    setError(msg);
    setErrorField(field);
  };

  const finish = () => {
    try { localStorage.setItem(key, "1"); } catch { /* gizli pencere */ }
    setStep("done");
    download(fileUrl, fileName);
  };

  const start = () => {
    let known = false;
    try { known = localStorage.getItem(key) === "1"; } catch { /* gizli pencere */ }
    if (known) return download(fileUrl, fileName);
    fail("");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    fail("");
    setSuggestion("");
    if (form.name.trim().length < 2) return fail("Lütfen adınızı yazın.", "name");
    if (!form.email.trim() && !form.phone.trim()) return fail("E-posta adresinizi ya da telefon numaranızı yazın.", "email");
    if (!form.kvkk) return fail("Devam etmek için KVKK bilgilendirmesini onaylayın.", "kvkk");
    setBusy(true);
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source, referrer: document.referrer, utm: readUtm() }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok === false) {
        if (d.suggestion) setSuggestion(d.suggestion);
        return fail(d.error || "Kaydedilemedi; lütfen tekrar deneyin.", d.field || "");
      }
      if (d.step === "code") {
        setLeadId(d.leadId);
        setSentTo(d.email);
        setCode("");
        setResendIn(30);
        setStep("code");
      } else finish();
    } catch {
      fail("Bağlantı kurulamadı; lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    if (value.length !== 6 || busy) return;
    fail("");
    setBusy(true);
    try {
      const r = await fetch("/api/leads/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, code: value }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        setCode("");
        return fail(d.error || "Kod doğrulanamadı.", "code");
      }
      finish();
    } catch {
      fail("Bağlantı kurulamadı; lütfen tekrar deneyin.", "code");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    fail("");
    setResendIn(30);
    const r = await fetch("/api/leads/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, action: "resend" }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (d.verified) return finish();
    if (!r?.ok) fail(d.error || "Kod gönderilemedi; biraz sonra tekrar deneyin.", "code");
  };

  const input = (field: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#14213d] placeholder:text-[#8a94ab] focus:outline-none focus:ring-2 ${
      errorField === field ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-[#b8c9e3] focus:border-[#1d428a] focus:ring-[#1d428a]/15"
    }`;

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

          {step === "done" && (
            <div className="py-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/70">Teşekkürler</p>
              <h2 className="mt-2 text-2xl font-bold text-[#1d428a]">İndirme başladı</h2>
              <p className="mt-3 text-sm text-[#5b6680]">İnmediyse <a href={fileUrl} download={fileName} className="font-semibold text-[#1d428a] underline">buraya tıklayın</a>. {doneNote}</p>
              <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-[#1d428a] px-6 py-3 text-sm font-bold text-white">Kapat</button>
            </div>
          )}

          {step === "code" && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/70">Son adım</p>
              <h2 className="mt-2 pr-8 text-2xl font-bold leading-tight text-[#1d428a]">E-postanızı doğrulayın</h2>
              <p className="mt-2 text-sm text-[#5b6680]">
                <b className="text-[#14213d]">{sentTo}</b>{" "}adresine 6 haneli bir kod gönderdik. Kodu yazın ya da e-postadaki &quot;Kitapçığı indir&quot; düğmesine dokunun.
              </p>
              <input
                ref={codeInput}
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (v.length === 6) verify(v);
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
                aria-label="Doğrulama kodu"
                className={`${input("code")} mt-5 text-center font-mono text-2xl tracking-[0.5em]`}
              />
              {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button type="button" onClick={() => verify(code)} disabled={busy || code.length !== 6} className="mt-4 w-full rounded-xl bg-[#1d428a] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#12295a] disabled:opacity-50">
                {busy ? "Kontrol ediliyor…" : "Doğrula ve indir"}
              </button>
              <p className="mt-4 text-xs text-[#5b6680]">E-posta gelmediyse Spam ya da Gereksiz klasörüne bakın.</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <button type="button" onClick={resend} disabled={resendIn > 0} className="font-semibold text-[#1d428a] underline-offset-4 hover:underline disabled:text-[#8a94ab] disabled:no-underline">
                  {resendIn > 0 ? `Yeni kod (${resendIn} sn)` : "Kodu tekrar gönder"}
                </button>
                <button type="button" onClick={() => { setStep("form"); fail(""); }} className="text-[#5b6680] underline-offset-4 hover:underline">E-postayı değiştir</button>
              </div>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={submit} noValidate>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#1d428a]/70">Ücretsiz · PDF</p>
              <h2 className="mt-2 pr-8 text-2xl font-bold leading-tight text-[#1d428a]">Kitapçığınızı hemen indirin</h2>
              <p className="mt-2 text-sm text-[#5b6680]">Adınızı ve size ulaşabileceğimiz bir iletişim bilgisini yazın.</p>
              <div className="mt-5 space-y-3">
                <input className={input("name")} placeholder="Adınız soyadınız" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className={input("email")} type="email" inputMode="email" placeholder="E-posta adresiniz" autoComplete="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setSuggestion(""); }} />
                {suggestion && (
                  <button type="button" onClick={() => { setForm({ ...form, email: suggestion }); setSuggestion(""); fail(""); }} className="-mt-1 text-left text-sm text-[#1d428a]">
                    <span className="font-semibold underline underline-offset-4">{suggestion}</span> olarak düzelt
                  </button>
                )}
                <input className={input("phone")} type="tel" inputMode="tel" placeholder="Telefon / WhatsApp (05xx xxx xx xx)" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <p className="text-xs text-[#5b6680]">En az biri yeterli. E-posta yazarsanız adresinize kısa bir doğrulama kodu göndeririz.</p>
                {/* bal küpü: insanlar görmez, botlar doldurur */}
                <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <label className={`mt-4 flex items-start gap-2.5 text-[13px] leading-snug ${errorField === "kvkk" ? "text-red-700" : "text-[#14213d]"}`}>
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1d428a]" checked={form.kvkk} onChange={(e) => setForm({ ...form, kvkk: e.target.checked })} />
                <span><Link href="/kvkk" target="_blank" className="font-semibold text-[#1d428a] underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum; kişisel verilerimin bu kapsamda işlenmesine ilişkin bilgilendirildim.</span>
              </label>
              <label className="mt-2.5 flex items-start gap-2.5 text-[13px] leading-snug text-[#5b6680]">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1d428a]" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} />
                <span>Umre programları ve bilgilendirmeler için e-posta, SMS ve WhatsApp ile benimle iletişime geçilmesine izin veriyorum. (İsteğe bağlı)</span>
              </label>
              {error && !suggestion && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {suggestion && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
              <button type="submit" disabled={busy} className="mt-5 w-full rounded-xl bg-[#1d428a] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#12295a] disabled:opacity-60">
                {busy ? "Kontrol ediliyor…" : "Kitapçığı indir"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
