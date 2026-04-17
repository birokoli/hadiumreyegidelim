"use client";

import React, { useState, useEffect } from "react";

const DEFAULTS = {
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
  HOME_FAQ_DESC: "Diyanet turlarına veya kafilelere bağlı kalmadan kendi imkanlarıyla bireysel umre nasıl yapılır merak eden misafirlerimiz için en çok sorulan soruları derledik.",
  WHATSAPP_NUMBER: "905404010038",
  WHATSAPP_MESSAGE: "Selamun Aleykum, Müsait misiniz? Umre paketleriniz için fiyat bilgisi alabilir miyim?",
  BRAND_PRIMARY: "#003781",
  BRAND_SECONDARY: "#236B40",
  BRAND_SURFACE: "#f9f9f9",
  BRAND_SURFACE_CARD: "#ffffff",
  BRAND_TEXT: "#1a1c1c",
  SITE_LOGO: "/logo.png",
  BUTTON_RADIUS: "1rem",
  HOME_CTA: "NİYET ET VE PLANLA",
  NAVBAR_CTA: "Niyet Et",
  WHATSAPP_CTA: "WHATSAPP DANIŞMANLIK",
  CONTACT_TITLE: "İletişim & Rezervasyon",
  CONTACT_DESC: "Manevi yolculuğunuza ilk adımı birlikte atıyoruz.",
  CONTACT_EMAIL: "info@hadiumreye.com",
  CONTACT_ADDRESS: "Fatih, İstanbul",
  // Social media
  SOCIAL_INSTAGRAM: "",
  SOCIAL_FACEBOOK: "",
  SOCIAL_YOUTUBE: "",
  SOCIAL_TWITTER: "",
  SOCIAL_TIKTOK: "",
};

type SettingsKey = keyof typeof DEFAULTS;

