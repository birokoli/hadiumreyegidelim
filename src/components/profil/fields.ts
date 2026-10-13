// Profil formlarının ortak alan stilleri (kitapçık penceresiyle aynı dil).
export const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border bg-[var(--h-white)]/60 py-3.5 pl-12 pr-4 text-[15px] text-[#14213d] placeholder:text-[#7d88a3] transition focus:bg-white focus:outline-none focus:ring-4 ${
    hasError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-[var(--h-sky)] focus:border-[var(--h-blue)] focus:ring-[var(--h-sky)]/40"
  }`;
export const fieldIcon = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--h-blue)]/55";
export const primaryButton =
  "flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--h-blue)] px-6 py-4 text-[15px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(29,66,138,0.8)] transition hover:bg-[var(--h-blue-deep)] disabled:opacity-60";

/** Giriş sonrası dönülecek yer yalnızca profil içi olabilir. */
export const safeNext = (next: string | undefined | null) => (next && /^\/profil(\/[\w/-]*)?$/.test(next) ? next : "/profil");
