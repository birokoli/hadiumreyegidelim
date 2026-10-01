// Veritabanındaki HTML içerikte (blog yazıları) görselleri hafifletir:
// Next görsel servisi üzerinden küçültülmüş AVIF/WebP, ekran genişliğine göre boyut, geç yükleme.
// next.config.ts → images.deviceSizes ile aynı genişlikler kullanılır (servis başka genişlik kabul etmez).

const WIDTHS = [640, 828, 1080];
const optimized = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

/** Yalnızca http(s) adresli görseller işlenir; data:, svg ve zaten işlenmiş adresler olduğu gibi kalır */
function shouldOptimize(src: string) {
  return /^https?:\/\//i.test(src) && !/\.svg(\?|$)/i.test(src) && !src.includes("/_next/image");
}

export function optimizeContentImages(html: string, opts: { sizes?: string } = {}) {
  const sizes = opts.sizes ?? "(max-width: 768px) 100vw, 720px";
  return html.replace(/<img\b([^>]*?)\/?>/gi, (full, attrs: string) => {
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) return full;
    const src = srcMatch[1].replace(/&amp;/g, "&");
    let rest = attrs.replace(/\s*\b(src|srcset|sizes|loading|decoding)=["'][^"']*["']/gi, "");
    if (!/\balt=/i.test(rest)) rest += ' alt=""';
    if (!shouldOptimize(src)) return `<img src="${srcMatch[1]}"${rest} loading="lazy" decoding="async">`;
    const srcset = WIDTHS.map((w) => `${optimized(src, w)} ${w}w`).join(", ");
    return `<img src="${optimized(src, 1080)}" srcset="${srcset}" sizes="${sizes}"${rest} loading="lazy" decoding="async">`;
  });
}
