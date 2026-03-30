import React from 'react';

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ paket?: string }> }) {
  const { paket } = await searchParams;
  const selectedPackage = paket ? paket.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  return (
    <main className="pt-32 pb-24 bg-surface-container-lowest min-h-screen">
      <div className="max-w-3xl mx-auto px-8">
        <header className="text-center mb-16">
          <span className="text-tertiary font-label text-xs tracking-[0.3em] font-bold uppercase mb-4 block">Size Ulaşalım</span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold mb-6 tracking-tight">İletişim & Rezervasyon</h1>
          <p className="text-on-surface-variant font-light text-lg">Manevi yolculuğunuza ilk adımı birlikte atıyoruz. Formu doldurun, umre danışmanlarımız müsaitlik ve detaylar için en kısa sürede sizi arasın.</p>
        </header>

        <section className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-primary/5 border border-outline-variant/10">
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Adınız Soyadınız</label>
                <input required className="w-full bg-surface-container-low border border-transparent rounded-2xl p-5 text-secondary focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner" placeholder="Örn: Ahmet Yılmaz" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Telefon Numaranız</label>
                <input required type="tel" className="w-full bg-surface-container-low border border-transparent rounded-2xl p-5 text-secondary focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner" placeholder="05XX XXX XX XX" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">İlgilendiğiniz Paket (Opsiyonel)</label>
              <input defaultValue={selectedPackage} className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-5 text-primary font-bold focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-primary/50" placeholder="Bir paket seçmediniz" />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Mesajınız / Ek Talepleriniz</label>
              <textarea rows={4} className="w-full bg-surface-container-low border border-transparent rounded-2xl p-5 text-secondary focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none shadow-inner" placeholder="Oda sayınız, özel konaklama talebiniz veya havalimanı kalkış tercihiniz var mı?"></textarea>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full bg-primary text-white font-bold tracking-widest uppercase px-8 py-5 rounded-2xl hover:bg-primary-container hover:text-primary transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                İletişime Geçin <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
              <p className="text-center text-xs font-medium text-outline mt-6 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">verified_user</span> Bilgileriniz şifrelenerek korunur.
              </p>
            </div>
          </form>
        </section>

        <div className="mt-20 text-center grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">call</span>
             </div>
             <p className="font-bold text-primary text-lg">+90 540 401 00 38</p>
             <p className="text-xs text-outline font-medium tracking-wide mt-1">7/24 Çağrı Merkezi</p>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">mail</span>
             </div>
             <p className="font-bold text-primary text-lg">info@hadiumreye.com</p>
             <p className="text-xs text-outline font-medium tracking-wide mt-1">Kurumsal İletişim</p>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">location_on</span>
             </div>
             <p className="font-bold text-primary text-lg">Fatih, İstanbul</p>
             <p className="text-xs text-outline font-medium tracking-wide mt-1">Merkez Ofis</p>
           </div>
        </div>
      </div>
    </main>
  );
}
