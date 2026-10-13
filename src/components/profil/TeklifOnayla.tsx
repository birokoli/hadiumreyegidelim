"use client";
// Teklif sayfasındaki "Onaylıyorum" düğmesi (giriş gerekmez; bağlantı müşteriye özel).
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

export default function TeklifOnayla({ token, onaylandi }: { token: string; onaylandi: boolean }) {
  const [ok, setOk] = useState(onaylandi);
  const [busy, setBusy] = useState(false);
  const [hata, setHata] = useState("");
  if (ok)
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-[#e8f3ec] px-5 py-4 text-[15px] font-bold text-[#2f7d55]">
        <HugIcon name="onay" size={20} /> Teklifiniz onaylandı. Ekibimiz ödeme ve sonraki adımlar için size WhatsApp&apos;tan yazacak.
      </p>
    );
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm("Teklifi onaylıyor musunuz? Ekibimiz ödeme ve sonraki adımlar için sizinle iletişime geçecek.")) return;
          setBusy(true);
          setHata("");
          const r = await fetch("/api/satis/onay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
          const d = await r.json().catch(() => ({}));
          setBusy(false);
          if (!r.ok) return setHata(d.error || "Onaylanamadı; lütfen WhatsApp'tan yazın.");
          setOk(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--h-blue)] px-6 py-4 text-[16px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(29,66,138,0.8)] transition hover:bg-[var(--h-blue-deep)] disabled:opacity-60"
      >
        <HugIcon name="onay" size={20} className="text-[var(--h-sand)]" /> {busy ? "Gönderiliyor…" : "Teklifi onaylıyorum"}
      </button>
      {hata && <p className="mt-2 text-sm font-bold text-red-700">{hata}</p>}
    </div>
  );
}
