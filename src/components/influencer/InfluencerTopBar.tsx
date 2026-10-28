'use client';

import Ikon from '@/components/influencer/Ikon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  session: { fullName: string; email: string };
}

export default function InfluencerTopBar({ session }: Props) {
  const router = useRouter();
  const bas = session.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr-TR');

  const cikis = async () => {
    await fetch('/api/influencer/auth/logout', { method: 'POST' });
    router.push('/influencer/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--mk-arka)]/85 backdrop-blur border-b border-[var(--mk-cizgi)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/influencer/dashboard" className="lg:hidden flex items-center gap-2">
          <img src="/marketing-kilit-lacivert.svg" alt="Hadi Umreye Gidelim Marketing" className="h-11 w-auto" />
        </Link>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-[13.5px] font-bold">{session.fullName}</p>
            <p className="text-[12px] mk-soluk">{session.email}</p>
          </div>
          <div className="w-9 h-9 mk-hap bg-[var(--mk-lacivert)] text-white text-[13px] font-extrabold flex items-center justify-center">{bas}</div>
          <button onClick={cikis} className="mk-btn mk-btn-sade !px-3 !py-2" title="Çıkış">
            <Ikon ad="cikis" boyut={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
