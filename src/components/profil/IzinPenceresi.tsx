"use client";
// Tek seferlik iletişim izni penceresi (Profil 2, 14 Ekim). Üye profili ilk açtığında çıkar; "Şimdi değil" de cevap sayılır,
// tekrar sorulmaz (Hesap → İletişim tercihlerim'den her zaman değiştirilebilir). Kanallar ayrı ayrı seçilir.
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";
import { IZIN_METNI } from "@/lib/uye-kampanya/ortak";

export default function IzinPenceresi({ ad, telefonVar }: { ad: string; telefonVar: boolean }) {
  const [acik, setAcik] = useState(true);
  const [eposta, setEposta] = useState(true);
  const [wa, setWa] = useState(telefonVar);
  const [busy, setBusy] = useState(false);

  const gonder = async (izin: boolean) => {
    setBusy(true);
    await fetch("/api/profil/tercih", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ izinEposta: izin && eposta, izinWhatsapp: izin && wa, soruldu: true, kaynak: "pencere" }),
    }).catch(() => null);
    setBusy(false);
    setAcik(false);
  };

  if (!acik) return null;
  const kutu = (aktif: boolean, set: (v: boolean) => void, ikon: "eposta" | "mesaj", baslik: string, alt: string) => (
    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3.5 ring-1 transition ${aktif ? "bg-[var(--h-white)] ring-[var(--h-blue)]/40" : "bg-white ring-[var(--h-sky)]"}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--h-blue)] ring-1 ring-[var(--h-sky)]"><HugIcon name={ikon} size={20} /></span>
      <span className="flex-1"><span className="block text-sm font-bold text-[#14213d]">{baslik}</span><span className="block text-xs text-[#5b6680]">{alt}</span></span>
      <input type="checkbox" className="h-5 w-5 accent-[var(--h-blue)]" checked={aktif} onChange={(e) => set(e.target.checked)} />
    </label>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#12295a]/50 p-3 backdrop-blur-[2px] md:items-center" role="dialog" aria-modal="true" aria-labelledby="izin-baslik">
      <div className="anim-acil w-full max-w-md overflow-hidden rounded-[28px] bg-white">
        <div className="bg-deep on-dark relative overflow-hidden px-6 pb-5 pt-6 text-white">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-6 right-3 select-none text-[5.5rem] leading-none text-white/[0.07]">مرحبا</span>
          <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-sand)]">Size özel</p>
          <h2 id="izin-baslik" className="relative mt-1.5 text-[22px] font-bold leading-snug">{ad}, üyelere ayrılan tarihleri <em>size haber verelim mi?</em></h2>
        </div>
        <div className="space-y-2.5 p-5">
          <p className="text-sm leading-relaxed text-[#3d4a66]">Üyelerimize özel umre tarihleri ve fiyatlar açıldığında, seçtiğiniz kanaldan bir kez haber veririz. İstediğiniz zaman kapatabilirsiniz.</p>
          {kutu(eposta, setEposta, "eposta", "E-posta ile", "Yeni tarihler ve üyelere özel fiyatlar")}
          {kutu(wa, setWa, "mesaj", "WhatsApp ile", telefonVar ? "Kısa bir mesaj, yalnızca yeni tarih açılınca" : "Telefonunuzu Hesap bölümünden ekleyin")}
          <p className="text-[11px] leading-snug text-[#8a94ab]">{IZIN_METNI}</p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
            <button type="button" disabled={busy || (!eposta && !wa)} onClick={() => gonder(true)} className="flex-1 rounded-2xl bg-[var(--h-blue)] px-5 py-3.5 text-[15px] font-bold text-white transition hover:bg-[var(--h-blue-deep)] disabled:opacity-50">
              {busy ? "Kaydediliyor…" : "Evet, haber verin"}
            </button>
            <button type="button" disabled={busy} onClick={() => gonder(false)} className="rounded-2xl px-5 py-3.5 text-sm font-bold text-[#5b6680] hover:bg-[var(--h-white)]">Şimdi değil</button>
          </div>
        </div>
      </div>
    </div>
  );
}
