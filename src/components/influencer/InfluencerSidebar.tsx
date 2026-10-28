'use client';
// Marketing paneli menüsü (27 Ekim yenilemesi): masaüstünde koyu lacivert yan menü, telefonda 4 sekme + "Menü" çekmecesi.

import Ikon from '@/components/influencer/Ikon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Oge = { href: string; icon: string; label: string; kisa?: string; esles?: string[] };

const ANA: Oge[] = [
  { href: '/influencer/dashboard', icon: 'bugun', label: 'Bugün' },
  { href: '/influencer/campaigns', icon: 'kampanya', label: 'Kampanyalar' },
  { href: '/influencer/shares', icon: 'icerik', label: 'İçeriklerim', kisa: 'İçerik' },
  { href: '/influencer/kazanc', icon: 'cuzdan', label: 'Kazancım', kisa: 'Kazanç', esles: ['/influencer/payments', '/influencer/loyalty'] },
];
const DIGER: Oge[] = [
  { href: '/influencer/customers', icon: 'aile', label: 'Müşterilerim' },
  { href: '/influencer/kit', icon: 'palet', label: 'Medya Kiti' },
  { href: '/influencer/links', icon: 'link', label: 'Linklerim' },
  { href: '/influencer/davet', icon: 'davet', label: 'Davet Et' },
  { href: '/influencer/support', icon: 'destek', label: 'Destek' },
];

const aktif = (path: string, o: Oge) => [o.href, ...(o.esles ?? [])].some((h) => path === h || path.startsWith(h + '/'));

export default function InfluencerSidebar() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);

  const satir = (o: Oge) => {
    const a = aktif(path, o);
    return (
      <Link key={o.href} href={o.href}
        className={`flex items-center gap-3 px-3.5 py-2.5 mk-yuvarlak text-[14.5px] font-semibold transition-colors ${a ? 'bg-white text-[var(--mk-gece)]' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
        <Ikon ad={o.icon} boyut={21} className={a ? 'text-[var(--mk-lacivert)]' : ''} />
        {o.label}
      </Link>
    );
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[264px] z-40 mk-yan">
        <div className="relative px-6 pt-7 pb-6">
          {/* Logo + "marketing" tek kilit: logonun dördüncü satırı, aynı genişlik (public/marketing-kilit-beyaz.svg) */}
          <Link href="/influencer/dashboard" className="inline-block" aria-label="Hadi Umreye Gidelim Marketing">
            <img src="/marketing-kilit-beyaz.svg" alt="Hadi Umreye Gidelim Marketing" className="h-[84px] w-auto" />
          </Link>
        </div>
        <nav className="relative flex-1 px-3 space-y-1 overflow-y-auto">
          {ANA.map(satir)}
          <p className="px-3.5 pt-5 pb-1.5 text-[11px] font-extrabold tracking-[0.16em] text-white/40">DİĞER</p>
          {DIGER.map(satir)}
        </nav>
        <div className="relative px-3 py-4 border-t border-white/10">
          <a href="https://www.hadiumreyegidelim.com" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 mk-yuvarlak text-[14px] font-semibold text-white/60 hover:bg-white/10 hover:text-white">
            <Ikon ad="disari" boyut={20} />
            Siteyi aç
          </a>
        </div>
      </aside>

      {/* Telefon: alt sekmeler */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[var(--mk-cizgi)] mk-alt-menu">
        <div className="flex">
          {ANA.map((o) => {
            const a = aktif(path, o);
            return (
              <Link key={o.href} href={o.href} className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-bold ${a ? 'text-[var(--mk-lacivert)]' : 'text-[var(--mk-metin)]'}`}>
                <Ikon ad={o.icon} boyut={24} />
                {o.kisa ?? o.label}
              </Link>
            );
          })}
          <button onClick={() => setMenu(true)} className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-bold ${DIGER.some((o) => aktif(path, o)) ? 'text-[var(--mk-lacivert)]' : 'text-[var(--mk-metin)]'}`}>
            <Ikon ad="menu" boyut={24} />
            Menü
          </button>
        </div>
      </nav>

      {menu && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMenu(false)}>
          <div className="absolute inset-0 bg-[var(--mk-gece)]/40" />
          <div className="absolute bottom-0 inset-x-0 bg-white p-4 pb-8 mk-gir" style={{ borderRadius: '24px 24px 0 0' }} onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 mk-hap bg-[var(--mk-cizgi)]" />
            {DIGER.map((o) => (
              <Link key={o.href} href={o.href} onClick={() => setMenu(false)}
                className={`flex items-center gap-3 px-3 py-3.5 mk-yuvarlak text-[15px] font-semibold ${aktif(path, o) ? 'bg-[var(--mk-zemin)] text-[var(--mk-lacivert)]' : 'text-[var(--mk-yazi)]'}`}>
                <Ikon ad={o.icon} boyut={22} />
                {o.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
