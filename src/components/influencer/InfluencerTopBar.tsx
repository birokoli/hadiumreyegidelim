'use client';

import { useRouter } from 'next/navigation';

interface Props {
  session: { fullName: string; email: string };
}

export default function InfluencerTopBar({ session }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/influencer/auth/logout', { method: 'POST' });
    router.push('/influencer/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="lg:hidden">
        <span className="text-[14px] font-semibold text-gray-900">Marketing Paneli</span>
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-semibold text-gray-900 leading-tight">{session.fullName}</p>
          <p className="text-[11px] text-gray-400 leading-tight">{session.email}</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all font-medium">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden sm:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
}
