"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";

const TABS: { href: string; label: string; ikon: HugIconName }[] = [
  { href: "/profil", label: "Özet", ikon: "kabe" },
  { href: "/profil/size-ozel", label: "Size Özel", ikon: "takvim" },
  { href: "/profil/umrelerim", label: "Umrelerim", ikon: "paket" },
  { href: "/profil/teklifler", label: "Teklifler", ikon: "fiyat" },
  { href: "/profil/kitaplik", label: "Kitaplık", ikon: "rehber" },
  { href: "/profil/hesap", label: "Hesap", ikon: "bireysel" },
];

export default function ProfilTabs() {
  const path = usePathname();
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Profil">
      {TABS.map((t) => {
        const active = t.href === "/profil" ? path === "/profil" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-t-2xl px-4 py-3 text-sm font-bold transition md:px-5 ${
              active ? "bg-[var(--h-white)] text-[var(--h-blue)]" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <HugIcon name={t.ikon} size={18} className={active ? "text-[var(--h-blue)]" : "text-[var(--h-sand)]"} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
