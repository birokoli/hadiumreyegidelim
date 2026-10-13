"use client";
// Umre hazırlık listesi: işaretlenenler bu telefonda saklanır (dosya numarasına göre).
import { useEffect, useState } from "react";
import HugIcon from "@/components/icons/HugIcon";

const MADDELER: { grup: string; liste: string[] }[] = [
  { grup: "Belgeler", liste: ["Pasaport (en az 6 ay geçerli)", "Vize çıktısı ya da telefonda PDF'i", "Otel belgeleri", "Kimlik fotokopisi", "Yurt dışı sağlık sigortası"] },
  { grup: "İhram ve ibadet", liste: ["İhram (erkekler: iki parça havlu kumaş)", "İhram kemeri ve terlik", "Kokusuz sabun ve şampuan", "Tavaf ve Sa'y El Kitabı (kitaplığınızda)", "Küçük seccade ve tesbih"] },
  { grup: "Sağlık ve günlük", liste: ["Düzenli kullandığınız ilaçlar (reçetesiyle)", "Rahat yürüyüş ayakkabısı", "Şemsiye ya da şapka", "Taşınabilir şarj aleti", "Suudi Arabistan için priz dönüştürücü"] },
];

export default function HazirlikListesi({ no }: { no: string }) {
  const anahtar = `hazirlik:${no}`;
  const [isaretli, setIsaretli] = useState<string[]>([]);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- telefonda saklanan liste açılışta okunur
      setIsaretli(JSON.parse(localStorage.getItem(anahtar) ?? "[]"));
    } catch { /* gizli pencere */ }
  }, [anahtar]);
  const degistir = (m: string) => {
    const yeni = isaretli.includes(m) ? isaretli.filter((x) => x !== m) : [...isaretli, m];
    setIsaretli(yeni);
    try { localStorage.setItem(anahtar, JSON.stringify(yeni)); } catch { /* gizli pencere */ }
  };
  const toplam = MADDELER.reduce((s, g) => s + g.liste.length, 0);
  return (
    <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-[#14213d]">Hazırlık listesi</p>
        <span className="rounded-full bg-[var(--h-white)] px-3 py-1 text-xs font-bold text-[var(--h-blue)]">{isaretli.length}/{toplam}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--h-white)]"><div className="h-full rounded-full bg-[var(--h-blue)] transition-all" style={{ width: `${(isaretli.length / toplam) * 100}%` }} /></div>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {MADDELER.map((g) => (
          <div key={g.grup}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--h-blue)]/60">{g.grup}</p>
            <ul className="mt-2 space-y-1.5">
              {g.liste.map((m) => {
                const ok = isaretli.includes(m);
                return (
                  <li key={m}>
                    <button type="button" onClick={() => degistir(m)} className="flex w-full items-start gap-2.5 rounded-xl px-1 py-1 text-left text-[13px] hover:bg-[var(--h-white)]">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${ok ? "bg-[var(--h-blue)] text-white" : "ring-2 ring-[var(--h-sky)]"}`}>{ok && <HugIcon name="onay" size={13} />}</span>
                      <span className={ok ? "text-[#8a94ab] line-through" : "text-[#14213d]"}>{m}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
