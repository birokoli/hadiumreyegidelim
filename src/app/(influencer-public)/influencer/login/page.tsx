'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function InfluencerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/influencer/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      if (data.status === 'pending') {
        router.push('/influencer/pending');
      } else {
        router.push('/influencer/dashboard');
        router.refresh();
      }
    } else {
      setError(data.error || 'Giriş başarısız.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── SOL PANEL ── */}
      <div className="hidden lg:flex lg:w-[54%] bg-[#002d6a] relative overflow-hidden flex-col justify-between p-14">

        {/* Arka plan daireler */}
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-white/[0.035] pointer-events-none" />
        <div className="absolute -bottom-52 -left-28 w-[480px] h-[480px] rounded-full bg-[#001f4d]/70 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[280px] h-[280px] rounded-full bg-white/[0.02] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* İnce çizgi desen */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/marketing-logo.svg"
            alt="Hadi Umreye Gidelim"
            width={280}
            height={85}
            className="brightness-0 invert opacity-90"
            priority
          />
        </div>

        {/* Orta içerik */}
        <div className="relative z-10 max-w-[380px]">
          <div className="inline-block text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-6 border border-white/10 px-3 py-1.5 rounded-full">
            Ortaklık Programı
          </div>
          <h2 className="text-[44px] font-black text-white leading-[1.08] tracking-tight mb-6">
            Takipçilerini<br />
            <span className="text-white/40">umreye</span><br />
            taşı.
          </h2>
          <p className="text-[15px] text-white/55 leading-relaxed max-w-[300px]">
            Her satışta komisyon kazan, yıldız biriktir ve özel ödüllere ulaş. Panelinle her şeyi anlık takip et.
          </p>

          <div className="flex gap-8 mt-12">
            <div>
              <div className="text-[32px] font-black text-white leading-none">%2.5</div>
              <div className="text-[12px] text-white/40 mt-1.5 font-medium">satış komisyonu</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-[32px] font-black text-white leading-none">24/7</div>
              <div className="text-[12px] text-white/40 mt-1.5 font-medium">canlı takip paneli</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-[32px] font-black text-white leading-none">4</div>
              <div className="text-[12px] text-white/40 mt-1.5 font-medium">ödül seçeneği</div>
            </div>
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] text-white/25 font-medium">marketing.hadiumreyegidelim.com</span>
          <span className="text-[11px] text-white/25">© 2026</span>
        </div>
      </div>

      {/* ── SAĞ PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-[#F7F8FA]">

        {/* Mobil logo */}
        <div className="lg:hidden mb-10">
          <Image src="/marketing-logo.svg" alt="Hadi Umreye Gidelim" width={210} height={64} priority />
        </div>

        <div className="w-full max-w-[360px]">

          {/* Başlık */}
          <div className="mb-9">
            <h1 className="text-[30px] font-black text-gray-900 tracking-tight">Giriş Yap</h1>
            <p className="text-[14px] text-gray-400 mt-1.5 font-medium">Marketing panelinize hoş geldiniz</p>
          </div>

          {/* Hata */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-2xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px] shrink-0">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* E-posta */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003781]/12 focus:border-[#003781]/60 transition-all shadow-sm shadow-gray-100"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003781]/12 focus:border-[#003781]/60 transition-all shadow-sm shadow-gray-100 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003781] hover:bg-[#002d6a] active:scale-[0.985] text-white font-bold py-4 rounded-2xl text-[15px] transition-all duration-150 shadow-lg shadow-[#003781]/20 disabled:opacity-55 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <span className="w-[18px] h-[18px] border-2 border-white/25 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Giriş Yap
                  <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Alt link */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[12px] text-gray-400">veya</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-[13px] text-gray-400 mt-5">
            Hesabınız yok mu?{' '}
            <Link href="/influencer/apply" className="text-[#003781] font-bold hover:underline underline-offset-2">
              Başvuru Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
