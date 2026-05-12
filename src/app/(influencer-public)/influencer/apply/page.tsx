'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InfluencerApplyPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    instagramHandle: '', instagramFollowers: '', tiktokHandle: '', youtubeHandle: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/influencer/auth/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, instagramFollowers: parseInt(form.instagramFollowers) || 0 }),
    });
    const data = await res.json();
    if (res.ok) { setSuccess(true); }
    else { setError(data.error || 'Bir hata oluştu.'); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Başvurunuz Alındı!</h2>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
            Başvurunuzu inceleyip en kısa sürede size dönüş yapacağız.
            Onaylandığında e-posta ile bilgilendirileceكsiniz.
          </p>
          <Link href="/influencer/login"
            className="inline-flex items-center gap-2 bg-[#003781] text-white px-6 py-3 rounded-xl font-semibold text-[15px] hover:bg-[#002a63] transition-colors">
            <span className="material-symbols-outlined text-[20px]">login</span>
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003781] mb-4 shadow-lg shadow-[#003781]/20">
            <span className="text-white text-xl font-bold">HU</span>
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Influencer Başvurusu</h1>
          <p className="text-[15px] text-gray-500 mt-1.5">Takipçilerinizi umre yolculuğuna davet edin, komisyon kazanın</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-[#003781]' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-[14px] px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-bold text-gray-900 mb-4">Kişisel Bilgiler</h2>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Ad Soyad *</label>
                <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder="Ahmet Hoca" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">E-posta *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="ornek@email.com" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Telefon *</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="0530 000 00 00" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Şifre *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="En az 8 karakter" required minLength={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <button onClick={() => { if (form.fullName && form.email && form.phone && form.password) setStep(2); else setError('Lütfen tüm zorunlu alanları doldurun.'); }}
                className="w-full bg-[#003781] hover:bg-[#002a63] text-white font-semibold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 mt-2">
                Devam Et
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-[17px] font-bold text-gray-900 mb-4">Sosyal Medya Hesapları</h2>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Instagram Kullanıcı Adı</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">@</span>
                  <input type="text" value={form.instagramHandle} onChange={e => set('instagramHandle', e.target.value)}
                    placeholder="ahmethoca" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Instagram Takipçi Sayısı</label>
                <input type="number" value={form.instagramFollowers} onChange={e => set('instagramFollowers', e.target.value)}
                  placeholder="10000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">TikTok Kullanıcı Adı</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">@</span>
                  <input type="text" value={form.tiktokHandle} onChange={e => set('tiktokHandle', e.target.value)}
                    placeholder="ahmethoca" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">YouTube Kanalı</label>
                <input type="text" value={form.youtubeHandle} onChange={e => set('youtubeHandle', e.target.value)}
                  placeholder="@ahmethoca" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-[15px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Geri
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#003781] hover:bg-[#002a63] text-white font-semibold py-3.5 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span className="material-symbols-outlined text-[20px]">send</span> Başvur</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[14px] text-gray-500 mt-5">
          Zaten hesabınız var mı?{' '}
          <Link href="/influencer/login" className="text-[#003781] font-semibold hover:underline">Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
}
