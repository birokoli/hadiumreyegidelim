"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    HERO_TAGLINE: "BOUTIQUE UMRE EXPERIENCE",
    HERO_TITLE: "Bireysel Umre & Özel Aile Paketleri",
    HERO_DESC: "Kendi bütçenize, tarihlerinize ve aile yapınıza %100 uygun bireysel VİP umre paketlerini Suudi e-vize ayrıcalığıyla anında oluşturun.",
    WHATSAPP_NUMBER: "905404010038",
    WHATSAPP_MESSAGE: "Selamun Aleykum, Müsait misiniz? Umre paketleriniz için fiyat bilgisi alabilir miyim?",
    BRAND_PRIMARY: "#003781",
    BRAND_SECONDARY: "#236B40",
    SITE_LOGO: "/logo.png",
    BUTTON_RADIUS: "1rem",
    HOME_CTA: "NİYET ET VE PLANLA"
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert('Ayarlar başarıyla güncellendi. (Değişikliklerin canlı sitede tam aktif olması için sayfa önbelleğinin yenilenmesi birkaç dakika sürebilir, veya Github üzerinden deploy tetikleyebilirsiniz.)');
      else alert('Kaydetme başarısız!');
    } catch {
      alert('Hata oluştu.');
    }
    setSaving(false);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Yükleniyor...</div>;

  return (
    <div className="pt-28 p-12 min-h-screen bg-surface">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">Dinamik İçerik CMS</span>
          <h2 className="text-5xl font-serif text-primary">Sistem Ayarları</h2>
          <p className="text-on-surface-variant mt-4 max-w-2xl font-light leading-relaxed">
            Sitenin anasayfasına ve iletişim modüllerine kod yazmadan direkt müdahale edin. Buradaki değişiklikler veritabanına anında yansır.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-[#185536] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">save</span> 
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Anasayfa Bölümü */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-tertiary">web</span>
            <h3 className="text-2xl font-serif text-primary">Anasayfa (Hero)</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Üst Kapsül Etiketi (Vitrin Yazısı)</label>
              <input
                type="text"
                value={settings.HERO_TAGLINE}
                onChange={(e) => handleChange('HERO_TAGLINE', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary"
              />
              <p className="text-[10px] text-outline mt-1.5 ml-1">Örn: BOUTİQUE UMRE EXPERİENCE</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Ana Başlık (H1)</label>
              <input
                type="text"
                value={settings.HERO_TITLE}
                onChange={(e) => handleChange('HERO_TITLE', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Tanıtım Açıklaması (Paragraf)</label>
              <textarea
                value={settings.HERO_DESC}
                onChange={(e) => handleChange('HERO_DESC', e.target.value)}
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-primary"
              />
            </div>
          </div>
        </div>

        {/* İletişim / WhatsApp Bölümü */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#25D366]">forum</span>
            <h3 className="text-2xl font-serif text-primary">WhatsApp & İletişim</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">WhatsApp Telefon Numarası</label>
              <input
                type="text"
                value={settings.WHATSAPP_NUMBER}
                onChange={(e) => handleChange('WHATSAPP_NUMBER', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono font-bold text-primary"
              />
              <p className="text-[10px] text-outline mt-1.5 ml-1">TR Kodu olmadan veya tam haliyle. Örn: 905404010038</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Otomatik WhatsApp Mesajı</label>
              <textarea
                value={settings.WHATSAPP_MESSAGE}
                onChange={(e) => handleChange('WHATSAPP_MESSAGE', e.target.value)}
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-primary"
              />
              <p className="text-[10px] text-outline mt-1.5 ml-1">Müşteriler WhatsApp butonuna bastığında sana hazır gelecek olan otomatik mesaj.</p>
            </div>
          </div>
        </div>

        {/* Kurumsal Kimlik Bölümü */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#003781]">palette</span>
            <h3 className="text-2xl font-serif text-primary">Kurumsal Kimlik (Renkler & Logo)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Ana Marka Rengi (Primary)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.BRAND_PRIMARY}
                  onChange={(e) => handleChange('BRAND_PRIMARY', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.BRAND_PRIMARY}
                  onChange={(e) => handleChange('BRAND_PRIMARY', e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono font-medium text-primary uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">İkincil Renk (Secondary)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.BRAND_SECONDARY}
                  onChange={(e) => handleChange('BRAND_SECONDARY', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.BRAND_SECONDARY}
                  onChange={(e) => handleChange('BRAND_SECONDARY', e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono font-medium text-primary uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Site Logosu (URL)</label>
              <input
                type="text"
                value={settings.SITE_LOGO}
                onChange={(e) => handleChange('SITE_LOGO', e.target.value)}
                placeholder="Örn: /logo.png veya https://..."
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary"
              />
              <p className="text-[10px] text-outline mt-1.5 ml-1">Medya Galerisi'nden aldığınız linki buraya yapıştırabilirsiniz.</p>
            </div>
          </div>
        </div>

        {/* Buton ve UI Bölümü */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-outline">smart_button</span>
            <h3 className="text-2xl font-serif text-primary">Arayüz Butonları (UI)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Genel Buton Şekli (Kavis)</label>
              <select
                value={settings.BUTTON_RADIUS}
                onChange={(e) => handleChange('BUTTON_RADIUS', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary"
              >
                <option value="0px">Köşeli ve Keskin (Kurumsal)</option>
                <option value="0.5rem">Hafif Yuvarlak (Modern)</option>
                <option value="1rem">Yuvarlak (Standart)</option>
                <option value="9999px">Tam Oval (Yumuşak Kapsül)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Anasayfa Ana Buton Yazısı</label>
              <input
                type="text"
                value={settings.HOME_CTA}
                onChange={(e) => handleChange('HOME_CTA', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary uppercase"
              />
              <p className="text-[10px] text-outline mt-1.5 ml-1">Örn: NİYET ET VE PLANLA</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
