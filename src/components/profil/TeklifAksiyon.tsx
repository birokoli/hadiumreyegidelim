"use client";
// Teklif kartındaki düğmeler: onayla, WhatsApp'tan sor, PDF.
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

export default function TeklifAksiyon({ id, no, wa }: { id: string; no: string; wa: string }) {
  const [durum, setDurum] = useState<"" | "busy" | "ok">("");
  const [hata, setHata] = useState("");
  const onayla = async () => {
    if (!confirm(`${no} numaralı teklifi onaylıyor musunuz? Satış ekibimiz ödeme ve sonraki adımlar için sizinle iletişime geçecek.`)) return;
    setDurum("busy");
    const r = await fetch("/api/profil/teklif", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setDurum("");
      return setHata(d.error || "Onaylanamadı.");
    }
    setDurum("ok");
  };
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(`Merhaba, ${no} numaralı teklifim hakkında bilgi almak istiyorum.`)}`;
  if (durum === "ok") return <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#e8f3ec] px-4 py-3 text-sm font-bold text-[#2f7d55]"><HugIcon name="onay" size={18} /> Onayınız alındı; ekibimiz kısa süre içinde size ulaşacak.</p>;
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onayla} disabled={durum === "busy"} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--h-blue)] px-4 py-3 text-sm font-bold text-white disabled:opacity-60 md:flex-none">
          <HugIcon name="onay" size={17} className="text-[var(--h-sand)]" /> {durum === "busy" ? "Gönderiliyor…" : "Onaylıyorum"}
        </button>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-[var(--h-sky)] px-4 py-3 text-sm font-bold text-[var(--h-blue)]"><HugIcon name="mesaj" size={16} />Sor</a>
        <a href={`/api/profil/teklif/${id}/pdf`} className="rounded-xl border border-[var(--h-sky)] px-4 py-3 text-sm font-bold text-[var(--h-blue)]">PDF</a>
      </div>
      {hata && <p className="mt-2 text-sm font-bold text-red-700">{hata}</p>}
    </div>
  );
}
