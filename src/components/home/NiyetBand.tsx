// Ana sayfa koyu bant (MBD "Bir yer adı değil, bir hayal yaz." bölümünün karşılığı): 7687 C zemin, hat filigranı.
import Link from "next/link";

export default function NiyetBand() {
  return (
    <section className="w-full max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="on-dark bg-deep relative overflow-hidden rounded-[28px] px-6 py-12 md:px-14 md:py-16 text-white">
        {/* Hat filigranı: Telbiye */}
        <p aria-hidden className="hat pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[120px] md:text-[190px] leading-none text-white/[0.07] whitespace-nowrap">لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ</p>
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(242,221,166,0.18), transparent 65%)" }} />
        <p className="relative text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--h-sand)]">21.42° K · Mekke</p>
        <h2 className="relative mt-4 max-w-2xl font-headline text-4xl md:text-6xl font-bold leading-[1.05]">
          Bir paket değil, <br /><em>bir niyet planlayın.</em>
        </h2>
        <p className="relative mt-5 max-w-xl text-base md:text-lg text-white/80">Tarihinizi, Mekke ve Medine otelinizi, transferinizi seçin; umrenizin fiyatını hemen görün. Gerisini birlikte tamamlayalım.</p>
        <div className="relative mt-8 flex flex-wrap items-center gap-3">
          <Link href="/bireysel-umre" className="inline-flex items-center gap-2 rounded-full bg-[var(--h-sand)] px-6 py-3.5 font-bold text-[var(--h-blue-deep)] transition-transform hover:-translate-y-0.5">
            Umremi planla <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link href="/paketler" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 font-semibold text-white hover:bg-white/10">Hazır paketler</Link>
        </div>
      </div>
    </section>
  );
}
