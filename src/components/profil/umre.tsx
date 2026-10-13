// Umre dosyası parçaları (13 Ekim): aşama çizelgesi, plan kartı, gün sayacı. Sunucu bileşeni olarak da kullanılabilir.
import type { ReactNode } from "react";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import { ASAMALAR, asamaIndex, trTarih } from "@/lib/satis/ortak";

export function AsamaCubugu({ status, etiketli = false }: { status: string; etiketli?: boolean }) {
  const i = asamaIndex(status);
  return (
    <div>
      <div className="flex gap-1">
        {ASAMALAR.map((a, j) => (
          <span key={a.key} className={`h-1.5 flex-1 rounded-full ${j < i ? "bg-[var(--h-blue)]" : j === i ? "bg-[var(--h-sand)]" : "bg-[#d7e0f0]"}`} />
        ))}
      </div>
      {etiketli && (
        <div className="mt-2 hidden justify-between text-[11px] text-[#8a94ab] md:flex">
          {ASAMALAR.map((a, j) => <span key={a.key} className={j === i ? "font-bold text-[#8a6a1c]" : ""}>{a.label}</span>)}
        </div>
      )}
    </div>
  );
}

export function AsamaCizelgesi({ status, tarihler }: { status: string; tarihler?: Partial<Record<string, string>> }) {
  const i = asamaIndex(status);
  return (
    <ol className="mt-4">
      {ASAMALAR.map((a, j) => {
        const bitti = j < i || (j === i && status === "tamamlandi");
        const simdi = j === i && status !== "tamamlandi";
        return (
          <li key={a.key} className="relative flex gap-3 pb-4 last:pb-0">
            {j < ASAMALAR.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-16px)] w-0.5 ${j < i ? "bg-[var(--h-blue)]" : "bg-[#d7e0f0]"}`} />}
            <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bitti ? "bg-[var(--h-blue)] text-white" : simdi ? "bg-[var(--h-sand)] text-[var(--h-blue-deep)]" : "bg-white text-[#8a94ab] ring-2 ring-[#d7e0f0]"}`}>
              {bitti ? <HugIcon name="onay" size={14} /> : <span className="text-[11px] font-bold">{j + 1}</span>}
            </span>
            <div className="flex flex-1 items-baseline justify-between gap-2">
              <p className={`text-[14px] ${bitti || simdi ? "font-bold text-[#14213d]" : "text-[#8a94ab]"}`}>
                {a.label}
                {simdi && <span className="ml-2 rounded-full bg-[#fbf4e1] px-2 py-0.5 text-[10px] font-bold text-[#8a6a1c]">şu an</span>}
              </p>
              {tarihler?.[a.key] && <span className="shrink-0 text-[11px] text-[#8a94ab]">{trTarih(tarihler[a.key], { day: "numeric", month: "short" })}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function PlanKart({ ikon, ust, baslik, alt, children }: { ikon: HugIconName; ust: string; baslik: string; alt?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-[var(--h-sky)]/60">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name={ikon} size={22} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--h-blue)]/60">{ust}</p>
        <p className="text-[14px] font-bold text-[#14213d]">{baslik}</p>
        {alt && <div className="text-[13px] leading-snug text-[#5b6680]">{alt}</div>}
        {children}
      </div>
    </div>
  );
}

export function GunSayaci({ gun, koyu = false }: { gun: number | null; koyu?: boolean }) {
  if (gun == null) return null;
  const metin = gun > 1 ? "gün kaldı" : gun === 1 ? "Yarın yolculuk" : gun === 0 ? "Bugün yolculuk" : "Yolculuk başladı";
  return (
    <div className="flex items-end gap-2">
      {gun > 1 && <b className={`text-[56px] font-bold leading-none md:text-[72px] ${koyu ? "text-white" : "text-[var(--h-blue)]"}`}>{gun}</b>}
      <span className={`mb-1.5 font-semibold ${gun > 1 ? "text-[17px]" : "text-[24px]"} ${koyu ? "text-white/80" : "text-[#3d4a66]"}`}>{metin}</span>
    </div>
  );
}


