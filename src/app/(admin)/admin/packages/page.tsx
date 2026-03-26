"use client";
import React, { useState, useEffect } from "react";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [newPackage, setNewPackage] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    currency: "USD",
    duration: "",
    imageUrl: "",
    gallery: [] as string[],
    includes: "",
    isPopular: false,
    published: true,
  });

  const fetchPackages = async () => {
    try {
      const res = await fetch(`/api/packages?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setPackages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCancel = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewPackage({ title: "", slug: "", description: "", price: "", currency: "USD", duration: "", imageUrl: "", gallery: [], includes: "", isPopular: false, published: true });
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg.id);
    let includesStr = "";
    if (pkg.includes) {
        try { const arr = JSON.parse(pkg.includes); if(Array.isArray(arr)) includesStr = arr.join(", "); } catch(e){}
    }
    let galleryArr: string[] = [];
    if (pkg.gallery) {
        try { const arr = JSON.parse(pkg.gallery); if(Array.isArray(arr)) galleryArr = arr; } catch(e){}
    }
    setNewPackage({
      title: pkg.title || "",
      slug: pkg.slug || "",
      description: pkg.description || "",
      price: pkg.price?.toString() || "",
      currency: pkg.currency || "USD",
      duration: pkg.duration || "",
      imageUrl: pkg.imageUrl || "",
      gallery: galleryArr,
      includes: includesStr,
      isPopular: pkg.isPopular || false,
      published: pkg.published ?? true,
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'gallery', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field === 'gallery' ? `gallery-${index}` : field);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("headingSlug", newPackage.slug || "paket");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (field === 'imageUrl') {
          setNewPackage(prev => ({...prev, imageUrl: data.url}));
        } else if (field === 'gallery' && index !== undefined) {
          const newGallery = [...newPackage.gallery];
          newGallery[index] = data.url;
          setNewPackage(prev => ({...prev, gallery: newGallery}));
        }
      } else {
        alert("Yükleme başarısız: " + data.error);
      }
    } catch (err) {
      alert("Bir hata oluştu.");
    } finally {
      setUploadingField(null);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...newPackage.gallery];
    newGallery.splice(index, 1);
    setNewPackage(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugToUse = newPackage.slug || newPackage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const includesArray = newPackage.includes.split(",").map(s => s.trim()).filter(Boolean);
      // Clean up empty gallery slots before sending
      const cleanGallery = newPackage.gallery.filter(Boolean);
      const payload = { ...newPackage, slug: slugToUse, includes: includesArray, gallery: cleanGallery };
      
      const url = editingId ? `/api/packages?id=${editingId}` : "/api/packages";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(editingId ? "Paket başarıyla güncellendi!" : "Paket başarıyla eklendi!");
        handleCancel();
        fetchPackages();
      } else {
        alert("Kaydedilirken hata oluştu.");
      }
    } catch (e) {
      alert("Sunucu hatası.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu paketi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPackages();
      } else {
        alert("Silinirken hata oluştu (Sunucu Hatası)");
      }
    } catch (e) {
      alert("Silinirken hata oluştu (Ağ Hatası)");
    }
  };

  if (loading) return <div className="pt-24 px-12 pb-20 max-w-7xl mx-auto flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="pt-24 px-12 pb-20 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-tertiary font-label text-[10px] tracking-[0.3em] uppercase block mb-2">Tur Paketleri</span>
          <h2 className="font-headline text-4xl font-light text-primary tracking-tight">Paket Yönetimi</h2>
          <p className="text-sm text-on-surface-variant mt-2 font-light">Ön yüzde görüntülenecek butik ve standart umre paketlerini, fiyatlarını ve özelliklerini yönetin.</p>
        </div>
        <button 
          onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-primary-container hover:text-primary transition-all shadow-lg flex items-center gap-2"
        >
          {showAdd ? <><span className="material-symbols-outlined text-[18px]">close</span> İptal Et</> : <><span className="material-symbols-outlined text-[18px]">add</span> Yeni Paket Ekle</>}
        </button>
      </header>

      {showAdd && (
        <section className="bg-surface-container p-12 rounded-2xl relative overflow-hidden mb-12 shadow-sm border border-outline-variant/10">
          <form onSubmit={handleCreate} className="relative z-10 w-full space-y-8 max-w-4xl">
            <h3 className="font-headline text-3xl text-primary border-b border-outline-variant/20 pb-4 mb-8">
              {editingId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paket Adı</label>
                <input required className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none font-bold" 
                  value={newPackage.title} onChange={e => setNewPackage({...newPackage, title: e.target.value})} placeholder="Örn: Butik Aile Umresi" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Slug</label>
                <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newPackage.slug} onChange={e => setNewPackage({...newPackage, slug: e.target.value})} placeholder="butik-aile-umresi" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Başlangıç Fiyatı</label>
                <input required type="number" step="0.01" className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} placeholder="1250" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Para Birimi</label>
                <select className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newPackage.currency} onChange={e => setNewPackage({...newPackage, currency: e.target.value})}>
                  <option value="USD">USD ($)</option>
                  <option value="SAR">SAR (ر.س)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Süre / Gün</label>
                <input required className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newPackage.duration} onChange={e => setNewPackage({...newPackage, duration: e.target.value})} placeholder="Örn: 7 Gece 8 Gün" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pakete Dahil Olanlar (Virgülle Ayırın)</label>
              <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                value={newPackage.includes} onChange={e => setNewPackage({...newPackage, includes: e.target.value})} placeholder="Gidiş-Dönüş Uçak, 5 Yıldızlı Konaklama, Lüks Transfer, Vize, Rehberlik" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Açıklama (Kısa Özeti)</label>
              <textarea required className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface-variant min-h-[100px] focus:ring-primary focus:border-primary outline-none" 
                value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} placeholder="Bu paketin ayrıcalıklarından kısaca bahsedin..." />
            </div>

            {/* Kapak Görseli Upload (Auto-Crop Aspect Render) */}
            <div className="space-y-4 pb-4 border-b border-outline-variant/20">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kapak Görseli (Ana Fotoğraf)</label>
                <p className="text-xs text-outline mb-4">Mükemmel 4:3 oranında otomatik kırpılacaktır. Kaliteli bir JPEG veya PNG seçin.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Upload Zone */}
                <div className="relative flex-1 bg-white border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-container-low hover:border-primary/50 transition-colors group">
                  <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors mb-2">cloud_upload</span>
                  <span className="text-sm font-bold text-secondary">Bilgisayardan Dosya Seç</span>
                  <span className="text-xs text-outline mt-1">Sürükle bırak veya tıkla (Max 5MB)</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => handleUpload(e, 'imageUrl')}
                    disabled={uploadingField === 'imageUrl'}
                  />
                  {uploadingField === 'imageUrl' && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Preview Zone (Auto-Cropped Visual constraint) */}
                <div className="w-full sm:w-64 flex-shrink-0 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-outline font-bold mb-2">Sitede Görüneceği Hali (4:3)</span>
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 relative shadow-inner">
                    {newPackage.imageUrl ? (
                      <img src={newPackage.imageUrl} alt="Kapak Önizleme" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-outline/50">
                        <span className="material-symbols-outlined text-3xl">image_not_supported</span>
                        <span className="text-xs mt-2">Görsel Yok</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detay Görseller Galerisi */}
            <div className="space-y-4 pb-6 border-b border-outline-variant/20">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detay Görseller Galerisi (Maksimum 5 Adet)</label>
              <div className="flex flex-wrap gap-4">
                {[0, 1, 2, 3, 4].map((index) => {
                  const currentImage = newPackage.gallery[index];
                  const isUploadingThis = uploadingField === `gallery-${index}`;

                  return (
                    <div key={index} className="w-32 h-32 relative rounded-xl overflow-hidden border-2 border-dashed border-outline-variant/40 bg-white hover:border-primary/50 transition-colors group flex-shrink-0">
                      {currentImage ? (
                        <>
                          {/* Image Rendered */}
                          <img src={currentImage} className="w-full h-full object-cover" alt={`Gallery ${index}`} />
                          {/* Remove Button Hover State */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => removeGalleryImage(index)} className="p-2 bg-error text-white rounded-full hover:bg-red-600 shadow-xl" title="Görseli Kaldır">
                              <span className="material-symbols-outlined text-sm block">delete</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Empty Upload Zone */}
                          <div className="flex flex-col items-center justify-center w-full h-full text-outline group-hover:text-primary transition-colors cursor-pointer relative">
                            <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                            <span className="text-[10px] mt-1 font-bold">Ekle</span>
                            <input 
                              type="file" 
                              accept="image/png, image/jpeg, image/webp" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleUpload(e, 'gallery', index)}
                              disabled={isUploadingThis}
                            />
                          </div>
                          {isUploadingThis && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center">
                              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-8 items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-outline-variant/50 text-primary focus:ring-primary cursor-pointer" 
                  checked={newPackage.isPopular} onChange={e => setNewPackage({...newPackage, isPopular: e.target.checked})} />
                <span className="text-sm font-bold text-secondary">Popüler Paket Olarak İşaretle (Öne Çıkar)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-outline-variant/50 text-secondary focus:ring-secondary cursor-pointer" 
                  checked={newPackage.published} onChange={e => setNewPackage({...newPackage, published: e.target.checked})} />
                <span className="text-sm font-bold text-secondary">Yayında</span>
              </label>
            </div>

            <div className="pt-6 flex justify-end gap-4">
               <button type="submit" className="bg-primary hover:bg-[#002f6c] text-white px-8 py-3 rounded-xl font-bold tracking-widest uppercase shadow-lg transition-all flex items-center gap-2">
                 <span className="material-symbols-outlined text-lg block">save</span> 
                 {editingId ? 'GÜNCELLE' : 'KAYDET'}
               </button>
            </div>
          </form>
        </section>
      )}

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_32px_64px_-12px_rgba(0,55,129,0.06)] border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Görsel / Paket</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Süre / Fiyat</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Durum</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {packages.map(pkg => (
              <tr key={pkg.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    {pkg.imageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/10 flex-shrink-0">
                        <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-surface-container border border-outline-variant/10 flex items-center justify-center text-outline flex-shrink-0">
                        <span className="material-symbols-outlined">image</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-primary font-headline text-lg">{pkg.title}</p>
                        {pkg.isPopular && <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Popüler</span>}
                      </div>
                      <p className="text-xs text-outline line-clamp-1 max-w-sm">{pkg.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-primary">{pkg.duration}</p>
                  <p className="text-sm font-medium text-secondary">{pkg.price} {pkg.currency}</p>
                </td>
                <td className="px-8 py-6">
                  {pkg.published ? 
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Yayında</span> : 
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Taslak</span>
                  }
                </td>
                <td className="px-8 py-6 text-right flex items-center justify-end gap-2 h-full min-h-[5rem]">
                  <button onClick={() => handleEdit(pkg)} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all">
                    <span className="material-symbols-outlined text-lg block">edit</span>
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all">
                    <span className="material-symbols-outlined text-lg block">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr><td colSpan={4} className="text-center py-16 text-outline font-medium">
                Sistemde hiç paket bulunmuyor. Lütfen yeni bir tane ekleyin.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
