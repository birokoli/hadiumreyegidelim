"use client";
// Hesap → İletişim tercihlerim (Profil 2, 14 Ekim): e-posta ve WhatsApp izni ayrı ayrı; her değişiklik tarihiyle kaydedilir.
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

export default function IletisimTercihleri({ eposta, whatsapp, tarih, telefonVar }: { eposta: boolean; whatsapp: boolean; tarih: string | null; telefonVar: boolean }) {
  const [t, setT] = useState({ eposta, whatsapp, tarih });
  const [busy, setBusy] = useState(false);

  const degistir = async (alan: "eposta" | "whatsapp", v: boolean) => {
    setBusy(true);
    const r = await fetch("/api/profil/tercih", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [alan === "eposta" ? "izinEposta" : "izinWhatsapp"]: v, kaynak: "hesap" }),
    });
    setBusy(false);
    if (r.ok) {
      const d = await r.json();
      setT({ eposta: d.tercih.izinEposta, whatsapp: d.tercih.izinWhatsapp, tarih: d.tercih.izinTarihi });
    }
  };

  const satir = (alan: "eposta" | "whatsapp", ikon: "eposta" | "mesaj", ad: string, alt: string, acik: boolean) => (
    <div className="flex items-center gap-4 py-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name={ikon} size={20} /></span>
      <span className="flex-1"><span className="block text-sm font-bold text-[#14213d]">{ad}</span><span className="block text-xs text-[#5b6680]">{alt}</span></span>
      <button
        type="button"
        role="switch"
        aria-checked={acik}
        aria-label={ad}
        disabled={busy}
        onClick={() => degistir(alan, !acik)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${acik ? "bg-[var(--h-blue)]" : "bg-[#d7e0f0]"}`}
      >
        <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${acik ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/50" id="iletisim">
      <p className="font-bold text-[#14213d]">İletişim tercihlerim</p>
      <p className="mt-1 text-sm text-[#5b6680]">Üyelere özel tarih ve fiyatlar açıldığında nereden haber verelim?</p>
      <div className="mt-2 divide-y divide-[var(--h-sky)]/50">
        {satir("eposta", "eposta", "E-posta", "Yeni tarihler ve üyelere özel fiyatlar", t.eposta)}
        {satir("whatsapp", "mesaj", "WhatsApp", telefonVar ? "Yalnızca yeni tarih açıldığında kısa bir mesaj" : "Önce telefon numaranızı ekletin", t.whatsapp)}
      </div>
      {t.tarih && <p className="mt-2 text-[11px] text-[#8a94ab]">Son değişiklik: {new Date(t.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>}
    </div>
  );
}
