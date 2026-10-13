// Kitaplıktaki bir kitapçık: kapak, açıklama, "Şavt modunda oku" ve PDF.
import Image from "next/image";
import Link from "next/link";
import HugIcon from "@/components/icons/HugIcon";
import type { Kitapcik } from "@/lib/kitapcik";

export default function KitapKart({ k, buyuk = false }: { k: Kitapcik; buyuk?: boolean }) {
  return (
    <article className="group relative flex gap-5 overflow-hidden rounded-[28px] bg-white p-5 ring-1 ring-[var(--h-sky)]/50 transition hover:shadow-[0_24px_48px_-28px_rgba(18,41,90,0.5)] md:p-6">
      <span aria-hidden className="hat pointer-events-none absolute -bottom-8 -right-2 select-none text-[6.5rem] leading-none text-[var(--h-blue)]/[0.05]">{k.hat}</span>
      <Link href={`/profil/oku/${k.slug}`} className="relative shrink-0">
        <Image src={k.kapak} alt={`${k.ad} kapağı`} width={240} height={340} className={`${buyuk ? "w-28 md:w-36" : "w-24 md:w-28"} -rotate-3 rounded-lg shadow-[0_18px_30px_-12px_rgba(18,41,90,0.55)] ring-1 ring-black/5 transition group-hover:rotate-0`} />
      </Link>
      <div className="relative flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]/60"><HugIcon name={k.ikon} size={15} /> {k.sure}</p>
        <h3 className="mt-1.5 text-xl font-bold text-[var(--h-blue)] md:text-2xl">{k.ad}</h3>
        <p className="mt-1 text-sm leading-snug text-[#5b6680]">{k.aciklama}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Link href={`/profil/oku/${k.slug}`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--h-blue)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--h-blue-deep)]">
            <HugIcon name="rehber" size={18} className="text-[var(--h-sand)]" /> Şavt modunda oku
          </Link>
          <a href={k.pdf} download={k.pdfAdi} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--h-sky)] px-4 py-2.5 text-sm font-bold text-[var(--h-blue)] transition hover:border-[var(--h-blue)]">
            PDF indir
          </a>
        </div>
      </div>
    </article>
  );
}
