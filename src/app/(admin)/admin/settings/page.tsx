"use client";
import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    logo_url: "",
    primaryColor: "#003781",
    secondaryColor: "#236B40",
    maneviSoz: '"Gönül ne kahve ister ne kahvehane, gönül ahbab ister kahve bahane. Yolculuğun niyeti, varıştan evladır."',
    home_banner_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeWn_hW89LbHLjNkEyCjXnO56IpdLz_zRwB9BvtIjHV_CSU9n_ADpxoS-K9Y4UqzQtVdJ9tM238gIiQ3fIEgF50wPqba1ofx6HeAab2E8EYwvLnq_w13P3UCdpuZloJ2P_FBbqiM4ZrKqELKyG3sgBrj2SCUi6yLGc39nIApI_ip6uasqiKaUGRcpE7WnqmMcqOZVc-CUXOaphNXOHK18KEZCYKehmVy4cZRQP0tk7_PHK5iJh4cVmqsN9DeHNleLOmi97WPx_9Gw",
    home_banner_title: "Ruhunuzun Ritmini Kalabalıklara Teslim Etmeyin.",
    home_banner_subtitle: "Ailenize ve Size Özel Butik Umre Deneyimi.",
    services_banner_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuam-SRusysTmFa8cNfGO0nrUWU2b4lhRvrL1t5uRMO09KYGq46lqmXVR1RTQwnsytK6mpj41mpYDz4mnEykVU3E4_79ZFGw1a_ajWIITp0yX5hzJZwCg4c8E7HxHm5PJe8Jj-nfYiMyZynnNE7AWzy5NoYBmvwnuf46RLKc244lqWhr8dRzr0t2K_CwE-RI3yAUKAAHlgeYna0rO0M3jgOYeUYsFay6HDarHuq5VlPkAp591b0L4AtzHAraP1GcnhRYAXT9ea8ig"
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [navbarLinks, setNavbarLinks] = useState<{label: string, url: string}[]>([
    {label: "Paketler", url: "/paketler"},
    {label: "Bireysel Tasarım", url: "/bireysel-umre"},
    {label: "Rehberler & Keşifler Portalı", url: "/rehberlik"},
    {label: "Manevi Rehberlik Blogu", url: "/blog"},
    {label: "İletişim", url: "/iletisim"}
  ]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const newSettings = { ...settings };
          data.forEach((s: any) => {
            if (s.key === 'navbar_links') {
              try { setNavbarLinks(JSON.parse(s.value)); } catch(e){}
            } else if (s.key in newSettings) {
              (newSettings as any)[s.key] = s.value;
            }
          });
          setSettings(newSettings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSettings({...settings, logo_url: data.url});
      } else {
        alert(data.error || "Logo yüklenirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu hatası.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const keys = Object.keys(settings);
      for (const key of keys) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: settings[key as keyof typeof settings] })
        });
      }
      
      // Save navbarLinks array
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'navbar_links', value: JSON.stringify(navbarLinks) })
      });
      alert("Ayarlar başarıyla kaydedildi!");
    } catch (error) {
      alert("Kaydetme sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface flex items-center justify-center">Ayarlar yükleniyor...</div>;

  return (
    <div className="pt-28 p-12 min-h-screen bg-surface">
      <header className="mb-12">
        <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">System Configuration</span>
        <h2 className="text-5xl font-serif text-primary">Ayarlar</h2>
        <p className="text-on-surface-variant mt-4 max-w-2xl font-light leading-relaxed">
            Niyet Etheric platformunun görsel kimliğini, tipografik hiyerarşisini ve üçüncü taraf servis entegrasyonlarını bu panel üzerinden yönetin.
        </p>
      </header>
      
      <div className="space-y-12">
        {/* Brand Identity Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:sticky lg:top-32">
            <h3 className="text-xl font-serif text-primary mb-2">Brand Identity</h3>
            <p className="text-sm text-on-surface-variant">Logo kullanımı ve ana renk paleti yapılandırması.</p>
          </div>
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl space-y-8 border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-3">Platform Logosu</label>
                <div className="relative group w-full h-32 border-2 border-dashed border-outline-variant hover:border-primary transition-colors rounded-xl overflow-hidden bg-surface-container-low flex flex-col items-center justify-center cursor-pointer">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".png,.svg" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                        {isUploadingLogo ? "hourglass_empty" : "cloud_upload"}
                      </span>
                      <span className="text-xs mt-2 text-outline">
                        {isUploadingLogo ? "Yükleniyor..." : "PNG veya SVG yükle"}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-label uppercase tracking-widest text-outline mb-3">Primary Color</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full shadow-sm border border-outline-variant/10" style={{ backgroundColor: settings.primaryColor }}></div>
                  <input 
                    className="flex-1 border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm font-mono" 
                    type="text" 
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  />
                </div>
                <label className="block text-xs font-label uppercase tracking-widest text-outline mt-6 mb-3">Secondary Color</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full shadow-sm border border-outline-variant/10" style={{ backgroundColor: settings.secondaryColor }}></div>
                  <input 
                    className="flex-1 border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm font-mono" 
                    type="text" 
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Settings Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:sticky lg:top-32">
            <h3 className="text-xl font-serif text-primary mb-2">Banner ve İçerik</h3>
            <p className="text-sm text-on-surface-variant">Anasayfa ve Hizmetler sayfasındaki fotoğraf ve başlıkları yönetin.</p>
          </div>
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl space-y-6 border border-outline-variant/10">
            <div>
              <label className="block text-xs font-label uppercase tracking-widest text-outline mb-3">Anasayfa Banner Resim URL</label>
              <input 
                className="w-full border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm" 
                type="text" 
                value={settings.home_banner_image}
                onChange={(e) => setSettings({...settings, home_banner_image: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-label uppercase tracking-widest text-outline mb-3">Anasayfa Banner Başlık</label>
              <input 
                className="w-full border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm font-headline" 
                type="text" 
                value={settings.home_banner_title}
                onChange={(e) => setSettings({...settings, home_banner_title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-label uppercase tracking-widest text-outline mb-3">Anasayfa Banner Alt Başlık</label>
              <input 
                className="w-full border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm font-headline" 
                type="text" 
                value={settings.home_banner_subtitle}
                onChange={(e) => setSettings({...settings, home_banner_subtitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-label uppercase tracking-widest text-outline mb-3">Hizmetler Banner Resim URL</label>
              <input 
                className="w-full border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm" 
                type="text" 
                value={settings.services_banner_image}
                onChange={(e) => setSettings({...settings, services_banner_image: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Navbar Links Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:sticky lg:top-32">
            <h3 className="text-xl font-serif text-primary mb-2">Ana Menü (Navbar)</h3>
            <p className="text-sm text-on-surface-variant">Sitenin üst kısmında yer alan ana navigasyon menüsünü yönetin.</p>
          </div>
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 space-y-6">
            {navbarLinks.map((link, index) => (
              <div key={index} className="flex gap-4 items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div className="flex-1 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline">Menü Adı</label>
                  <input 
                    className="w-full border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm font-headline" 
                    type="text" 
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...navbarLinks];
                      newLinks[index].label = e.target.value;
                      setNavbarLinks(newLinks);
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline">URL Hedefi</label>
                  <input 
                    className="w-full border-b border-outline-variant/40 bg-transparent py-2 focus:border-primary outline-none text-sm font-mono" 
                    type="text" 
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...navbarLinks];
                      newLinks[index].url = e.target.value;
                      setNavbarLinks(newLinks);
                    }}
                  />
                </div>
                <button 
                  onClick={() => setNavbarLinks(navbarLinks.filter((_, i) => i !== index))}
                  className="mt-6 p-3 text-error hover:bg-error/10 rounded-xl transition-all"
                  title="Kaldır"
                >
                  <span className="material-symbols-outlined block">delete</span>
                </button>
              </div>
            ))}
            <button 
              onClick={() => setNavbarLinks([...navbarLinks, { label: "Yeni Menü", url: "/" }])}
              className="w-full py-4 border-2 border-dashed border-outline-variant/50 rounded-xl text-primary font-bold hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add</span> Yeni Menü Ekle
            </button>
          </div>
        </section>

        {/* Manevi Söz Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:sticky lg:top-32">
            <h3 className="text-xl font-serif text-primary mb-2">Manevi Söz</h3>
            <p className="text-sm text-on-surface-variant">Alt bilgi (footer) alanında görünecek haftalık ilham verici söz.</p>
          </div>
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <textarea 
              className="w-full bg-surface-container-low border-none rounded-xl p-6 font-serif italic text-xl text-on-surface-variant focus:ring-1 focus:ring-tertiary outline-none resize-none" 
              rows={3} 
              value={settings.maneviSoz}
              onChange={(e) => setSettings({...settings, maneviSoz: e.target.value})}
            />
          </div>
        </section>

        {/* Action Bar */}
        <footer className="pt-12 flex justify-end gap-4 border-t border-outline-variant/20 pb-8">
          <button className="px-8 py-3 text-primary font-bold hover:bg-surface-container-low transition-colors rounded-md">İptal Et</button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-3 bg-primary text-on-primary font-bold rounded-md shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </footer>
      </div>
    </div>
  );
}
