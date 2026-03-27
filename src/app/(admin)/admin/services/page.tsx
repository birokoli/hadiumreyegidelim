"use client";
import React, { useState, useEffect } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newService, setNewService] = useState({
    type: "HOTEL" as string,
    name: "",
    description: "",
    price: 0,
    extraData: ""
  });
  const [uploading, setUploading] = useState(false);
  const [extraFields, setExtraFields] = useState({
    images: [] as string[],
    amenities: "",
    departure: "",
    arrival: "",
    stops: 0,
    transferType: "SINGLE",
    routes: "",
    city: "Mekke (Makkah)",
    stars: 5,
    distanceMeters: 100,
    distanceText: "100m",
    transferCategory: "VIP",
    transferCapacity: 4
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMulti = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("headingSlug", newService.name || "service");

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            if (isMulti) {
              setExtraFields(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
              setExtraFields(prev => ({ ...prev, images: [data.url] }));
            }
          } else {
            alert("Yükleme hatası: " + data.error);
          }
        } catch (err) {
          console.error(err);
        }
    }
    setUploading(false);
    e.target.value = "";
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (extraData: string | null) => {
    if (!extraData) return null;
    if (extraData.startsWith('http') || extraData.startsWith('/')) return extraData;
    if (extraData.startsWith('{')) {
      try {
        const parsed = JSON.parse(extraData);
        if (parsed.images && parsed.images.length > 0) return parsed.images[0];
        if (parsed.image) return parsed.image;
      } catch { return null; }
    }
    return null;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNewService({ type: "HOTEL" as string, name: "", description: "", price: 0, extraData: "" });
    setExtraFields({ images: [], amenities: "", departure: "", arrival: "", stops: 0, transferType: "SINGLE", routes: "", city: "Mekke (Makkah)", stars: 5, distanceMeters: 100, distanceText: "100m", transferCategory: "VIP", transferCapacity: 4 });
    setShowAddForm(false);
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setNewService({
      type: service.type,
      name: service.name,
      description: service.description || "",
      price: service.price,
      extraData: service.extraData || ""
    });
    
    let parsed: any = {};
    if (service.extraData) {
      try { parsed = JSON.parse(service.extraData); } catch {}
    }
    
    setExtraFields({
      images: parsed.images || (parsed.image ? [parsed.image] : []),
      amenities: parsed.amenities || "",
      departure: parsed.departure || "",
      arrival: parsed.arrival || "",
      stops: parsed.stops || 0,
      transferType: parsed.transferType || "SINGLE",
      routes: parsed.routes || "",
      city: parsed.city || "Mekke (Makkah)",
      stars: parsed.stars || 5,
      distanceMeters: parsed.distanceMeters || 100,
      distanceText: parsed.distanceText || "100m",
      transferCategory: parsed.transferCategory || "VIP",
      transferCapacity: parsed.transferCapacity || 4
    });
    
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalExtraData = "";
      if (newService.type === 'HOTEL') {
        finalExtraData = JSON.stringify({ 
           images: extraFields.images, 
           amenities: extraFields.amenities,
           city: extraFields.city,
           stars: extraFields.stars,
           distanceMeters: extraFields.distanceMeters,
           distanceText: extraFields.distanceText
        });
      } else if (newService.type === 'TRAIN') {
        finalExtraData = JSON.stringify({ image: extraFields.images[0] || "", departure: extraFields.departure, arrival: extraFields.arrival, stops: extraFields.stops });
      } else if (newService.type === 'TRANSFER') {
        finalExtraData = JSON.stringify({ image: extraFields.images[0] || "", transferType: extraFields.transferType, routes: extraFields.routes, transferCategory: extraFields.transferCategory, transferCapacity: extraFields.transferCapacity });
      } else {
        finalExtraData = extraFields.images[0] || ""; // For EXTRA
      }

      const payload = { ...newService, extraData: finalExtraData };
      if (editingId) {
        await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      resetForm();
      fetchServices();
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    try {
      await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (e) {
      alert("Silinirken hata oluştu.");
    }
  };

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Yükleniyor...</div>;

  return (
    <div className="pt-28 p-12 min-h-screen bg-surface">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] text-tertiary-fixed-dim uppercase">Operational Dashboard</span>
          <h2 className="text-4xl font-headline text-primary mt-2">Services Management</h2>
          <p className="text-on-surface-variant max-w-lg mt-4 font-light leading-relaxed">Refine the sanctuary experience by managing accommodations, aerial logistics, and sacred transfers.</p>
        </div>
        <button 
          onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
          className="flex items-center gap-2 bg-secondary text-on-primary px-6 py-3 rounded-lg hover:shadow-lg transition-all active:scale-95 font-semibold"
        >
          <span className="material-symbols-outlined">{showAddForm ? 'close' : 'add'}</span>
          {showAddForm ? 'İptal Et' : 'Yeni Servis Ekle'}
        </button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
        {["ALL", "HOTEL", "TRAIN", "TRANSFER", "FLIGHT", "EXTRA"].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-colors ${
              activeTab === tab 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {tab === "ALL" ? "Tümü" : tab}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="bg-surface-container border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-surface-container-highest px-8 py-5 border-b border-outline-variant/20 flex justify-between items-center">
            <h3 className="text-xl font-headline font-bold text-primary">{editingId ? "Servisi Düzenle" : "Yeni Servis Yapılandırması"}</h3>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">{newService.type}</span>
          </div>
          
          <form onSubmit={handleAdd} className="p-8">
            {/* CORE DETAILS */}
            <div className="mb-10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-outline mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-lg">info</span> Temel Bilgiler</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Kategori</label>
                  <select className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={newService.type} onChange={e => setNewService({...newService, type: e.target.value})}>
                    <option value="HOTEL">Konaklama (Hotel)</option>
                    <option value="TRAIN">Hızlı Tren</option>
                    <option value="TRANSFER">VIP Transfer</option>
                    <option value="FLIGHT">Uçuş</option>
                    <option value="EXTRA">Ekstra Hizmet</option>
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Başlık / İsim</label>
                  <input required placeholder="Örn: Swissôtel Makkah" className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Referans Fiyat (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold">$</span>
                    <input required type="number" step="any" className="w-full p-3.5 pl-8 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={newService.price || ""} onChange={e => setNewService({...newService, price: Number(e.target.value)})} />
                  </div>
                </div>
                
                <div className="md:col-span-12">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Detaylı Açıklama</label>
                  <textarea rows={3} placeholder="Müşteriye gösterilecek pazarlama metnini girin..." className="w-full p-4 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-y" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                </div>
              </div>
            </div>

            {/* DYNAMIC CONF */}
            <div className="mb-10 bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-lg">settings_applications</span> Kategoriye Özel Ayarlar</h4>

              {newService.type === 'HOTEL' && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Şehir</label>
                    <select className="w-full p-3 rounded-xl bg-surface border border-outline-variant/30" value={extraFields.city} onChange={e => setExtraFields({...extraFields, city: e.target.value})}>
                      <option value="Mekke (Makkah)">Mekke</option>
                      <option value="Medine (Al Madinah)">Medine</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Yıldız</label>
                    <input type="number" className="w-full p-3 rounded-xl bg-surface border border-outline-variant/30" value={extraFields.stars} onChange={e => setExtraFields({...extraFields, stars: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Mesafe (m)</label>
                    <input type="number" className="w-full p-3 rounded-xl bg-surface border border-outline-variant/30" value={extraFields.distanceMeters} onChange={e => setExtraFields({...extraFields, distanceMeters: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Mesafe Metni</label>
                    <input placeholder="Örn: 50m (Kabe avlusu)" className="w-full p-3 rounded-xl bg-surface border border-outline-variant/30" value={extraFields.distanceText} onChange={e => setExtraFields({...extraFields, distanceText: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 shadow-sm">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex justify-between items-center">
                      <span>Otel Görselleri</span>
                      <span className="text-primary text-[10px] font-bold bg-primary/10 px-2.5 py-1 rounded-full">{extraFields.images.length} eklendi</span>
                    </label>
                    
                    <div className="flex gap-4">
                      <label className={`w-28 h-28 flex-shrink-0 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary/30 text-primary cursor-pointer hover:bg-primary/5 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span className="material-symbols-outlined text-3xl mb-1">{uploading ? 'hourglass_empty' : 'add_photo_alternate'}</span>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-center leading-tight">{uploading ? 'Yükleniyor' : 'Görsel Seç'}</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                      </label>

                      <div className="flex-1 flex gap-3 overflow-x-auto snap-x hide-scrollbar py-1">
                        {extraFields.images.map((img, idx) => (
                           <div key={idx} className="relative group w-28 h-28 flex-shrink-0 snap-start">
                             <img src={img} className="w-full h-full object-cover rounded-xl shadow-sm border border-outline-variant/20" />
                             <button type="button" onClick={() => setExtraFields(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} className="absolute -top-2 -right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><span className="material-symbols-outlined text-[14px]">close</span></button>
                           </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-outline mt-4 bg-surface-container py-1.5 px-3 rounded text-center">* İlk resim kapak, diğerleri galeri olarak gösterilir.</p>
                  </div>

                  <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Tesis Özellikleri</label>
                    <p className="text-[11px] text-outline mb-4">Otelde bulunan imkanları virgülle ayırarak yazın.</p>
                    <textarea rows={4} placeholder="Örn: 7/24 Ring Servisi, Kabe Manzaralı, Ücretsiz İptal..." className="w-full flex-1 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none" value={extraFields.amenities} onChange={e => setExtraFields({...extraFields, amenities: e.target.value})} />
                  </div>
                </div>
                </>
              )}
              
              {newService.type === 'TRAIN' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Tren Görseli</label>
                    <label className="w-full h-28 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary/30 text-primary cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden relative bg-surface">
                      {extraFields.images[0] ? (
                        <img src={extraFields.images[0]} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-2xl mb-1">{uploading ? 'hourglass_empty' : 'upload'}</span>
                          <span className="text-[10px] font-bold tracking-widest uppercase">{uploading ? 'Yükleniyor' : 'Yükle'}</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                    </label>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Kalkış Noktası</label>
                    <input placeholder="Mekke, Cidde..." className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.departure} onChange={e => setExtraFields({...extraFields, departure: e.target.value})} />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Varış Noktası</label>
                    <input placeholder="Medine..." className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.arrival} onChange={e => setExtraFields({...extraFields, arrival: e.target.value})} />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Durak Sayısı</label>
                    <input type="number" min="0" className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.stops} onChange={e => setExtraFields({...extraFields, stops: Number(e.target.value)})} />
                  </div>
                </div>
              )}
              
              {newService.type === 'TRANSFER' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Araç Görseli</label>
                    <label className="w-full h-14 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary/30 text-primary cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden relative bg-surface">
                      {extraFields.images[0] ? (
                        <img src={extraFields.images[0]} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"><span className="material-symbols-outlined text-lg">{uploading ? 'hourglass_empty' : 'upload'}</span> {uploading ? 'Yükleniyor' : 'Görsel Yükle'}</span>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                    </label>
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Transfer Türü</label>
                    <select className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.transferType} onChange={e => setExtraFields({...extraFields, transferType: e.target.value})}>
                      <option value="SINGLE">Tek Yön</option>
                      <option value="ROUNDTRIP">Çift Yön</option>
                      <option value="MULTI">Çoklu Rota (Tur)</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Güzergah Bilgisi</label>
                    <input placeholder="Örn: Cidde Havalimanı -> Mekke Otel -> Medine" className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.routes} onChange={e => setExtraFields({...extraFields, routes: e.target.value})} />
                  </div>
                  
                  <div className="md:col-span-4 mt-4">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Araç Sınıfı</label>
                    <select className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.transferCategory} onChange={e => setExtraFields({...extraFields, transferCategory: e.target.value})}>
                      <option value="ECO_VIP">Eco VIP</option>
                      <option value="VIP">VIP</option>
                      <option value="VIP_PLUS">VIP+</option>
                    </select>
                  </div>

                  <div className="md:col-span-4 mt-4">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Maksimum Kapasite</label>
                    <input type="number" min="1" className="w-full p-3.5 rounded-xl bg-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" value={extraFields.transferCapacity} onChange={e => setExtraFields({...extraFields, transferCapacity: Number(e.target.value)})} />
                  </div>
                </div>
              )}
              
              {(newService.type === 'EXTRA' || newService.type === 'FLIGHT') && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Hizmet Görseli</label>
                    <label className="w-full h-24 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary/30 text-primary cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden relative bg-surface">
                      {extraFields.images[0] ? (
                        <img src={extraFields.images[0]} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-2xl mb-1">{uploading ? 'hourglass_empty' : 'upload'}</span>
                          <span className="text-[10px] font-bold tracking-widest uppercase">{uploading ? 'Yükleniyor' : 'Yükle'}</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                    </label>
                  </div>
                </div>
              )}
              
            </div>

            {/* Action Row */}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-outline-variant/20">
              <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-sm text-outline hover:bg-surface-container-high transition-colors">
                Vazgeç
              </button>
              <button type="submit" className="px-8 py-3 rounded-xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">save</span>
                {editingId ? "Değişiklikleri Kaydet" : "Sisteme Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_32px_64px_-12px_rgba(0,55,129,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Service Details</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Category</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Price</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {services.filter(s => activeTab === 'ALL' || s.type === activeTab).map(service => {
              const imgUrl = getImageUrl(service.extraData);
              return (
              <tr key={service.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-primary-container flex items-center justify-center text-on-primary">
                      {imgUrl ? (
                        <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          {service.type === 'HOTEL' && <span className="material-symbols-outlined">hotel</span>}
                          {service.type === 'FLIGHT' && <span className="material-symbols-outlined">flight</span>}
                          {service.type === 'TRANSFER' && <span className="material-symbols-outlined">directions_car</span>}
                          {service.type === 'TRAIN' && <span className="material-symbols-outlined">train</span>}
                          {service.type === 'EXTRA' && <span className="material-symbols-outlined">extension</span>}
                        </>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{service.name}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{service.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-semibold px-3 py-1 bg-primary-container/10 text-primary rounded-md">{service.type}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-primary">${service.price}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(service)} className="p-2 hover:bg-white rounded-lg transition-all text-primary"><span className="material-symbols-outlined text-lg">edit</span></button>
                    <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-white rounded-lg transition-all text-error"><span className="material-symbols-outlined text-lg">delete</span></button>
                  </div>
                </td>
              </tr>
              );
            })}
            {services.filter(s => activeTab === 'ALL' || s.type === activeTab).length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-outline">Henüz servis eklenmedi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
