// Yardım merkezi düzeni (6 Ekim, kullanıcı): SSS, Destek (/iletisim), Grup talepleri, İşletme kaydı.
// İçerik yapısı mbdtravel.com yardım sayfalarından; tasarım sitenin kendi dili.
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb, Container } from "@/components/ui/kit";

const NAV: { group: string; items: { href: string; label: string }[] }[] = [
  { group: "Kurumsal", items: [{ href: "/hakkimizda", label: "Hakkımızda" }, { href: "/yorumlar", label: "Misafir yorumları" }] },
  {
    group: "Yardım ve iletişim",
    items: [
      { href: "/sss", label: "Sıkça sorulan sorular" },
      { href: "/iletisim", label: "Destek ve iletişim" },
      { href: "/grup-talepleri", label: "Grup talepleri" },
      { href: "/isletme-kaydi", label: "İşletmenizi kaydedin" },
    ],
  },
];

export default function HelpLayout({ active, crumb, kicker, title, lead, cta, children }: { active: string; crumb: string; kicker: string; title: string; lead: string; cta?: ReactNode; children: ReactNode }) {
  return (
    <main id="main-content" className="pt-28 md:pt-32 pb-16 md:pb-24 bg-surface-container-low">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          <aside className="order-2 lg:order-1">
            <nav aria-label="Yardım menüsü" className="rounded-2xl border border-outline-variant/20 bg-white p-4 lg:sticky lg:top-28">
              {NAV.map((g, gi) => (
                <div key={g.group} className={gi > 0 ? "mt-4 border-t border-outline-variant/15 pt-4" : ""}>
                  <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">{g.group}</p>
                  <ul className="space-y-0.5">
                    {g.items.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} aria-current={active === i.href ? "page" : undefined} className={`block rounded-xl px-3 py-2.5 text-[15px] transition-colors ${active === i.href ? "bg-primary/[0.07] font-semibold text-primary" : "text-on-surface hover:bg-surface-container-low"}`}>
                          {i.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link href="/paketler" className="mt-4 block border-t border-outline-variant/15 px-3 pt-4 text-[14px] font-semibold text-primary underline-offset-4 hover:underline">Umre paketlerini incele</Link>
            </nav>
          </aside>

          <div className="order-1 min-w-0 space-y-6 lg:order-2">
            <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: crumb }]} />
            <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-white md:px-10 md:py-14">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.06]" />
              <p className="relative text-[12px] font-bold uppercase tracking-[0.16em] text-white/70">{kicker}</p>
              <h1 className="relative mt-3 max-w-2xl font-headline text-3xl font-bold leading-tight md:text-5xl text-balance">{title}</h1>
              <p className="relative mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{lead}</p>
              {cta && <div className="relative mt-7">{cta}</div>}
            </section>
            {children}
          </div>
        </div>
      </Container>
    </main>
  );
}
