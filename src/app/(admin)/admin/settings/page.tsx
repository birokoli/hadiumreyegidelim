"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    HERO_TAGLINE: "BOUTIQUE UMRE EXPERIENCE",
    HERO_TITLE: "Bireysel Umre & Özel Aile Paketleri",
    HERO_DESC: "Kendi bütçenize, tarihlerinize ve aile yapınıza %100 uygun bireysel VİP umre paketlerini Suudi e-vize ayrıcalığıyla anında oluşturun.",
    WHATSAPP_NUMBER: "905404010038",
    WHATSAPP_MESSAGE: "Selamun Aleykum, Müsait misiniz? Umre paketleriniz için fiyat bilgisi alabilir miyim?"
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

      </div>
    </div>
  );
}
