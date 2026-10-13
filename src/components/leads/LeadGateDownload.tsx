"use client";
// Ücretsiz materyali indirmeden önce ad + e-posta ya da telefon ister (12 Ekim, kullanıcı: müşteri havuzu).
// 13 Ekim: e-posta yazana 6 haneli kod gönderilir (uydurma adresler için); kod girilince ya da e-postadaki bağlantıya
// dokunulunca dosya iner. Reklam kaynağı (utm_*, fbclid, gclid) ilk gelişte saklanır ve kayda eklenir.
// Tasarım site kimliğiyle aynı (13 Ekim, kullanıcı): .home-v2 sayfalarında açılır; lacivert başlık, Arapça hat, kitap
// kapağı, kendi ikon setimiz (HugIcon), Cairo + serif italik vurgu. Aynı tarayıcıda bir kez kayıt olan tekrar sorulmaz.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import HugIcon from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";

type Props = {
  source: string;
  fileUrl: string;
  fileName: string;
  title: string; // "Sa'y El Kitabı"
  cover: string; // kapak görseli
  hat: string; // başlıktaki Arapça hat: طواف / سعي
  className?: string;
  children: ReactNode;
  doneNote?: string;
};
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

const HEAD: Record<Step, { kicker: string; title: string }> = {
  form: { kicker: "Ücretsiz PDF · 19 sayfa", title: "Kitapçığınız *hazır*" },
  code: { kicker: "Son adım", title: "E-postanızı *doğrulayın*" },
  done: { kicker: "Teşekkürler", title: "Hayırlı *umreler*" },
};

