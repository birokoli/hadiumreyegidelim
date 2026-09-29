"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll reveal. Mounted once in the (main) layout. Observes every
 * [data-reveal] element and adds .is-visible when it enters the viewport — the
 * actual transition lives in globals.css so this stays a pure class toggle.
 *
 * The layout survives client-side navigation, so this re-scans on every route
 * change and also watches the DOM for elements rendered later (streaming,
 * client components). Without that, pages reached through a <Link> stayed
 * invisible because their elements were never observed.
 */
export default function MotionInit() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = Number(el.dataset.revealDelay || (i % 3) * 80);
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((el) => {
        if (reduceMotion) el.classList.add("is-visible");
        else observer.observe(el);
      });
    };

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
