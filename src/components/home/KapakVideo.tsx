// Ana sayfa kapağı A (28 Ekim, kullanıcı: "sloganı kullanalım, video güzel duruyor"): tam ekran Kâbe videosu, başlıkta imza.
// Üst etiket yok (kullanıcı: "Bireysel umre 2026 yazmasın, fazla AI görünüyor").
import Image from "next/image";
import type { ReactNode } from "react";
import HeroVideo from "@/components/home/HeroVideo";

/** "kolay" kelimesi altın çizgiyle (28 Ekim, kullanıcı: çizgi k'den y'ye kadar uzansın); y'nin kuyruğu çizgiyi kesmez */
function Imza({ text }: { text: string }) {
  const m = text.match(/^(.*?)(kolay)(.*)$/i);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[1]}
      <span className="underline decoration-[var(--h-sand)] decoration-[5px] md:decoration-[7px] underline-offset-[0.22em] [text-decoration-skip-ink:none]">{m[2]}</span>
      {m[3]}
    </>
  );
}

export default function KapakVideo({ title, lead, image, video, children }: { title: string; lead: string; image: string; video?: string; children: ReactNode }) {
  return (
    <section className="relative z-20 w-full pt-28 pb-16 md:pt-32 md:pb-12 md:min-h-[620px] md:flex md:flex-col md:justify-end">
      <div className="absolute inset-0 overflow-hidden">
        <Image alt="Kabe ve Mescid-i Haram" className="object-cover object-bottom" src={image} fill priority fetchPriority="high" sizes="100vw" quality={75} />
        {video && (
          // Döngü video yalnızca geniş ekranda ve sayfa yüklendikten sonra; altta kapak görseli kalır
          <HeroVideo src={video} poster={`/_next/image?url=${encodeURIComponent(image)}&w=1920&q=75`} />
        )}
        <div className="absolute inset-0 bg-[#12295a]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12295a]/40 via-transparent to-[#12295a]/75" />
      </div>
      <div className="on-dark relative w-full max-w-screen-xl mx-auto px-4 md:px-8">
        <p aria-hidden className="hat text-[var(--h-sand)] text-2xl md:text-3xl mb-2 text-left" style={{ direction: "rtl", unicodeBidi: "plaintext" }}>لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ</p>
        <h1 className="font-headline text-white font-extrabold tracking-tight max-w-3xl text-[40px] sm:text-5xl md:text-[68px] leading-[1.04] text-balance"><Imza text={title} /></h1>
        {!/kolay/i.test(title) && <span aria-hidden className="mt-5 block h-[4px] w-[72px] rounded-full bg-[var(--h-sand)] md:w-[90px]" />}
        <p className="mt-6 text-base md:text-lg text-white/85 max-w-2xl">{lead}</p>
        <div className="mt-7 md:mt-9">{children}</div>
      </div>
    </section>
  );
}
