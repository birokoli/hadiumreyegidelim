"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    HERO_TAGLINE: "BOUTIQUE UMRE EXPERIENCE",
    HERO_TITLE: "Ruhunuzun Ritmini Kalabalıklara Teslim Etmeyin.",
    HERO_DESC: "Ailenize ve Size Özel Butik Umre Deneyimi.",
    HOME_TOURS_KICKER: "Kişiselleştirilmiş Lüks Turlar",
    HOME_TOURS_TITLE: "Müsait & VIP Paketlerimiz",
    HOME_STEPS_KICKER: "Adım Adım Yolculuk",
    HOME_STEPS_TITLE: "Maneviyat Yolunda Hazırlığınız Nasıl Başlar?",
    HOME_BLOG_KICKER: "İlham Kaynağı",
    HOME_BLOG_TITLE: "Manevi Rehberlik Blogu",
    HOME_FAQ_TITLE: "Bireysel Umre Rehberi: 2026 Vize ve Detaylar",
    HOME_FAQ_DESC: "Diyanet turlarına veya kafilelere bağlı kalmadan kendi imkanlarıyla bireysel umre nasıl yapılır merak eden misafirlerimiz için en çok sorulan soruları derledik. VIP ve Bireysel Umre paketleri hakkında detaylı bilgiye aşağıdan ulaşabilirsiniz.",
    WHATSAPP_NUMBER: "905404010038",
    WHATSAPP_MESSAGE: "Selamun Aleykum, Müsait misiniz? Umre paketleriniz için fiyat bilgisi alabilir miyim?",
    BRAND_PRIMARY: "#003781",
    BRAND_SECONDARY: "#236B40",
    SITE_LOGO: "/logo.png",
    BUTTON_RADIUS: "1rem",
    HOME_CTA: "NİYET ET VE PLANLA",
    NAVBAR_CTA: "Niyet Et",
    WHATSAPP_CTA: "WHATSAPP DANIŞMANLIK",
    CONTACT_TITLE: "İletişim & Rezervasyon",
    CONTACT_DESC: "Manevi yolculuğunuza ilk adımı birlikte atıyoruz. Formu doldurun, umre danışmanlarımız müsaitlik ve detaylar için en kısa sürede sizi arasın.",
    CONTACT_EMAIL: "info@hadiumreye.com",
    CONTACT_ADDRESS: "Fatih, İstanbul"
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'home' | 'contact'>('branding');

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



  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("headingSlug", "site-logo");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, SITE_LOGO: data.url }));
      } else {
        alert("Logo yüklenirken hata oluştu: " + data.error);
      }
    } catch {
      alert("Ağ hatası: Logo yüklenemedi.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert('Ayarlar başarıyla güncellendi. (Değişikliklerin canlı sitede tam aktif olması için önbelleğin yenilenmesi birkaç dakika sürebilir, veya CMD+SHIFT+R yapabilirsiniz.)');
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
      <header className="mb-8 flex justify-between items-end">
        <div>
          <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">Dinamik İçerik CMS</span>
          <h2 className="text-5xl font-serif text-primary">Sistem Ayarları</h2>
          <p className="text-on-surface-variant mt-4 max-w-2xl font-light leading-relaxed">
            Sitenin tamamına kod yazmadan müdahale edin. Buradaki değişiklikler veritabanına anında yansır.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-[#185536] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">save</span> 
          {saving ? 'Kaydediliyor...' : 'Tüm Sekmeleri Kaydet'}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b-2 border-outline-variant/10 pb-4">
        <button 
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'branding' ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined text-[20px]">palette</span>
          Görünüm & Arayüz
        </button>
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'home' ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Anasayfa
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'contact' ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined text-[20px]">contact_support</span>
          İletişim & Randevu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* -- TAB: BRANDING & UI -- */}
        {activeTab === 'branding' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
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
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Site Logosu (URL veya Yükle)</label>
                  <div className="flex items-center gap-3">
                    <label className={`flex-shrink-0 cursor-pointer px-4 py-3 bg-secondary text-white font-bold rounded-xl text-sm uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center min-w-[140px] ${uploadingLogo ? 'opacity-70 pointer-events-none' : ''}`}>
                      {uploadingLogo ? (
                        <><span className="material-symbols-outlined animate-spin mr-2 text-[18px]">sync</span> Yükleniyor...</>
                      ) : (
                        <><span className="material-symbols-outlined mr-2 text-[18px]">upload</span> Logo Yükle</>
                      )}
                      <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                    <input
                      type="text"
                      value={settings.SITE_LOGO}
                      onChange={(e) => handleChange('SITE_LOGO', e.target.value)}
                      placeholder="Örn: /logo.png veya https://..."
                      className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary"
                    />
                  </div>
                  <p className="text-[10px] text-outline mt-1.5 ml-1">İsterseniz doğrudan bilgisayarınızdan PNG/JPEG yükleyebilir, isterseniz hazır görsel URL'si yapıştırabilirsiniz.</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-outline">smart_button</span>
                <h3 className="text-2xl font-serif text-primary">Arayüz Butonları (UI)</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Genel Buton Şekli (Kavis)</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button 
                      onClick={() => handleChange('BUTTON_RADIUS', '0px')}
                      className={`w-full py-3 px-2 flex flex-col items-center justify-center gap-2 border-2 transition-all ${settings.BUTTON_RADIUS === '0px' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/60 bg-surface-container-low'} rounded-xl`}
                    >
                      <div className="w-16 h-8 bg-primary text-white text-[10px] flex items-center justify-center font-bold" style={{ borderRadius: '0px' }}>Buton</div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Keskin</span>
                    </button>

                    <button 
                      onClick={() => handleChange('BUTTON_RADIUS', '0.5rem')}
                      className={`w-full py-3 px-2 flex flex-col items-center justify-center gap-2 border-2 transition-all ${settings.BUTTON_RADIUS === '0.5rem' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/60 bg-surface-container-low'} rounded-xl`}
                    >
                      <div className="w-16 h-8 bg-primary text-white text-[10px] flex items-center justify-center font-bold" style={{ borderRadius: '0.5rem' }}>Buton</div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Hafif Kavis</span>
                    </button>

                    <button 
                      onClick={() => handleChange('BUTTON_RADIUS', '1rem')}
                      className={`w-full py-3 px-2 flex flex-col items-center justify-center gap-2 border-2 transition-all ${settings.BUTTON_RADIUS === '1rem' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/60 bg-surface-container-low'} rounded-xl`}
                    >
                      <div className="w-16 h-8 bg-primary text-white text-[10px] flex items-center justify-center font-bold" style={{ borderRadius: '1rem' }}>Buton</div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Standart</span>
                    </button>

                    <button 
                      onClick={() => handleChange('BUTTON_RADIUS', '9999px')}
                      className={`w-full py-3 px-2 flex flex-col items-center justify-center gap-2 border-2 transition-all ${settings.BUTTON_RADIUS === '9999px' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/60 bg-surface-container-low'} rounded-xl`}
                    >
                      <div className="w-16 h-8 bg-primary text-white text-[10px] flex items-center justify-center font-bold" style={{ borderRadius: '9999px' }}>Buton</div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Oval (Hap)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-outline-variant/20">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Anasayfa Ana Buton Yazısı</label>
                    <input
                      type="text"
                      value={settings.HOME_CTA}
                      onChange={(e) => handleChange('HOME_CTA', e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary uppercase text-sm"
                    />
                    <p className="text-[10px] text-outline mt-1.5 ml-1">Örn: NİYET ET VE PLANLA</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">WhatsApp Buton Yazısı</label>
                    <input
                      type="text"
                      value={settings.WHATSAPP_CTA}
                      onChange={(e) => handleChange('WHATSAPP_CTA', e.target.value)}
                      className="w-full bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#25D366]/50 outline-none transition-all font-bold text-[#128C7E] uppercase text-sm"
                    />
                    <p className="text-[10px] text-outline mt-1.5 ml-1">WhatsApp Danışmanlık vs.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Üst Menü (Navbar) Butonu</label>
                    <input
                      type="text"
                      value={settings.NAVBAR_CTA}
                      onChange={(e) => handleChange('NAVBAR_CTA', e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary text-sm"
                    />
                    <p className="text-[10px] text-outline mt-1.5 ml-1">Tüm menülerde görünen "Niyet Et" yazısı.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -- TAB: HOMEPAGE -- */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-tertiary">web</span>
                <h3 className="text-2xl font-serif text-primary">Anasayfa Karşılama (Hero)</h3>
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
            
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm mt-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary">tour</span>
                <h3 className="text-2xl font-serif text-primary">Paketler & Vitrin Bölümü</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Vitrin Üst Yazısı (Kicker)</label>
                  <input type="text" value={settings.HOME_TOURS_KICKER} onChange={(e) => handleChange('HOME_TOURS_KICKER', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Vitrin Ana Başlığı</label>
                  <input type="text" value={settings.HOME_TOURS_TITLE} onChange={(e) => handleChange('HOME_TOURS_TITLE', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm mt-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-tertiary">edit_note</span>
                <h3 className="text-2xl font-serif text-primary">Adım Adım Yolculuk Bölümü</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Bölüm Üst Yazısı (Kicker)</label>
                  <input type="text" value={settings.HOME_STEPS_KICKER} onChange={(e) => handleChange('HOME_STEPS_KICKER', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Bölüm Ana Başlığı</label>
                  <input type="text" value={settings.HOME_STEPS_TITLE} onChange={(e) => handleChange('HOME_STEPS_TITLE', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg text-primary" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">menu_book</span>
                  <h3 className="text-xl font-serif text-primary">Blog Vitrini</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Blog Üst Yazısı</label>
                    <input type="text" value={settings.HOME_BLOG_KICKER} onChange={(e) => handleChange('HOME_BLOG_KICKER', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Blog Ana Başlığı</label>
                    <input type="text" value={settings.HOME_BLOG_TITLE} onChange={(e) => handleChange('HOME_BLOG_TITLE', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">help</span>
                  <h3 className="text-xl font-serif text-primary">SSS Bölümü (SEO)</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">SSS Ana Başlığı (H2)</label>
                    <input type="text" value={settings.HOME_FAQ_TITLE} onChange={(e) => handleChange('HOME_FAQ_TITLE', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg text-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">SSS Açıklaması</label>
                    <textarea rows={3} value={settings.HOME_FAQ_DESC} onChange={(e) => handleChange('HOME_FAQ_DESC', e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -- TAB: CONTACT -- */}
        {activeTab === 'contact' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#25D366]">forum</span>
                <h3 className="text-2xl font-serif text-primary">WhatsApp Asistanı</h3>
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

            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-tertiary">contact_mail</span>
                <h3 className="text-2xl font-serif text-primary">İletişim Sayfası Metinleri</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Sayfa Ana Başlığı</label>
                  <input
                    type="text"
                    value={settings.CONTACT_TITLE}
                    onChange={(e) => handleChange('CONTACT_TITLE', e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Sayfa Açıklaması</label>
                  <textarea
                    value={settings.CONTACT_DESC}
                    onChange={(e) => handleChange('CONTACT_DESC', e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-primary"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/20">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Kurumsal E-Posta</label>
                    <input
                      type="text"
                      value={settings.CONTACT_EMAIL}
                      onChange={(e) => handleChange('CONTACT_EMAIL', e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Merkez Adres</label>
                    <input
                      type="text"
                      value={settings.CONTACT_ADDRESS}
                      onChange={(e) => handleChange('CONTACT_ADDRESS', e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
