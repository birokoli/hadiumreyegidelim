"use client";
// Müşteri uçuş bilgisini dosyasına ekler; boşsa "sizden beklenen" uyarısı olarak görünür.
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

export default function UcusFormu({ no, gidis, donus }: { no: string; gidis?: string; donus?: string }) {
  const [acik, setAcik] = useState(!gidis);
  const [f, setF] = useState({ ucusGidis: gidis ?? "", ucusDonus: donus ?? "" });
  const [kayitli, setKayitli] = useState({ gidis: gidis ?? "", donus: donus ?? "" });
  const [busy, setBusy] = useState(false);
  const [hata, setHata] = useState("");

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setHata("");
    const r = await fetch("/api/profil/ucus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ no, ...f }) });
    setBusy(false);
    if (!r.ok) return setHata("Kaydedilemedi; tekrar deneyin.");
    setKayitli({ gidis: f.ucusGidis, donus: f.ucusDonus });
    setAcik(false);
  };

  const inp = "w-full rounded-xl border border-[var(--h-sky)] bg-white px-3.5 py-3 text-sm text-[#14213d] outline-none placeholder:text-[#8a94ab] focus:border-[var(--h-blue)]";
  if (!acik && kayitli.gidis) {
    return (
      <div className="flex items-center gap-4 rounded-[24px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name="ucak" size={22} /></span>
        <div className="flex-1 text-sm"><p className="font-bold text-[#14213d]">Uçuş bilgileriniz</p><p className="text-[#5b6680]">Gidiş: {kayitli.gidis}{kayitli.donus && ` · Dönüş: ${kayitli.donus}`}</p></div>
        <button type="button" onClick={() => setAcik(true)} className="text-sm font-bold text-[var(--h-blue)] underline-offset-4 hover:underline">Düzenle</button>
      </div>
    );
  }
  return (
    <form onSubmit={kaydet} className="rounded-[24px] bg-[#fbf4e1] p-5 ring-1 ring-[var(--h-sand)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--h-blue)]"><HugIcon name="ucak" size={22} /></span>
        <div><p className="text-sm font-bold text-[#5a4612]">Uçuş bilgilerinizi ekleyin</p><p className="text-[13px] text-[#8a6a1c]">Karşılama saatiniz buna göre ayarlanır.</p></div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <input className={inp} value={f.ucusGidis} onChange={(e) => setF({ ...f, ucusGidis: e.target.value })} placeholder="Gidiş: TK 98 · 14 Kas · 09:40 → 13:05" />
        <input className={inp} value={f.ucusDonus} onChange={(e) => setF({ ...f, ucusDonus: e.target.value })} placeholder="Dönüş (biliyorsanız)" />
      </div>
      {hata && <p className="mt-2 text-sm font-bold text-red-700">{hata}</p>}
      <button type="submit" disabled={busy || !f.ucusGidis.trim()} className="mt-3 rounded-xl bg-[var(--h-blue)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
