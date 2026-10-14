"use client";
// Umre planım (Profil 2, 14 Ekim): ne zaman, kaç kişi, kimle, hangi otel. "Size Özel"de dönemi tutan kampanyalar öne çıkar;
// admin'de üyeler bu cevaplara göre süzülür.
import { useState } from "react";
import { useRouter } from "next/navigation";
import HugIcon from "@/components/icons/HugIcon";
import { donemLabel, KIMLE, OTEL, type UyeTercih } from "@/lib/uye-kampanya/ortak";

type Plan = Pick<UyeTercih, "planDonem" | "planKisi" | "planKimle" | "planOtel">;

export default function UmrePlanim({ plan, donemler }: { plan: Plan; donemler: { value: string; label: string }[] }) {
  const router = useRouter();
  const dolu = !!plan.planDonem;
  const [acik, setAcik] = useState(!dolu);
  const [f, setF] = useState<Plan>({ planDonem: plan.planDonem, planKisi: plan.planKisi ?? 2, planKimle: plan.planKimle, planOtel: plan.planOtel });
  const [busy, setBusy] = useState(false);

  const kaydet = async () => {
    setBusy(true);
    const r = await fetch("/api/profil/tercih", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, kaynak: "plan" }) });
    setBusy(false);
    if (r.ok) {
      setAcik(false);
      router.refresh();
    }
  };

  const chip = (secili: boolean) => `rounded-xl px-3.5 py-2 text-[13px] font-semibold ring-1 transition ${secili ? "bg-[var(--h-blue)] text-white ring-[var(--h-blue)]" : "bg-white text-[#14213d] ring-[var(--h-sky)] hover:ring-[var(--h-blue)]/50"}`;

  if (!acik) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-[24px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name="takvim" size={22} /></span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold text-[#14213d]">Umre planınız</p>
          <p className="text-[#5b6680]">
            {[donemLabel(f.planDonem), f.planKisi ? `${f.planKisi} kişi` : "", f.planKimle ? KIMLE[f.planKimle] : "", f.planOtel ? OTEL[f.planOtel] : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        <button type="button" onClick={() => setAcik(true)} className="text-sm font-bold text-[var(--h-blue)] underline-offset-4 hover:underline">Düzenle</button>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name="takvim" size={22} /></span>
        <div>
          <p className="text-[15px] font-bold text-[#14213d]">Umre planınızı yazın</p>
          <p className="text-[13px] text-[#5b6680]">Size uygun tarihleri önce gösterelim. 20 saniye sürer, istediğiniz zaman değiştirebilirsiniz.</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--h-blue)]/70">Ne zaman gitmeyi düşünüyorsunuz?</p>
          <select value={f.planDonem ?? ""} onChange={(e) => setF({ ...f, planDonem: e.target.value || null })} className="w-full rounded-xl border border-[var(--h-sky)] bg-white px-3.5 py-3 text-sm text-[#14213d] outline-none focus:border-[var(--h-blue)] md:max-w-xs">
            <option value="">Seçin</option>
            {donemler.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--h-blue)]/70">Kaç kişi?</p>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Azalt" onClick={() => setF({ ...f, planKisi: Math.max(1, (f.planKisi ?? 1) - 1) })} className="h-10 w-10 rounded-xl text-lg font-bold text-[var(--h-blue)] ring-1 ring-[var(--h-sky)]">−</button>
            <span className="w-10 text-center text-lg font-bold text-[#14213d]">{f.planKisi ?? 1}</span>
            <button type="button" aria-label="Artır" onClick={() => setF({ ...f, planKisi: Math.min(30, (f.planKisi ?? 1) + 1) })} className="h-10 w-10 rounded-xl text-lg font-bold text-[var(--h-blue)] ring-1 ring-[var(--h-sky)]">+</button>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--h-blue)]/70">Kimlerle?</p>
          <div className="flex flex-wrap gap-2">{Object.entries(KIMLE).map(([k, v]) => <button key={k} type="button" onClick={() => setF({ ...f, planKimle: k })} className={chip(f.planKimle === k)}>{v}</button>)}</div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--h-blue)]/70">Otel tercihi</p>
          <div className="flex flex-wrap gap-2">{Object.entries(OTEL).map(([k, v]) => <button key={k} type="button" onClick={() => setF({ ...f, planOtel: k })} className={chip(f.planOtel === k)}>{v}</button>)}</div>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="button" disabled={busy || !f.planDonem} onClick={kaydet} className="rounded-xl bg-[var(--h-blue)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Kaydediliyor…" : "Planımı kaydet"}</button>
        {dolu && <button type="button" onClick={() => setAcik(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-[#5b6680]">Vazgeç</button>}
      </div>
    </div>
  );
}