type Tab = 'branding' | 'home' | 'contact' | 'social' | 'security' | 'sitemap';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('branding');
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', newUsername: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => { if (data && !data.error) setSettings(prev => ({ ...prev, ...data })); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("headingSlug", "site-logo");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) handleChange('SITE_LOGO', data.url);
      else alert("Logo yüklenirken hata: " + data.error);
    } catch { alert("Ağ hatası."); }
    finally { setUploadingLogo(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings)
      });
      setSaveMsg(res.ok ? { type: 'ok', text: 'Ayarlar kaydedildi.' } : { type: 'err', text: 'Kaydetme başarısız!' });
    } catch { setSaveMsg({ type: 'err', text: 'Hata oluştu.' }); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(null), 4000); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'err', text: 'Yeni şifreler eşleşmiyor.' }); return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'err', text: 'Şifre en az 8 karakter olmalı.' }); return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword, newUsername: pwForm.newUsername })
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ type: 'ok', text: 'Şifre başarıyla güncellendi.' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '', newUsername: '' });
      } else { setPwMsg({ type: 'err', text: data.error || 'Şifre değiştirilemedi.' }); }
    } catch { setPwMsg({ type: 'err', text: 'Ağ hatası.' }); }
    finally { setPwSaving(false); }
  };

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Yükleniyor...</div>;

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'branding', icon: 'palette',        label: 'Görünüm'      },
    { key: 'home',     icon: 'home',            label: 'Anasayfa'     },
    { key: 'contact',  icon: 'contact_support', label: 'İletişim'     },
    { key: 'social',   icon: 'share',           label: 'Sosyal Medya' },
    { key: 'security', icon: 'security',        label: 'Güvenlik'     },
    { key: 'sitemap',  icon: 'map',             label: 'Sitemap'      },
  ];

  const inp = "w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-primary";
  const lbl = "block text-xs font-bold text-outline uppercase tracking-wider mb-2";

  return (
    <div className="pt-20 p-6 lg:p-10 min-h-screen bg-surface">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">Dinamik İçerik CMS</span>
          <h2 className="text-4xl font-serif text-primary">Sistem Ayarları</h2>
          <p className="text-on-surface-variant mt-2 max-w-xl text-sm leading-relaxed">Kod yazmadan siteyi yönetin. Değişiklikler anında yansır.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-sm font-bold px-4 py-2 rounded-xl ${saveMsg.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {saveMsg.text}
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="bg-primary hover:bg-[#002f6c] text-white px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50">
            <span className="material-symbols-outlined text-[20px]">save</span>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/10 pb-4">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === tab.key ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BRANDING ── */}
      {activeTab === 'branding' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-primary">palette</span> Kurumsal Kimlik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={lbl}>Ana Marka Rengi (Primary)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.BRAND_PRIMARY} onChange={e => handleChange('BRAND_PRIMARY', e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={settings.BRAND_PRIMARY} onChange={e => handleChange('BRAND_PRIMARY', e.target.value)} className={`${inp} font-mono uppercase`} />
                </div>
              </div>
              <div>
                <label className={lbl}>İkincil Renk (Secondary)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.BRAND_SECONDARY} onChange={e => handleChange('BRAND_SECONDARY', e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={settings.BRAND_SECONDARY} onChange={e => handleChange('BRAND_SECONDARY', e.target.value)} className={`${inp} font-mono uppercase`} />
                </div>
              </div>
              <div>
                <label className={lbl}>Arkaplan Rengi (Surface)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.BRAND_SURFACE || '#f9f9f9'} onChange={e => handleChange('BRAND_SURFACE', e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={settings.BRAND_SURFACE || '#f9f9f9'} onChange={e => handleChange('BRAND_SURFACE', e.target.value)} className={`${inp} font-mono uppercase`} />
                </div>
              </div>
              <div>
                <label className={lbl}>Kart Arkaplan (Surface Card)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.BRAND_SURFACE_CARD || '#ffffff'} onChange={e => handleChange('BRAND_SURFACE_CARD', e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={settings.BRAND_SURFACE_CARD || '#ffffff'} onChange={e => handleChange('BRAND_SURFACE_CARD', e.target.value)} className={`${inp} font-mono uppercase`} />
                </div>
              </div>
              <div>
                <label className={lbl}>Metin Rengi (Text)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.BRAND_TEXT || '#1a1c1c'} onChange={e => handleChange('BRAND_TEXT', e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={settings.BRAND_TEXT || '#1a1c1c'} onChange={e => handleChange('BRAND_TEXT', e.target.value)} className={`${inp} font-mono uppercase`} />
                </div>
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => {
                  handleChange('BRAND_PRIMARY', '#003781');
                  handleChange('BRAND_SECONDARY', '#236B40');
                  handleChange('BRAND_SURFACE', '#f9f9f9');
                  handleChange('BRAND_SURFACE_CARD', '#ffffff');
                  handleChange('BRAND_TEXT', '#1a1c1c');
                }} className="w-full py-3 px-4 border-2 border-dashed border-outline-variant/30 rounded-xl text-sm text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all font-medium">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">restart_alt</span>
                  Varsayılana Dön
                </button>
              </div>
            </div>
            <div>
              <label className={lbl}>Site Logosu</label>
              <div className="flex items-center gap-3">
                <label className={`flex-shrink-0 cursor-pointer px-4 py-3 bg-secondary text-white font-bold rounded-xl text-sm flex items-center gap-2 ${uploadingLogo ? 'opacity-70 pointer-events-none' : ''}`}>
                  {uploadingLogo ? <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Yükleniyor...</> : <><span className="material-symbols-outlined text-[18px]">upload</span> Logo Yükle</>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
                <input type="text" value={settings.SITE_LOGO} onChange={e => handleChange('SITE_LOGO', e.target.value)} className={inp} placeholder="/logo.png" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-outline">smart_button</span> Butonlar</h3>
            <div>
              <label className={lbl}>Buton Şekli</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[['0px','Keskin'],['0.5rem','Hafif'],['1rem','Standart'],['9999px','Oval']].map(([val, name]) => (
                  <button key={val} type="button" onClick={() => handleChange('BUTTON_RADIUS', val)}
                    className={`py-3 px-2 flex flex-col items-center gap-2 border-2 rounded-xl transition-all ${settings.BUTTON_RADIUS === val ? 'border-primary bg-primary/5' : 'border-outline-variant/20 bg-surface-container-low'}`}>
                    <div className="w-16 h-8 bg-primary text-white text-[10px] flex items-center justify-center font-bold" style={{ borderRadius: val }}>Buton</div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-outline-variant/10 pt-6">
              {[['HOME_CTA','Anasayfa Butonu'],['NAVBAR_CTA','Navbar Butonu'],['WHATSAPP_CTA','WhatsApp Butonu']].map(([key, label]) => (
                <div key={key}>
                  <label className={lbl}>{label}</label>
                  <input type="text" value={settings[key]} onChange={e => handleChange(key, e.target.value)} className={inp} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HOME ── */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">web</span> Hero Bölümü</h3>
            <div className="space-y-5">
              {[['HERO_TAGLINE','Üst Etiket'],['HERO_TITLE','Ana Başlık (H1)']].map(([key, label]) => (
                <div key={key}><label className={lbl}>{label}</label><input type="text" value={settings[key]} onChange={e => handleChange(key, e.target.value)} className={inp} /></div>
              ))}
              <div><label className={lbl}>Açıklama</label><textarea rows={3} value={settings.HERO_DESC} onChange={e => handleChange('HERO_DESC', e.target.value)} className={`${inp} resize-none`} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Paketler Vitrini', fields: [['HOME_TOURS_KICKER','Üst Yazı'],['HOME_TOURS_TITLE','Başlık']] },
              { title: 'Adım Adım Bölüm', fields: [['HOME_STEPS_KICKER','Üst Yazı'],['HOME_STEPS_TITLE','Başlık']] },
              { title: 'Blog Vitrini',     fields: [['HOME_BLOG_KICKER','Üst Yazı'], ['HOME_BLOG_TITLE','Başlık']] },
              { title: 'SSS Bölümü',      fields: [['HOME_FAQ_TITLE','Başlık'],     ['HOME_FAQ_DESC','Açıklama']] },
            ].map(section => (
              <div key={section.title} className="bg-white rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                <h4 className="font-bold text-primary mb-4">{section.title}</h4>
                <div className="space-y-4">
                  {section.fields.map(([key, label]) => (
                    <div key={key}><label className={lbl}>{label}</label><input type="text" value={settings[key]} onChange={e => handleChange(key, e.target.value)} className={inp} /></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTACT ── */}
      {activeTab === 'contact' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-[#25D366]">forum</span> WhatsApp Asistanı</h3>
            <div className="space-y-5">
              <div><label className={lbl}>WhatsApp Telefon Numarası</label><input type="text" value={settings.WHATSAPP_NUMBER} onChange={e => handleChange('WHATSAPP_NUMBER', e.target.value)} className={`${inp} font-mono`} placeholder="905404010038" /></div>
              <div><label className={lbl}>Otomatik Mesaj</label><textarea rows={4} value={settings.WHATSAPP_MESSAGE} onChange={e => handleChange('WHATSAPP_MESSAGE', e.target.value)} className={`${inp} resize-none`} /></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">contact_mail</span> İletişim Sayfası</h3>
            <div className="space-y-5">
              <div><label className={lbl}>Sayfa Başlığı</label><input type="text" value={settings.CONTACT_TITLE} onChange={e => handleChange('CONTACT_TITLE', e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Sayfa Açıklaması</label><textarea rows={3} value={settings.CONTACT_DESC} onChange={e => handleChange('CONTACT_DESC', e.target.value)} className={`${inp} resize-none`} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-outline-variant/10">
                <div><label className={lbl}>Kurumsal E-Posta</label><input type="text" value={settings.CONTACT_EMAIL} onChange={e => handleChange('CONTACT_EMAIL', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Merkez Adres</label><input type="text" value={settings.CONTACT_ADDRESS} onChange={e => handleChange('CONTACT_ADDRESS', e.target.value)} className={inp} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SOCIAL MEDIA ── */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
          <h3 className="text-xl font-serif text-primary mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">share</span> Sosyal Medya Hesapları</h3>
          <p className="text-sm text-on-surface-variant mb-8">Footer ve iletişim sayfasında görünecek profil linkleri. Boş bırakılan hesaplar gösterilmez.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'SOCIAL_INSTAGRAM', label: 'Instagram', icon: 'photo_camera',    placeholder: 'https://instagram.com/hesap' },
              { key: 'SOCIAL_FACEBOOK',  label: 'Facebook',  icon: 'thumb_up',         placeholder: 'https://facebook.com/sayfa'   },
              { key: 'SOCIAL_YOUTUBE',   label: 'YouTube',   icon: 'play_circle',      placeholder: 'https://youtube.com/@kanal'   },
              { key: 'SOCIAL_TWITTER',   label: 'X / Twitter', icon: 'alternate_email', placeholder: 'https://x.com/hesap'          },
              { key: 'SOCIAL_TIKTOK',    label: 'TikTok',    icon: 'music_video',      placeholder: 'https://tiktok.com/@hesap'    },
            ].map(({ key, label, icon, placeholder }) => (
              <div key={key}>
                <label className={lbl}><span className="material-symbols-outlined text-[14px] mr-1">{icon}</span>{label}</label>
                <input type="url" value={settings[key] || ''} onChange={e => handleChange(key, e.target.value)} className={inp} placeholder={placeholder} />
              </div>
            ))}
          </div>
          <p className="text-xs text-outline mt-6">* Değişiklikleri kaydetmeyi unutmayın. Footer'da bu linkler dinamik olarak görünür.</p>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">lock</span> Şifre Değiştir</h3>
            <p className="text-sm text-on-surface-variant mb-8">Yanlış şifre girişlerinde 5 denemeden sonra 15 dakika otomatik kilitleme aktif.</p>
            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
              <div>
                <label className={lbl}>Mevcut Şifre</label>
                <input required type="password" value={pwForm.currentPassword} onChange={e => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))} className={inp} placeholder="••••••••" />
              </div>
              <div>
                <label className={lbl}>Yeni Kullanıcı Adı (boş bırakın — değiştirmek istemiyorsanız)</label>
                <input type="text" value={pwForm.newUsername} onChange={e => setPwForm(prev => ({ ...prev, newUsername: e.target.value }))} className={inp} placeholder="Mevcut kullanıcı adı korunur" />
              </div>
              <div>
                <label className={lbl}>Yeni Şifre (min 8 karakter)</label>
                <input required type="password" minLength={8} value={pwForm.newPassword} onChange={e => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))} className={inp} placeholder="••••••••" />
              </div>
              <div>
                <label className={lbl}>Yeni Şifre (Tekrar)</label>
                <input required type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))} className={inp} placeholder="••••••••" />
              </div>
              {pwMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${pwMsg.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className="material-symbols-outlined text-[18px]">{pwMsg.type === 'ok' ? 'check_circle' : 'error'}</span>
                  {pwMsg.text}
                </div>
              )}
              <button type="submit" disabled={pwSaving} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#002f6c] transition-all shadow-md active:scale-95 disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">security</span>
                {pwSaving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Aktif Güvenlik Korumaları</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Brute force koruması: 5 hatalı girişte 15 dakika kilitleme</li>
                  <li>• Admin oturumu: HttpOnly çerez, 30 günlük geçerlilik</li>
                  <li>• Şifre: SHA-256 ile şifrelenmiş, veritabanında hash olarak saklanır</li>
                  <li>• Tüm admin API'leri oturum doğrulaması gerektiriyor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SITEMAP ── */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">map</span> Sitemap Yönetimi</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Sitemap otomatik oluşturulur. Blog yazıları, paketler, kategoriler ve şehir bazlı sayfalar dahil edilir.
              Google Search Console'dan manuel resubmit yapabilirsiniz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { title: 'Sitemap URL', value: 'https://hadiumreyegidelim.com/sitemap.xml', icon: 'link', color: 'text-blue-600 bg-blue-50' },
                { title: 'Robots.txt', value: 'https://hadiumreyegidelim.com/robots.txt',   icon: 'smart_toy', color: 'text-slate-600 bg-slate-50' },
              ].map(item => (
                <div key={item.title} className={`flex items-center gap-4 p-4 rounded-xl border border-outline-variant/20 ${item.color.split(' ')[1]}`}>
                  <span className={`material-symbols-outlined text-[22px] ${item.color.split(' ')[0]}`}>{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{item.title}</p>
                    <p className="text-sm font-mono text-slate-800 truncate">{item.value}</p>
                  </div>
                  <a href={item.value} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">open_in_new</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-low rounded-xl p-5">
              <h4 className="font-bold text-primary mb-3 text-sm uppercase tracking-wider">Dahil Edilen Sayfalar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Statik Sayfalar',          desc: 'Ana sayfa, bireysel umre, paketler, rehberlik, blog, vize' },
                  { label: 'Blog Yazıları',             desc: 'Yayındaki tüm blog yazıları (güncellenme tarihiyle)' },
                  { label: 'Paketler',                  desc: 'Yayındaki tüm umre paketleri (öncelik: 1.0)' },
                  { label: 'Blog Kategorileri',         desc: 'Post içeren kategoriler' },
                  { label: 'Şehir Bazlı SEO Sayfaları', desc: '81 il × bireysel umre (yüksek öncelik: 0.85)' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <p className="text-sm font-bold text-primary">{item.label}</p>
                      <p className="text-xs text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                <span className="font-bold">Google Search Console:</span> sitemap.xml adresini ekledikten sonra yeni içerikler için manuel "Request Indexing" yapabilirsiniz.
                Sitemap otomatik olarak Vercel rebuild sırasında güncellenir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
