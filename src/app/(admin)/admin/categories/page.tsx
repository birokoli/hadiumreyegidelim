"use client";
import React, { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCancel = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewCategory({ name: "", slug: "", description: "" });
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setNewCategory({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugToUse = newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = { ...newCategory, slug: slugToUse };
      
      const url = editingId ? `/api/categories?id=${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(editingId ? "Kategori başarıyla güncellendi!" : "Kategori başarıyla eklendi!");
        handleCancel();
        fetchCategories();
      } else {
        alert("Kaydedilirken hata oluştu.");
      }
    } catch (e) {
      alert("Sunucu hatası.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz? (Bağlı blog yazılarından kategori silinir)")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
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
          <span className="text-tertiary font-label text-[10px] tracking-[0.3em] uppercase block mb-2">Manevi Yönetim</span>
          <h2 className="font-headline text-4xl font-light text-primary tracking-tight">Kategori Yönetimi</h2>
          <p className="text-sm text-on-surface-variant mt-2 font-light">Blog içeriklerinizi gruplamak için kategoriler oluşturun ve yönetin.</p>
        </div>
        <button 
          onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-primary-container hover:text-primary transition-all shadow-lg flex items-center gap-2"
        >
          {showAdd ? <><span className="material-symbols-outlined text-[18px]">close</span> İptal Et</> : <><span className="material-symbols-outlined text-[18px]">add</span> Yeni Kategori Ekle</>}
        </button>
      </header>

      {showAdd && (
        <section className="bg-surface-container p-12 rounded-2xl relative overflow-hidden mb-12 shadow-sm border border-outline-variant/10">
          <form onSubmit={handleCreate} className="relative z-10 w-full space-y-8 max-w-3xl">
            <h3 className="font-headline text-3xl text-primary border-b border-outline-variant/20 pb-4 mb-8">
              {editingId ? 'Kategori Düzenle' : 'Kategori Detayları'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Adı</label>
                <input required className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none font-bold" 
                  value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="Örn: Medine Ziyaretleri" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Slug</label>
                <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newCategory.slug} onChange={e => setNewCategory({...newCategory, slug: e.target.value})} placeholder="medine-ziyaretleri" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Açıklama</label>
              <textarea className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface-variant min-h-[100px] focus:ring-primary focus:border-primary outline-none" 
                value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} placeholder="Kategori için kısa bir açıklama..." />
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
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Kategori Adı</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Açıklama</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Yazı Sayısı</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {categories.map(cat => (
              <tr key={cat.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-primary font-headline text-lg mb-1">{cat.name}</p>
                  <p className="text-xs text-outline">{cat.slug}</p>
                </td>
                <td className="px-8 py-6 text-sm text-on-surface-variant max-w-sm">
                  {cat.description || '-'}
                </td>
                <td className="px-8 py-6 text-sm font-bold text-primary">
                  {cat._count?.posts || 0}
                </td>
                <td className="px-8 py-6 text-right flex items-center justify-end gap-2 h-full">
                  <button onClick={() => handleEdit(cat)} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all">
                    <span className="material-symbols-outlined text-lg block">edit</span>
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all">
                    <span className="material-symbols-outlined text-lg block">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="text-center py-16 text-outline font-medium">
                Henüz kategori eklemediniz.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
