'use client';

import React, { useState } from 'react';

export default function ContactFormClient({ initialPackage }: { initialPackage: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    package: initialPackage || '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      setSuccess(true);
      setFormData({ name: '', phone: '', package: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-[#e0f5eb] text-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="font-headline text-3xl font-bold text-primary mb-4">Talebiniz Alındı</h3>
        <p className="text-on-surface-variant leading-relaxed">
          Manevi yolculuğunuzun ilk adımını attığınız için teşekkür ederiz.<br/>
          Umre danışmanlarımız müsaitlik durumunu kontrol edip <strong>verdiğiniz numaradan en kısa sürede sizi arayacaktır.</strong>
        </p>
        <button onClick={() => setSuccess(false)} className="mt-8 text-primary font-bold text-sm hover:underline">
          Yeni Talep Oluştur
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Adınız Soyadınız *</label>
          <input 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-surface-container-low border border-transparent rounded-2xl p-5 text-secondary focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner" 
            placeholder="Örn: Ahmet Yılmaz" 
          />
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Telefon Numaranız *</label>
          <input 
            required 
            type="tel" 
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-surface-container-low border border-transparent rounded-2xl p-5 text-secondary focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner" 
            placeholder="05XX XXX XX XX" 
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">İlgilendiğiniz Lüks Paket (Opsiyonel)</label>
        <input 
          value={formData.package}
          onChange={e => setFormData({...formData, package: e.target.value})}
          className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-5 text-primary font-bold focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-primary/50" 
          placeholder="Bir paket seçmediniz" 
        />
      </div>

      <div className="space-y-3">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Mesajınız / Ek Talepleriniz (Opsiyonel)</label>
        <textarea 
          rows={4} 
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
          className="w-full bg-surface-container-low border border-transparent rounded-2xl p-5 text-secondary focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none shadow-inner" 
          placeholder="Oda sayınız, özel konaklama talebiniz veya havalimanı kalkış tercihiniz var mı?"
        ></textarea>
      </div>

      <div className="pt-6">
        <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold tracking-widest uppercase px-8 py-5 rounded-2xl hover:bg-primary-container hover:text-primary transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100">
          {loading ? 'GÖNDERİLİYOR...' : 'İletişime Geçin'}
          {!loading && <span className="material-symbols-outlined text-[20px]">send</span>}
        </button>
        <p className="text-center text-xs font-medium text-outline mt-6 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">verified_user</span> Bilgileriniz şifrelenerek korunur.
        </p>
      </div>
    </form>
  );
}
