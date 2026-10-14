"use client";
// Hesap → telefon ekle/değiştir (Profil 2, 14 Ekim).
import { useState } from "react";

export default function TelefonFormu({ phone }: { phone: string | null }) {
  const [deger, setDeger] = useState(phone);
  const [acik, setAcik] = useState(false);
  const [v, setV] = useState(phone ?? "");
  const [busy, setBusy] = useState(false);
  const [hata, setHata] = useState("");
  const kaydet = async () => {
    setBusy(true);
    setHata("");
    const r = await fetch("/api/profil/telefon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: v }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setHata(d.error || "Kaydedilemedi.");
    setDeger(d.phone);
    setAcik(false);
  };
  if (!acik) {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-[#14213d]">{deger || "Eklenmemiş"}</span>
        <button type="button" onClick={() => setAcik(true)} className="text-sm font-bold text-[var(--h-blue)] underline-offset-4 hover:underline">{deger ? "Değiştir" : "Ekle"}</button>
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <input value={v} onChange={(e) => setV(e.target.value)} inputMode="tel" placeholder="05xx xxx xx xx" className="w-44 rounded-xl border border-[var(--h-sky)] px-3 py-2 text-sm outline-none focus:border-[var(--h-blue)]" />
      <button type="button" disabled={busy} onClick={kaydet} className="rounded-xl bg-[var(--h-blue)] px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50">Kaydet</button>
      <button type="button" onClick={() => setAcik(false)} className="text-sm text-[#5b6680]">Vazgeç</button>
      {hata && <span className="w-full text-xs font-bold text-red-700">{hata}</span>}
    </span>
  );
}
