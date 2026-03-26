"use client";
import React, { useState, useEffect } from "react";

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [newGuide, setNewGuide] = useState({
    name: "",
    title: "",
    price: 0,
    image: "",
    slug: "",
    biography: "",
    quote: "",
    youtubeUrl: "",
    expertise: "",
    publications: ""
  });

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      if (Array.isArray(data)) setGuides(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleAddGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuide)
      });
      setShowAddForm(false);
      setNewGuide({ name: "", title: "", price: 0, image: "", slug: "", biography: "", quote: "", youtubeUrl: "", expertise: "", publications: "" });
      fetchGuides();
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("headingSlug", "rehber");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewGuide({ ...newGuide, image: data.url });
      } else {
        alert("Resim yüklenemedi: " + data.error);
      }
    } catch (err) {
      alert("Yükleme hatası.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    try {
      await fetch(`/api/guides?id=${id}`, { method: 'DELETE' });
      fetchGuides();
    } catch (e) {
      alert("Silinirken hata oluştu.");
    }
  };

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Yükleniyor...</div>;

  return (
    <div className="pt-28 px-12 pb-20 bg-surface min-h-screen">
      <section className="mb-16 flex justify-between items-end">
        <div className="max-w-2xl">
          <span className="text-tertiary-fixed-dim font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Yönetim Paneli</span>
          <h2 className="text-5xl font-headline font-bold text-primary mb-6">Rehberler ve Akademik Kadro</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Siyer uzmanları, tarihçiler ve rehberlerin profillerini yönetin.
          </p>
        </div>
        <div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-secondary text-on-secondary px-8 py-4 rounded-md font-bold hover:bg-on-secondary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">{showAddForm ? 'close' : 'add'}</span>
            {showAddForm ? 'İptal Et' : 'Yeni Rehber Ekle'}
          </button>
        </div>
      </section>

      {showAddForm && (
        <form onSubmit={handleAddGuide} className="bg-surface-container p-6 rounded-xl mb-12 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs text-outline mb-2 block">İsim Soyisim</label>
              <input required className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.name} onChange={e => setNewGuide({...newGuide, name: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-outline mb-2 block">Ünvan/Rol</label>
              <input required className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.title} onChange={e => setNewGuide({...newGuide, title: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-outline mb-2 block">Fiyat (USD)</label>
              <input required type="number" className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.price} onChange={e => setNewGuide({...newGuide, price: Number(e.target.value)})} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-outline mb-1 block font-bold text-primary">Profil Fotoğrafı</label>
              <p className="text-[9px] text-outline mb-2 leading-tight">Maks 5MB. Sadece JPEG/PNG.<br/><b className="text-secondary">Önerilen: 800x1000px (4:5 Dikey)</b></p>
              <input 
                type="file" 
                accept="image/jpeg, image/png"
                className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <span className="text-[10px] text-primary mt-1 block font-bold">Resim yükleniyor...</span>}
              {newGuide.image && !uploadingImage && (
                <div className="mt-2 relative inline-block">
                  <img src={newGuide.image} alt="Preview" className="h-20 w-16 object-cover rounded shadow-sm border border-outline-variant/30" />
                  <button type="button" onClick={() => setNewGuide({...newGuide, image: ""})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-outline mb-2 block">URL Slug (Otomatik oluşturulur, boş bırakın)</label>
              <input className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.slug} onChange={e => setNewGuide({...newGuide, slug: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-outline mb-2 block">YouTube Sohbet Linki (Manevi Sohbetler)</label>
              <input className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.youtubeUrl} onChange={e => setNewGuide({...newGuide, youtubeUrl: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-outline mb-2 block">Uzmanlık Alanları (Virgülle ayırarak girin)</label>
              <input placeholder="Siyer, İslam Tarihi, Fıkıh" className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.expertise} onChange={e => setNewGuide({...newGuide, expertise: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-outline mb-2 block">Özlü Söz (İtalik Gösterim)</label>
              <textarea rows={2} className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.quote} onChange={e => setNewGuide({...newGuide, quote: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs text-outline mb-2 block">Akademik Yayınlar (Her biri yeni satırda, Format: '2023 - Kitap Adı')</label>
            <textarea rows={3} className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.publications} onChange={e => setNewGuide({...newGuide, publications: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-outline mb-2 block">Biyografi (Paragraflar için Enter kullanın)</label>
            <textarea rows={5} className="w-full p-2 rounded bg-surface border border-outline-variant/20 focus:outline-primary" value={newGuide.biography} onChange={e => setNewGuide({...newGuide, biography: e.target.value})} />
          </div>
          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">Kaydet</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map(guide => (
          <div key={guide.id} className="bg-surface-container-lowest rounded-xl p-1 group hover:bg-surface-container-low transition-all duration-500 shadow-sm border border-outline-variant/10">
            <div className="relative h-64 overflow-hidden rounded-lg mb-6">
              <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" src={guide.image || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"} alt={guide.name}/>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-tertiary text-white text-[10px] font-bold px-3 py-1 tracking-widest uppercase rounded-sm">{guide.title}</span>
              </div>
            </div>
            <div className="px-6 pb-8">
              <h3 className="text-2xl font-headline font-bold text-primary mb-2">{guide.name}</h3>
              <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 font-body leading-relaxed">
                Ek Ücret: ${guide.price}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                <div className="flex gap-4">
                  <button onClick={() => handleDelete(guide.id)} className="text-red-500 hover:text-red-700 transition-colors"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {guides.length === 0 && (
          <div className="col-span-full text-center py-12 text-outline">Henüz rehber eklenmemiş.</div>
        )}
      </div>
    </div>
  );
}
