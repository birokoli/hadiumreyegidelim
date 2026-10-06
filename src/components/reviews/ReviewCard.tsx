// Yorum kartı (ana sayfa ve /yorumlar). Yıldız şeması bilerek verilmez (bkz. src/lib/reviews/index.ts).
import Image from "next/image";
import HugIcon from "@/components/icons/HugIcon";
import type { PublicReview } from "@/lib/reviews";

export function Stars({ n }: { n: number | null }) {
  if (!n) return null;
  return (
    <span className="text-[#f5a623] tracking-[0.1em]" aria-label={`5 üzerinden ${n}`}>
      {"★".repeat(n)}
      <span className="text-outline-variant">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function ReviewCard({ r, clamp = false }: { r: PublicReview; clamp?: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-outline-variant/20 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <Stars n={r.rating} />
        {r.verified && <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.06] py-0.5 pl-1.5 pr-2.5 text-[11px] font-semibold text-primary"><HugIcon name="guven" size={14} />Doğrulanmış müşteri</span>}
      </div>
      <p className={`mt-3 whitespace-pre-line text-[15px] leading-relaxed text-on-surface ${clamp ? "line-clamp-6" : ""}`}>{r.text}</p>
      {r.photoUrl && (
        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-low">
          <Image src={r.photoUrl} alt={`${r.name} umre fotoğrafı`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        </div>
      )}
      <p className="mt-auto pt-4 text-[13px] text-on-surface-variant">
        <b className="text-on-surface">{r.name}</b>
        {[r.city, r.umreMonth].filter(Boolean).length > 0 && <> · {[r.city, r.umreMonth].filter(Boolean).join(" · ")}</>}
      </p>
      {r.reply && (
        <div className="mt-3 rounded-xl bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
          <b className="text-on-surface">Hadi Umreye Gidelim:</b> {r.reply}
        </div>
      )}
    </article>
  );
}
