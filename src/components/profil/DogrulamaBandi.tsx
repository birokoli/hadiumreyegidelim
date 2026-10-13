"use client";
// Profil üstünde: e-posta doğrulanmadıysa kod iste ve doğrula. Doğrulanan hesaba umre dosyası ve teklifler kendiliğinden bağlanır.
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

export default function DogrulamaBandi({ email }: { email: string }) {
  const [adim, setAdim] = useState<"ilk" | "kod" | "tamam">("ilk");
  const [code, setCode] = useState("");
  const [hata, setHata] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    setHata("");
    try {
      const r = await fetch("/api/profil/dogrula", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setHata(d.error || "İşlem yapılamadı."), null;
      return d;
    } finally {
      setBusy(false);
    }
  };

  if (adim === "tamam") {
    return (
      <div className="flex items-center gap-3 rounded-[22px] bg-[#e8f3ec] p-4 text-sm font-bold text-[#2f7d55]">
        <HugIcon name="onay" size={20} /> E-postanız doğrulandı. Umre dosyanız ve teklifleriniz hesabınıza bağlanıyor…
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-[#fbf4e1] p-4 ring-1 ring-[var(--h-sand)] md:flex-row md:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#b8862f]"><HugIcon name="eposta" size={20} /></span>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#5a4612]">E-postanızı doğrulayın</p>
        <p className="text-[13px] text-[#8a6a1c]">{adim === "ilk" ? `Doğrulanan hesaba umre dosyanız ve teklifleriniz kendiliğinden bağlanır. Kodu ${email} adresine göndereceğiz.` : `${email} adresine gelen 6 haneli kodu yazın.`}</p>
        {hata && <p className="mt-1 text-[13px] font-bold text-red-700">{hata}</p>}
      </div>
      {adim === "ilk" ? (
        <button type="button" disabled={busy} onClick={async () => { if (await post({ action: "gonder" })) setAdim("kod"); }} className="rounded-xl bg-[var(--h-blue)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? "Gönderiliyor…" : "Kod gönder"}
        </button>
      ) : (
        <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); const d = await post({ code }); if (d) { setAdim("tamam"); setTimeout(() => location.reload(), 900); } }}>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" aria-label="Doğrulama kodu" className="w-32 rounded-xl border border-[var(--h-sky)] bg-white px-3 py-2.5 text-center font-bold tracking-[0.3em] text-[var(--h-blue)] outline-none focus:border-[var(--h-blue)]" />
          <button type="submit" disabled={busy || code.length !== 6} className="rounded-xl bg-[var(--h-blue)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Doğrula</button>
        </form>
      )}
    </div>
  );
}
