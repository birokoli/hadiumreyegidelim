'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InfluencerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003781] mb-4 shadow-lg shadow-[#003781]/20">
            <span className="text-white text-xl font-bold">HU</span>
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Marketing Paneli</h1>
          <p className="text-[15px] text-gray-500 mt-1.5">Hesabınıza giriş yapın</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-[14px] px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#003781] hover:bg-[#002a63] text-white font-semibold py-3.5 rounded-xl text-[15px] transition-all shadow-sm shadow-[#003781]/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[14px] text-gray-500 mt-5">
          Hesabınız yok mu?{' '}
          <Link href="/influencer/apply" className="text-[#003781] font-semibold hover:underline">
            Influencer Başvurusu Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
