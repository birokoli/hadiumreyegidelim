// BEKLEMEDE (28 Ekim, kullanıcı: "KV animasyonlu şimdilik dursun, geliştirip sonra koyarız"); şu an hiçbir sayfada kullanılmıyor.
// Ana sayfa kapağı B (28 Ekim, kullanıcı: "video yerine animasyon yap, ona da bakalım"): KV "Yol" rotasının hareketli hali.
// Tam ekran Kâbe fotoğrafı yavaşça yaklaşır; Kâbe'nin çevresinde KV'deki kum rengi kemer çizgileri içten dışa çizilir,
// ardından bir kemer dalgası sürekli dışa açılır (kapıdan kapıya yol). İmza kelime kelime gelir. Video indirilmez, yalnızca CSS.
// Kemer geometrisi sosyal/marka-kiti/kaynak/kit_ortak.py kemer() ile aynı (oran 0,62). "Hareketi azalt" açıksa durağan.
import Image from "next/image";
import type { ReactNode } from "react";

const ORAN = 0.62;
function kemer(x: number, y: number, w: number, h: number) {
  const r = w * 0.5;
  const rise = w * ORAN;
  const sp = y + rise;
  const R = rise >= r ? (r ** 2 + rise ** 2) / (2 * r) : Math.hypot(r, rise) * 1.15;
  return `M${x} ${y + h}V${sp.toFixed(1)}A${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${(x + r).toFixed(1)} ${y}A${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${x + w} ${sp.toFixed(1)}V${y + h}Z`;
}

// KV ölçüleri: iç kemer 520×760, her çizgi 46 birim dışa
const W0 = 520, H0 = 760, ADIM = 46, N = 4;
const DW = W0 + (N + 1) * ADIM * 2;
const DH = H0 + (N + 1) * ADIM * 1.6;
const yay = (i: number) => {
  const w = W0 + i * ADIM * 2;
  const h = H0 + i * ADIM * 1.6;
  return kemer((DW - w) / 2, DH - h, w, h);
};
const CIZGILER = Array.from({ length: N + 1 }, (_, i) => ({ d: yay(i), opak: i === 0 ? 0.95 : 0.85 - i * 0.14, kalin: i === 0 }));

const DESEN = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="256" viewBox="0 0 160 256"><path d="M0 256V120A130 130 0 0 1 80 0A130 130 0 0 1 160 120V256" fill="none" stroke="#fff" stroke-opacity="0.06" stroke-width="2"/></svg>`)}")`;

const CSS = `
@keyframes kp-yaklas{from{transform:scale(1.12)}to{transform:scale(1)}}
@keyframes kp-ciz{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes kp-dalga{0%{transform:scale(1);opacity:0}15%{opacity:.7}100%{transform:scale(1.55);opacity:0}}
@keyframes kp-kelime{from{opacity:0;transform:translateY(0.45em)}to{opacity:1;transform:none}}
@keyframes kp-cizgi{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes kp-belir{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes kp-desen{from{background-position:0 0}to{background-position:0 -192px}}
.kp-foto{animation:kp-yaklas 18s cubic-bezier(.2,.6,.2,1) both}
.kp-desen{animation:kp-desen 40s linear infinite}
.kp-yay{stroke-dasharray:1;stroke-dashoffset:1;animation:kp-ciz 1.6s cubic-bezier(.65,0,.35,1) forwards}
.kp-dalga{transform-box:fill-box;transform-origin:50% 100%;opacity:0;animation:kp-dalga 5s cubic-bezier(.25,.6,.3,1) 2.6s infinite}
.kp-kelime{display:inline-block;opacity:0;animation:kp-kelime .8s cubic-bezier(.2,.7,.2,1) forwards}
.kp-cizgi{transform-origin:left;transform:scaleX(0);animation:kp-cizgi .7s cubic-bezier(.2,.7,.2,1) 1.1s forwards}
.kp-belir{opacity:0;animation:kp-belir .8s ease-out forwards}
@media (prefers-reduced-motion:reduce){.kp-foto,.kp-desen,.kp-dalga{animation:none}.kp-yay{stroke-dashoffset:0;animation:none}.kp-kelime,.kp-belir{opacity:1;animation:none;transform:none}.kp-cizgi{transform:none;animation:none}}
`;

export default function KapakAnimasyon({ title, lead, image, children }: { title: string; lead: string; image: string; children: ReactNode }) {
  const kelimeler = title.split(/\s+/);
  return (
    <section className="relative z-20 w-full overflow-hidden pt-28 pb-16 md:pt-32 md:pb-12 md:min-h-[640px] md:flex md:flex-col md:justify-end">
      <style>{CSS}</style>
      <div className="absolute inset-0 overflow-hidden bg-[#12295A]">
        {/* Fotoğraf ve kemerler birlikte kayar: masaüstünde fotoğraf %130 genişlikte sola yaslı, Kâbe sağ tarafa gelir (yazıya yer açılır);
            kemer çizgileri fotoğraftaki Kâbe'nin ortasına (yatayda %52) kilitli */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[130%]">
          <Image alt="Kabe ve Mescid-i Haram" className="kp-foto object-cover" style={{ objectPosition: "50% 100%" }} src={image} fill priority fetchPriority="high" sizes="(min-width: 768px) 130vw, 100vw" quality={75} />
        </div>
        {/* KV "plan" düzeni: soldan lacivert, yazı tarafı koyu; alttan teklif çubuğu için koyulaşır */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#12295A_0%,rgba(18,41,90,0.85)_32%,rgba(18,41,90,0.3)_62%,rgba(18,41,90,0.2)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12295a]/30 via-transparent to-[#12295a]/80" />
        <div aria-hidden className="kp-desen absolute inset-0" style={{ backgroundImage: DESEN, backgroundSize: "120px 192px" }} />
        <div aria-hidden className="absolute inset-y-0 left-0 w-full md:w-[130%]">
          <svg viewBox={`0 0 ${DW} ${DH}`} preserveAspectRatio="xMidYMax meet" className="absolute bottom-0 left-[52%] h-[78%] -translate-x-1/2 md:h-[94%] overflow-visible">
            {CIZGILER.map((c, i) => (
              <path key={c.d} className="kp-yay" pathLength={1} d={c.d} fill="none" stroke="#F2DDA6" strokeOpacity={c.opak} strokeWidth={c.kalin ? 2 : 1.3} vectorEffect="non-scaling-stroke" style={{ animationDelay: `${0.25 + i * 0.22}s` }} />
            ))}
            <path className="kp-dalga" d={CIZGILER[0].d} fill="none" stroke="#F2DDA6" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
      <div className="on-dark relative w-full max-w-screen-xl mx-auto px-4 md:px-8">
        <h1 className="font-headline text-white font-extrabold tracking-tight max-w-3xl text-[40px] sm:text-5xl md:text-[72px] leading-[1.04] text-balance">
          {kelimeler.map((k, i) => (
            <span key={i} className="kp-kelime" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
              {k}
              {i < kelimeler.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <span aria-hidden className="kp-cizgi mt-6 block h-[4px] w-[72px] rounded-full bg-[var(--h-sand)] md:w-[90px]" />
        <p className="kp-belir mt-5 text-base md:text-lg text-white/85 max-w-xl" style={{ animationDelay: "1.2s" }}>{lead}</p>
        <div className="kp-belir mt-7 md:mt-9" style={{ animationDelay: "1.4s" }}>{children}</div>
      </div>
    </section>
  );
}
