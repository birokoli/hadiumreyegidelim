// Ziyaret turu rotası (15 Ekim): bölüm başlıkları ikonlu, duraklar numaralı dikey çizgide. Teklif, voucher ve profilde aynı.
// "sikisik": voucher ve yazdırma için daha az boşluk; açıklamalar tek satır.
import HugIcon from "@/components/icons/HugIcon";
import { durakSayisi, type Rota } from "@/lib/satis/ziyaret";

export default function ZiyaretRotasi({ rota, sikisik = false }: { rota: Rota; sikisik?: boolean }) {
  // Durak numaraları bölümler boyunca sürer (1–14): her bölümün ilk numarası önceden hesaplanır
  const baslangic = rota.bolumler.map((_, i) => rota.bolumler.slice(0, i).reduce((t, b) => t + b.duraklar.length, 0));
  return (
    <div className="break-inside-avoid">
      <div className="flex items-center gap-3">
        <span className={`flex shrink-0 items-center justify-center rounded-xl bg-[var(--h-blue)] text-white ${sikisik ? "h-9 w-9" : "h-11 w-11"}`}>
          <HugIcon name={rota.ikon} size={sikisik ? 18 : 22} />
        </span>
        <div>
          <p className={`font-bold text-[#14213d] ${sikisik ? "text-[14px]" : "text-[16px]"}`}>{rota.ad}</p>
          <p className="text-xs text-[#5b6680]">{durakSayisi(rota)} durak · {rota.sehir}</p>
        </div>
      </div>
      <div className={sikisik ? "mt-3 space-y-3" : "mt-4 space-y-5"}>
        {rota.bolumler.map((b, bi) => (
          <div key={b.ad}>
            {rota.bolumler.length > 1 && (
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a6a1c]">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#fbf4e1] text-[#8a6a1c]"><HugIcon name={b.ikon} size={14} /></span>
                {b.ad}
              </p>
            )}
            <ol className="relative ml-[11px] border-l-2 border-[var(--h-sky)]/70">
              {b.duraklar.map((d, di) => {
                const n = baslangic[bi] + di + 1;
                return (
                  <li key={d.ad} className={`relative pl-6 ${sikisik ? "pb-2" : "pb-3"} last:pb-0`}>
                    <span className="absolute -left-[12px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-[var(--h-blue)] ring-2 ring-[var(--h-sky)]">{n}</span>
                    <p className={`font-semibold leading-snug text-[#14213d] ${sikisik ? "text-[13px]" : "text-[14px]"}`}>{d.ad}</p>
                    <p className={`leading-snug text-[#5b6680] ${sikisik ? "text-[11.5px]" : "text-[13px]"}`}>{d.aciklama}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
