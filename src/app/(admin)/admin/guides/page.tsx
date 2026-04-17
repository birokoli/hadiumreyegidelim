"use client";
import React, { useState, useEffect } from "react";

const emptyGuide = {
  name: "", title: "", price: 0, image: "", slug: "",
  biography: "", quote: "", youtubeUrl: "", expertise: "",
  publications: "", linkedPackages: [] as string[],
};

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...emptyGuide });

  const fetchAll = async () => {
    try {
      const [gRes, pRes] = await Promise.all([fetch('/api/guides'), fetch('/api/packages')]);
      const [gData, pData] = await Promise.all([gRes.json(), pRes.json()]);
      if (Array.isArray(gData)) setGuides(gData);
      if (Array.isArray(pData)) setPackages(pData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm({ ...emptyGuide }); setEditingId(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openEdit = (guide: any) => {
    let lp: string[] = [];
    if (guide.linkedPackages) { try { lp = JSON.parse(guide.linkedPackages); } catch {} }
    setForm({
      name: guide.name || "", title: guide.title || "", price: guide.price || 0,
      image: guide.image || "", slug: guide.slug || "", biography: guide.biography || "",
      quote: guide.quote || "", youtubeUrl: guide.youtubeUrl || "",
      expertise: guide.expertise || "", publications: guide.publications || "",
      linkedPackages: lp,
    });
    setEditingId(guide.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm({ ...emptyGuide }); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("headingSlug", "rehber");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) setForm(prev => ({ ...prev, image: data.url }));
      else alert("Resim yüklenemedi: " + data.error);
    } catch { alert("Yükleme hatası."); }
    finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/guides?id=${editingId}` : '/api/guides';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (res.ok) { closeForm(); fetchAll(); }
      else alert("Kaydetme hatası.");
    } catch { alert("Hata oluştu."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    try {
      await fetch(`/api/guides?id=${id}`, { method: 'DELETE' });
      fetchAll();
    } catch { alert("Silinirken hata oluştu."); }
  };

  const togglePackage = (pkgId: string) => {
    setForm(prev => ({
      ...prev,
      linkedPackages: prev.linkedPackages.includes(pkgId)
        ? prev.linkedPackages.filter(id => id !== pkgId)
        : [...prev.linkedPackages, pkgId],
    }));
  };

  const filtered = guides.filter(g =>
    !search || g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Yükleniyor...</div>;

  return (
    <div className="pt-28 px-6 lg:px-12 pb-20 bg-surface min-h-screen">
      {/* Header */}
      <section className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="max-w-2xl">
          <span className="text-tertiary-fixed-dim font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Yönetim Paneli</span>
          <h2 className="text-4xl font-headline font-bold text-primary mb-3">Rehberler & Akademik Kadro</h2>
          <p className="text-on-surface-variant leading-relaxed">Siyer uzmanları, tarihçiler ve rehberlerin profillerini yönetin.</p>
        </div>
        <button
          onClick={() => showForm ? closeForm() : openAdd()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#002f6c] transition-colors shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'İptal Et' : 'Yeni Rehber Ekle'}
        </button>
      </section>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-outline-variant/20 rounded-2xl p-8 mb-10 shadow-sm space-y-6">
          <h3 className="text-2xl font-bold text-primary border-b border-outline-variant/20 pb-4">
            {editingId ? 'Rehberi Düzenle' : 'Yeni Rehber Ekle'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">İsim Soyisim *</label>
              <input required className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">Ünvan/Rol *</label>
              <input required className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">Ek Ücret (USD) *</label>
              <input required type="number" className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-outline mb-1 block font-bold uppercase tracking-wider">Profil Fotoğrafı</label>
              <p className="text-[9px] text-outline mb-1.5">Önerilen: 800×1000px (4:5 dikey)</p>
              <input type="file" accept="image/jpeg, image/png" className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={handleImageUpload} disabled={uploadingImage} />
              {uploadingImage && <span className="text-[10px] text-primary mt-1 block">Yükleniyor...</span>}
              {form.image && !uploadingImage && (
                <div className="mt-2 relative inline-block">
                  <img src={form.image} alt="Preview" className="h-16 w-12 object-cover rounded-lg border border-outline-variant/30" />
                  <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">URL Slug (boş bırakın — otomatik)</label>
              <input className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="ornek-slug" />
            </div>
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">YouTube Sohbet Linki</label>
              <input className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtu.be/..." />
            </div>
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">Uzmanlık Alanları (virgülle ayırın)</label>
              <input className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Siyer, İslam Tarihi, Fıkıh" value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">Özlü Söz</label>
              <textarea rows={2} className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none" value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">Akademik Yayınlar (Her biri yeni satırda)</label>
            <textarea rows={3} className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none" value={form.publications} onChange={e => setForm({ ...form, publications: e.target.value })} placeholder="2023 - Kitap Adı" />
          </div>

          <div>
            <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">Biyografi</label>
            <textarea rows={5} className="w-full p-3 rounded-xl bg-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none" value={form.biography} onChange={e => setForm({ ...form, biography: e.target.value })} />
          </div>

          {/* Package Links - Manual Selection */}
          {packages.length > 0 && (
            <div>
              <label className="text-xs text-outline mb-1.5 block font-bold uppercase tracking-wider">
                İlgili Paketler (İsteğe Bağlı)
                <span className="ml-2 text-[10px] text-on-surface-variant font-normal normal-case">Seçilmezse sitede gösterilmez</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => togglePackage(pkg.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      form.linkedPackages.includes(pkg.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    {form.linkedPackages.includes(pkg.id) && <span className="material-symbols-outlined text-[12px] mr-1">check</span>}
                    {pkg.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button type="button" onClick={closeForm} className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-colors">İptal</button>
            <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#002f6c] transition-all shadow-md active:scale-95">
              {editingId ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            placeholder="İsim veya ünvan ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <span className="text-sm text-on-surface-variant">{filtered.length} rehber</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(guide => {
          let lp: string[] = [];
          if (guide.linkedPackages) { try { lp = JSON.parse(guide.linkedPackages); } catch {} }
          const linkedPkgs = packages.filter(p => lp.includes(p.id));
          return (
            <div key={guide.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-md transition-all group">
              <div className="relative h-56 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={guide.image || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                  alt={guide.name}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-tertiary text-white text-[10px] font-bold px-2.5 py-1 tracking-widest uppercase rounded">{guide.title}</span>
                </div>
                {/* Edit/Delete overlay */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(guide)} className="p-2 bg-white/90 backdrop-blur text-primary hover:bg-primary hover:text-white rounded-lg transition-all shadow-sm" title="Düzenle">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(guide.id)} className="p-2 bg-white/90 backdrop-blur text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm" title="Sil">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-headline font-bold text-primary mb-1">{guide.name}</h3>
                <p className="text-sm text-on-surface-variant mb-3">Ek Ücret: <span className="font-bold text-secondary">${guide.price}</span></p>
                {linkedPkgs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {linkedPkgs.map(pkg => (
                      <span key={pkg.id} className="text-[10px] bg-primary/8 text-primary font-bold px-2 py-0.5 rounded border border-primary/10">{pkg.title}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-end mt-4 pt-4 border-t border-outline-variant/10">
                  <button onClick={() => openEdit(guide)} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-[#002f6c] transition-colors">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-outline">
            {search ? 'Arama sonucu bulunamadı.' : 'Henüz rehber eklenmemiş.'}
          </div>
        )}
      </div>
    </div>
  );
}
