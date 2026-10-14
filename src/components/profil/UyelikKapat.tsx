"use client";
// Üyeliği kapat (Profil 2, 14 Ekim): duyuru e-postasındaki "üyeliğinizi kapatabilirsiniz" bağlantısı buraya gelir.
import { useState } from "react";

export default function UyelikKapat() {
  const [onay, setOnay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hata, setHata] = useState("");
  const kapat = async () => {
    setBusy(true);
    const r = await fetch("/api/profil/hesap-kapat", { method: "POST" });
    setBusy(false);
    if (!r.ok) return setHata("Şu an kapatılamadı; WhatsApp'tan yazın.");
    window.location.href = "/?uyelik=kapandi";
  };
  if (!onay) return <button type="button" onClick={() => setOnay(true)} className="text-sm font-bold text-red-700 underline-offset-4 hover:underline">Üyeliğimi kapat</button>;
  return (
    <div className="rounded-2xl bg-red-50 p-4">
      <p className="text-sm text-red-800">Emin misiniz? Bu işlem geri alınamaz.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={busy} onClick={kapat} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Kapatılıyor…" : "Evet, kapat"}</button>
        <button type="button" onClick={() => setOnay(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-[#5b6680]">Vazgeç</button>
      </div>
      {hata && <p className="mt-2 text-xs font-bold text-red-700">{hata}</p>}
    </div>
  );
}
