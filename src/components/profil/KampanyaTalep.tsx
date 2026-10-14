"use client";
// Kampanyadan teklif iste (Profil 2, 14 Ekim): kişi sayısı, telefon yoksa telefon, isteğe bağlı not → satış masasında dosya.
import { useState } from "react";
import { useRouter } from "next/navigation";
import HugIcon from "@/components/icons/HugIcon";

export default function KampanyaTalep({ kampanyaId, kalan, telefonVar, varsayilanKisi }: { kampanyaId: string; kalan: number | null; telefonVar: boolean; varsayilanKisi: number }) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [kisi, setKisi] = useState(Math.min(varsayilanKisi, kalan ?? 20));
  const [tel, setTel] = useState("");
  const [not, setNot] = useState("");
  const [busy, setBusy] = useState(false);
  const [hata, setHata] = useState("");
  const ust = Math.min(20, kalan ?? 20);

  const gonder = async () => {
    setBusy(true);
    setHata("");
    if (!telefonVar) {
      const t = await fetch("/api/profil/telefon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: tel }) });
      if (!t.ok) {
        setBusy(false);
        return setHata((await t.json().catch(() => ({}))).error || "Telefon kaydedilemedi.");
      }
    }
    const r = await fetch("/api/profil/kampanya", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kampanyaId, kisi, not }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setHata(d.error || "Talep gönderilemedi; tekrar deneyin.");
    router.refresh();
  };

  if (!acik) {
    return (
      <button type="button" onClick={() => setAcik(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--h-blue)] py-3.5 text-[15px] font-bold text-white transition hover:bg-[var(--h-blue-deep)]">
        <HugIcon name="mesaj" size={18} className="text-[var(--h-sand)]" /> Bu tarih için teklif iste
      </button>
    );
  }
  return (
    <div className="anim-acil space-y-3 rounded-2xl bg-[var(--h-white)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[#14213d]">Kaç kişi?</span>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Azalt" onClick={() => setKisi(Math.max(1, kisi - 1))} className="h-9 w-9 rounded-xl bg-white text-lg font-bold text-[var(--h-blue)] ring-1 ring-[var(--h-sky)]">−</button>
          <span className="w-8 text-center text-base font-bold">{kisi}</span>
          <button type="button" aria-label="Artır" onClick={() => setKisi(Math.min(ust, kisi + 1))} className="h-9 w-9 rounded-xl bg-white text-lg font-bold text-[var(--h-blue)] ring-1 ring-[var(--h-sky)]">+</button>
        </div>
      </div>
      {!telefonVar && (
        <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" placeholder="WhatsApp numaranız (05xx xxx xx xx)" className="w-full rounded-xl border border-[var(--h-sky)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--h-blue)]" />
      )}
      <input value={not} onChange={(e) => setNot(e.target.value)} maxLength={300} placeholder="Notunuz (isteğe bağlı): oda tipi, çocuk yaşları…" className="w-full rounded-xl border border-[var(--h-sky)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--h-blue)]" />
      {hata && <p className="text-sm font-bold text-red-700">{hata}</p>}
      <button type="button" disabled={busy || (!telefonVar && tel.replace(/\D/g, "").length < 10)} onClick={gonder} className="w-full rounded-2xl bg-[var(--h-blue)] py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
        {busy ? "Gönderiliyor…" : "Teklif iste"}
      </button>
      <p className="text-center text-[11px] text-[#8a94ab]">Ödeme şimdi alınmaz; ekibimiz teklifi WhatsApp&apos;tan gönderir.</p>
    </div>
  );
}
