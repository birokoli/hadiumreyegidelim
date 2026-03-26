'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Yeniden yükleyerek veya yönlendirerek admin paneline geçiş
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Giriş başarısız.');
        setLoading(false);
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden py-12 px-6">
      {/* Premium Arkaplan Efektleri */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-tertiary/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-tertiary mb-3 block">
            Hadi Umreye Gidelim
          </span>
          <h1 className="font-headline text-4xl text-primary font-bold tracking-tight">
            Yönetim Paneli
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 opacity-80">
            Kapsamlı yetkilendirme ve kontrol merkezi
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  type="password"
                  required
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-xs font-bold p-4 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001944] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl hover:-translate-y-0.5 transition-all disable:opacity-70 disable:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {loading ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    sync
                  </span>
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Güvenli Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-outline mt-8 uppercase tracking-widest font-bold">
          Sadece yetkili personel içindir
        </p>
      </div>
    </div>
  );
}
