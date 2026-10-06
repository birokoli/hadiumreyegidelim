import type { Metadata } from "next";
import HugIcon, { HUG_ICONS, type HugIconName } from "@/components/icons/HugIcon";

export const metadata: Metadata = { title: "İkon seti", robots: { index: false, follow: false } };

const names = Object.keys(HUG_ICONS) as HugIconName[];


export default function IconsPage() {
  return (
    <main className="pt-28 pb-20 bg-white">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#1d428a]/70">Marka varlıkları</p>
        <h1 className="mt-2 font-headline text-4xl font-bold text-[#1d428a]">Hadi Umreye Gidelim ikon seti</h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">{names.length} ikon, tek renk; rengi bulunduğu yerin yazı rengini alır. Kullanım: <code>&lt;HugIcon name=&quot;otel&quot; size={24} /&gt;</code></p>

        <h2 className="mt-12 mb-4 text-lg font-bold text-[#1d428a]">Açık zemin</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {names.map((n) => (
            <div key={n} className="flex flex-col items-center gap-3 rounded-2xl border border-[#1d428a]/10 bg-[#edf1fe]/50 p-5 text-[#1d428a]">
              <HugIcon name={n} size={36} />
              <span className="text-center text-[12px] text-on-surface-variant">{HUG_ICONS[n]}</span>
              <code className="text-[10px] text-on-surface-variant/70">{n}</code>
            </div>
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-lg font-bold text-[#1d428a]">Koyu zemin</h2>
        <div className="grid grid-cols-4 gap-3 rounded-3xl p-6 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11" style={{ background: "linear-gradient(135deg,#12295a,#1d428a)" }}>
          {names.map((n) => (
            <div key={n} className="flex flex-col items-center gap-2 p-3 text-white">
              <HugIcon name={n} size={32} />
              <span className="text-center text-[10px] text-white/70">{HUG_ICONS[n]}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-lg font-bold text-[#1d428a]">Boyutlar</h2>
        <div className="flex flex-wrap items-end gap-8 text-[#1d428a]">
          {[16, 20, 24, 32, 48, 64].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className="flex gap-3">
                <HugIcon name="otel" size={s} />
                <HugIcon name="kabe" size={s} />
                <HugIcon name="vize" size={s} />
              </div>
              <span className="text-[11px] text-on-surface-variant">{s}px</span>
            </div>
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-lg font-bold text-[#1d428a]">Kullanım örneği: hızlı erişim</h2>
        <div className="flex flex-wrap justify-center rounded-2xl border border-[#1d428a]/10">
          {(["paket", "bireysel", "vize", "otel", "transfer", "tren", "rehber", "ilk", "hanim"] as HugIconName[]).map((n) => (
            <div key={n} className="flex flex-col items-center gap-1.5 px-5 py-4 text-on-surface-variant">
              <HugIcon name={n} size={26} className="text-[#1d428a]" />
              <span className="text-[12px] font-semibold">{HUG_ICONS[n]}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
