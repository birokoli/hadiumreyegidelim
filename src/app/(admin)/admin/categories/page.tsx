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
        handleCancel();
        fetchCategories();
      }
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (e) {}
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">Kategoriler yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">ICERIK STUDYOSU</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Kategori Yönetimi</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Blog makaleleri ve içerikler için kategorileri düzenleyin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">{showAdd ? "close" : "add"}</span>
            <span>{showAdd ? "İptal Et" : "Yeni Kategori Ekle"}</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="bg-zinc-50 border border-zinc-200 p-6 rounded space-y-4 text-xs">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-3">
            {editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Kategori Adı</label>
                <input
                  required
                  type="text"
                  value={newCategory.name}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Örn: Rehberler"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="rehberler"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Açıklama</label>
              <textarea
                rows={2}
                value={newCategory.description}
                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                {editingId ? 'GÜNCELLE' : 'KAYDET'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="px-4 py-3">Kategori Adı</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">İçerik Sayısı</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-zinc-900">{cat.name}</td>
                <td className="px-4 py-3 font-mono text-zinc-500">{cat.slug}</td>
                <td className="px-4 py-3 text-zinc-600">{cat._count?.posts || 0} Yazı</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(cat)} className="p-1 text-zinc-400 hover:text-zinc-900">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1 text-zinc-400 hover:text-red-600">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
