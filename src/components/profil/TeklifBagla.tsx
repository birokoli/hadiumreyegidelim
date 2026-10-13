"use client";
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

export default function TeklifBagla() {
  const [no, setNo] = useState("");
  const [durum, setDurum] = useState<"" | "busy" | "ok">("");
  const [hata, setHata] = useState("");
  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");
    setDurum("busy");
    const r = await fetch("/api/profil/teklif-bagla", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ no }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setDurum("");
      return setHata(d.error || "Gönderilemedi.");
    }
    setDurum("ok");
  };
  return (
    <form onSubmit={gonder} className="rounded-[24px] border-2 border-dashed border-[var(--h-sky)] bg-white p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-[#14213d]"><HugIcon name="ara" size={18} className="text-[var(--h-blue)]" /> Teklifinizi göremiyor musunuz?</p>
      <p className="mt-1 text-[13px] leading-snug text-[#5b6680]">Teklif başka bir telefon ya da e-postayla hazırlandıysa numarasını yazın; ekibimiz kontrol edip hesabınıza bağlasın.</p>
      {durum === "ok" ? (
        <p className="mt-3 rounded-xl bg-[#e8f3ec] px-4 py-3 text-sm font-bold text-[#2f7d55]">Talebiniz alındı; teklifiniz kısa süre içinde hesabınızda görünecek.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={no} onChange={(e) => setNo(e.target.value.toUpperCase())} placeholder="TKF-2026-0001" className="flex-1 rounded-xl border border-[var(--h-sky)] bg-[var(--h-white)]/60 px-3.5 py-3 text-sm font-semibold tracking-wider text-[#14213d] outline-none focus:border-[var(--h-blue)]" />
          <button type="submit" disabled={durum === "busy" || no.length < 8} className="rounded-xl bg-[var(--h-blue)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Hesabıma bağla</button>
        </div>
      )}
      {hata && <p className="mt-2 text-sm font-bold text-red-700">{hata}</p>}
    </form>
  );
}
