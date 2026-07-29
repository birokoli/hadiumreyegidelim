"use client";
import React, { useState, useEffect } from "react";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    bio: "",
    image: "",
    expertise: "",
    linkedin: "",
    twitter: "",
  });

  const fetchAuthors = async () => {
    try {
      const res = await fetch(`/api/authors?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setAuthors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleCancel = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewAuthor({ name: "", bio: "", image: "", expertise: "", linkedin: "", twitter: "" });
  };

  const handleEdit = (aut: any) => {
    setEditingId(aut.id);
    setNewAuthor({
      name: aut.name || "",
      bio: aut.bio || "",
      image: aut.image || "",
      expertise: aut.expertise || "",
      linkedin: aut.linkedin || "",
      twitter: aut.twitter || "",
    });
    setShowAdd(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/authors?id=${editingId}` : "/api/authors";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAuthor),
      });

      if (res.ok) {
        handleCancel();
        fetchAuthors();
      }
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu yazarı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/authors?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchAuthors();
    } catch (e) {}
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">Yazarlar yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">ICERIK STUDYOSU</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Yazar Yönetimi (E-E-A-T)</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Uzman yazarları ve profil biyografilerini yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">{showAdd ? "close" : "add"}</span>
            <span>{showAdd ? "İptal Et" : "Yeni Yazar Ekle"}</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="bg-zinc-50 border border-zinc-200 p-6 rounded space-y-4 text-xs">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-3">
            {editingId ? 'Yazarı Düzenle' : 'Yeni Yazar Ekle'}
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Ad Soyad</label>
                <input
                  required
                  type="text"
                  value={newAuthor.name}
                  onChange={e => setNewAuthor({ ...newAuthor, name: e.target.value })}
                  placeholder="Yasin Toktaş"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Uzmanlık Alanı</label>
                <input
                  type="text"
                  value={newAuthor.expertise}
                  onChange={e => setNewAuthor({ ...newAuthor, expertise: e.target.value })}
                  placeholder="Umre Operasyon Direktörü"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Biyografi</label>
              <textarea
                rows={2}
                value={newAuthor.bio}
                onChange={e => setNewAuthor({ ...newAuthor, bio: e.target.value })}
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
              <th className="px-4 py-3">Yazar Adı</th>
              <th className="px-4 py-3">Uzmanlık</th>
              <th className="px-4 py-3">Yayınlanan Yazı</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {authors.map(aut => (
              <tr key={aut.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-zinc-900">{aut.name}</td>
                <td className="px-4 py-3 text-zinc-500">{aut.expertise || "-"}</td>
                <td className="px-4 py-3 text-zinc-600">{aut._count?.posts || 0} Yazı</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(aut)} className="p-1 text-zinc-400 hover:text-zinc-900">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(aut.id)} className="p-1 text-zinc-400 hover:text-red-600">
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