export default function LeadGateDownload({ source, fileUrl, fileName, title, cover, hat, className, children, doneNote }: Props) {
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
  const [codeFocus, setCodeFocus] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [shareHref, setShareHref] = useState("");
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
    setShareHref(`https://wa.me/?text=${encodeURIComponent(`${title}: okunuşu ve anlamıyla dualar, ücretsiz PDF. ${window.location.origin}${window.location.pathname}`)}`);
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

  const field = (name: string) =>
    `w-full rounded-2xl border bg-[var(--h-white)]/60 py-3.5 pl-12 pr-4 text-[15px] text-[#14213d] placeholder:text-[#7d88a3] transition focus:bg-white focus:outline-none focus:ring-4 ${
      errorField === name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[var(--h-sky)] focus:border-[var(--h-blue)] focus:ring-[var(--h-sky)]/40"
    }`;
  const fieldIcon = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--h-blue)]/55";
  const head = HEAD[step];

  return (
    <>
      <button type="button" onClick={start} className={className}>{children}</button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === dialog.current) setOpen(false); }}
        className="m-auto w-[min(94vw,460px)] overflow-visible bg-transparent p-0 text-left backdrop:bg-[#12295a]/70 backdrop:backdrop-blur-sm"
      >
        <div className="max-h-[92vh] overflow-y-auto rounded-[28px] bg-white shadow-[0_40px_80px_-20px_rgba(18,41,90,0.55)]">
          {/* Başlık: lacivert, Arapça hat ve kitap kapağı */}
          <div className="bg-deep on-dark relative overflow-hidden px-6 pb-6 pt-6 text-white md:px-7">
            <span aria-hidden className="hat pointer-events-none absolute -bottom-10 -left-2 select-none text-[7rem] leading-none text-white/[0.06]">{hat}</span>
            <Image src={cover} alt="" width={160} height={226} className="pointer-events-none absolute -bottom-7 right-14 w-[80px] rotate-6 rounded-md shadow-[0_18px_30px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/15" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white/80 transition hover:bg-white/20 hover:text-white">✕</button>
            <div className="relative pr-24 md:pr-28">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--h-sand)] md:text-[11px] md:tracking-[0.22em]">
                <HugIcon name={step === "done" ? "onay" : "rehber"} size={15} /> {head.kicker}
              </p>
              <h2 className="mt-2 text-[24px] font-bold leading-tight md:text-[26px]"><Accent text={head.title} /></h2>
              <p className="mt-1 text-sm text-white/75">{title}</p>
            </div>
          </div>

          <div className="px-6 pb-6 pt-6 md:px-7">
            {step === "form" && (
              <form onSubmit={submit} noValidate>
                <div className="space-y-3">
                  <label className="relative block">
                    <span className="sr-only">Adınız soyadınız</span>
                    <HugIcon name="bireysel" size={20} className={fieldIcon} />
                    <input className={field("name")} placeholder="Adınız soyadınız" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label className="relative block">
                    <span className="sr-only">E-posta adresiniz</span>
                    <HugIcon name="eposta" size={20} className={fieldIcon} />
                    <input className={field("email")} type="email" inputMode="email" placeholder="E-posta adresiniz" autoComplete="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setSuggestion(""); }} />
                  </label>
                  {suggestion && (
                    <button type="button" onClick={() => { setForm({ ...form, email: suggestion }); setSuggestion(""); fail(""); }} className="flex w-full items-center gap-2 rounded-2xl bg-[#fbf4e1] px-4 py-2.5 text-left text-sm text-[#5a4612] ring-1 ring-[var(--h-sand)]">
                      <HugIcon name="bilgi" size={16} className="text-[#b8862f]" />
                      <span>Bunu mu demek istediniz: <b className="underline underline-offset-4">{suggestion}</b></span>
                    </button>
                  )}
                  <label className="relative block">
                    <span className="sr-only">Telefon veya WhatsApp numaranız</span>
                    <HugIcon name="telefon" size={20} className={fieldIcon} />
                    <input className={field("phone")} type="tel" inputMode="tel" placeholder="Telefon / WhatsApp (05xx xxx xx xx)" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </label>
                  <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-[#5b6680]">
                    <HugIcon name="bilgi" size={14} className="mt-0.5 text-[var(--h-blue)]/50" />
                    En az biri yeterli. E-posta yazarsanız adresinize kısa bir doğrulama kodu göndeririz.
                  </p>
                  {/* bal küpü: insanlar görmez, botlar doldurur */}
                  <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>

                <div className="mt-5 space-y-2 rounded-2xl bg-[var(--h-white)] p-4">
                  <label className={`flex cursor-pointer items-start gap-3 text-[13px] leading-snug ${errorField === "kvkk" ? "text-red-700" : "text-[#14213d]"}`}>
                    <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--h-blue)]" checked={form.kvkk} onChange={(e) => setForm({ ...form, kvkk: e.target.checked })} />
                    <span><Link href="/kvkk" target="_blank" className="font-bold text-[var(--h-blue)] underline underline-offset-2">KVKK Aydınlatma Metni</Link>&apos;ni okudum; kişisel verilerimin bu kapsamda işlenmesine ilişkin bilgilendirildim.</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-[#5b6680]">
                    <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--h-blue)]" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} />
                    <span>Umre programları ve bilgilendirmeler için e-posta, SMS ve WhatsApp ile benimle iletişime geçilmesine izin veriyorum. <span className="text-[#8a94ab]">(İsteğe bağlı)</span></span>
                  </label>
                </div>

                {error && !suggestion && (
                  <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <HugIcon name="bilgi" size={16} className="mt-0.5" /> {error}
                  </p>
                )}
                <button type="submit" disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--h-blue)] px-6 py-4 text-[15px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(29,66,138,0.8)] transition hover:bg-[var(--h-blue-deep)] disabled:opacity-60">
                  <HugIcon name="rehber" size={20} className="text-[var(--h-sand)]" />
                  {busy ? "Kontrol ediliyor…" : "Kitapçığı indir"}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#8a94ab]">
                  <HugIcon name="guven" size={13} /> Bilgileriniz yalnızca Hadi Umreye Gidelim&apos;de kalır.
                </p>
              </form>
            )}

            {step === "code" && (
              <div>
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--h-white)] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--h-blue)] text-[var(--h-sand)]">
                    <HugIcon name="eposta" size={22} />
                  </span>
                  <p className="text-sm leading-snug text-[#3d4a66]">6 haneli kodu gönderdik:<br /><b className="break-all text-[#14213d]">{sentTo}</b></p>
                </div>

                {/* 6 kutu; asıl giriş kutuların üstünde görünmez durur (yapıştırma ve SMS/OTP doldurma çalışsın) */}
                <div className="relative mt-5" onClick={() => codeInput.current?.focus()}>
                  <div className="grid grid-cols-6 gap-2" aria-hidden>
                    {Array.from({ length: 6 }, (_, i) => {
                      const active = codeFocus && i === Math.min(code.length, 5);
                      return (
                        <span key={i} className={`flex h-14 items-center justify-center rounded-2xl border-2 text-2xl font-bold text-[var(--h-blue)] transition ${
                          errorField === "code" ? "border-red-300 bg-red-50/50" : active ? "border-[var(--h-blue)] bg-white ring-4 ring-[var(--h-sky)]/40" : code[i] ? "border-[var(--h-sky)] bg-white" : "border-[var(--h-sky)]/70 bg-[var(--h-white)]/60"
                        }`}>
                          {code[i] ?? ""}
                        </span>
                      );
                    })}
                  </div>
                  <input
                    ref={codeInput}
                    value={code}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(v);
                      if (errorField === "code") fail("");
                      if (v.length === 6) verify(v);
                    }}
                    onFocus={() => setCodeFocus(true)}
                    onBlur={() => setCodeFocus(false)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Doğrulama kodu"
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                </div>

                {error && (
                  <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <HugIcon name="bilgi" size={16} className="mt-0.5" /> {error}
                  </p>
                )}
                <button type="button" onClick={() => verify(code)} disabled={busy || code.length !== 6} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--h-blue)] px-6 py-4 text-[15px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(29,66,138,0.8)] transition hover:bg-[var(--h-blue-deep)] disabled:opacity-50">
                  <HugIcon name="onay" size={20} className="text-[var(--h-sand)]" />
                  {busy ? "Kontrol ediliyor…" : "Doğrula ve indir"}
                </button>
                <p className="mt-4 text-center text-xs text-[#5b6680]">E-posta gelmediyse Spam ya da Gereksiz klasörüne bakın. E-postadaki &quot;Kitapçığı indir&quot; düğmesi de çalışır.</p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--h-sky)]/50 pt-3 text-sm">
                  <button type="button" onClick={resend} disabled={resendIn > 0} className="font-bold text-[var(--h-blue)] underline-offset-4 hover:underline disabled:font-semibold disabled:text-[#8a94ab] disabled:no-underline">
                    {resendIn > 0 ? `Yeni kod ${resendIn} sn sonra` : "Kodu tekrar gönder"}
                  </button>
                  <button type="button" onClick={() => { setStep("form"); fail(""); }} className="text-[#5b6680] underline-offset-4 hover:underline">E-postayı değiştir</button>
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--h-white)] text-[var(--h-blue)] ring-8 ring-[var(--h-white)]/50">
                  <HugIcon name="onay" size={32} />
                </span>
                <p className="mt-4 text-[15px] font-bold text-[#14213d]">İndirme başladı</p>
                <p className="mt-1 text-sm text-[#5b6680]">İnmediyse <a href={fileUrl} download={fileName} className="font-bold text-[var(--h-blue)] underline underline-offset-2">buraya dokunun</a>.</p>
                {doneNote && <p className="mx-auto mt-5 max-w-xs font-['Noto_Serif',Georgia,serif] text-[17px] italic leading-snug text-[var(--h-blue)]">{doneNote}</p>}
                <div className="mt-6 grid gap-2.5">
                  <Link href="/bireysel-umre" className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--h-sand)] px-5 py-3.5 text-sm font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                    <HugIcon name="takvim" size={18} /> Umrenizi kendi tarihinizde planlayın
                  </Link>
                  {shareHref && (
                    <a href={shareHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--h-sky)] px-5 py-3.5 text-sm font-bold text-[var(--h-blue)] transition hover:border-[var(--h-blue)]">
                      <HugIcon name="mesaj" size={18} /> Umreye gidecek birine gönderin
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
