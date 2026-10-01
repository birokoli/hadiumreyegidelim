"use client";

import { useEffect, useState } from "react";

/**
 * Ana sayfa döngü videosu. Sayfa ilk açılışta yalnızca kapak görselini gösterir (hızlı ilk görüntü);
 * video, sayfa yüklendikten sonra ve yalnızca geniş ekranda, veri tasarrufu ya da "hareketi azalt"
 * açık değilse eklenir. Mobilde video indirilmez (eskiden 20 MB'lık dosya açılışta iniyordu).
 */
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const allowed =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !conn?.saveData &&
      !/(^|-)2g$|3g/.test(conn?.effectiveType ?? "");
    if (!allowed) return;
    const start = () => setShow(true);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  if (!show) return null;
  return (
    <video className="hero-video absolute inset-0 w-full h-full object-cover object-bottom" autoPlay muted loop playsInline preload="auto" poster={poster} aria-hidden="true">
      <source src={src} type={src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"} />
    </video>
  );
}
