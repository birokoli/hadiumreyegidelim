'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/influencer/dashboard', icon: 'dashboard',       label: 'Dashboard' },
  { href: '/influencer/loyalty',   icon: 'star',            label: 'Yıldızlarım' },
  { href: '/influencer/davet',     icon: 'group_add',       label: 'Davet & Referral' },
  { href: '/influencer/campaigns', icon: 'campaign',        label: 'Kampanyalar' },
  { href: '/influencer/links',     icon: 'link',            label: 'Linklerim & Kodum' },
  { href: '/influencer/shares',    icon: 'photo_camera',    label: 'Paylaşımlarım' },
  { href: '/influencer/customers', icon: 'people',          label: 'Müşterilerim' },
  { href: '/influencer/payments',  icon: 'payments',        label: 'Ödemelerim' },
  { href: '/influencer/support',   icon: 'support_agent',   label: 'Canlı Destek' },
];

export default function InfluencerSidebar() {
  const path = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/marketing-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight">Marketing</p>
              <p className="text-[11px] text-gray-400 leading-tight">Influencer Paneli</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(item => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  active
                    ? 'bg-[#003781] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'text-white' : 'text-gray-400'}`}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <span className="material-symbols-outlined text-[20px] text-gray-400">open_in_new</span>
            Siteye Git
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex">
        {nav.map(item => {
          const active = path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-[#003781]' : 'text-gray-400'
              }`}>
              <span className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label.split(' ')[0]}
            </Link>
          );
        })}
      </div>
    </>
  );
}
