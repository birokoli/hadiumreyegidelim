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

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Yazarlar yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">ICERIK STUDYOSU</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Yazar Yönetimi (E-E-A-T)</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Uzman yazarları ve profil biyografilerini yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">{showAdd ? "close" : "add"}</span>
            <span>{showAdd ? "İptal Et" : "Yeni Yazar Ekle"}</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="admin-sheet-panel bg-surface-container-low border border-outline-variant/15 p-6 rounded-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/15 pb-3">
            {editingId ? 'Yazarı Düzenle' : 'Yeni Yazar Ekle'}
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Ad Soyad</label>
                <input
                  required
                  type="text"
                  value={newAuthor.name}
                  onChange={e => setNewAuthor({ ...newAuthor, name: e.target.value })}
                  placeholder="Yasin Toktaş"
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Uzmanlık Alanı</label>
                <input
                  type="text"
                  value={newAuthor.expertise}
                  onChange={e => setNewAuthor({ ...newAuthor, expertise: e.target.value })}
                  placeholder="Umre Operasyon Direktörü"
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-on-surface-variant font-bold mb-1">Biyografi</label>
              <textarea
                rows={2}
                value={newAuthor.bio}
                onChange={e => setNewAuthor({ ...newAuthor, bio: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all active:scale-95"
              >
                {editingId ? 'GÜNCELLE' : 'KAYDET'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
            <tr>
              <th className="px-4 py-3">Yazar Adı</th>
              <th className="px-4 py-3">Uzmanlık</th>
              <th className="px-4 py-3">Yayınlanan Yazı</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {authors.map(aut => (
              <tr key={aut.id} className="hover:bg-primary/[0.03] transition-colors">
                <td className="px-4 py-3 font-bold text-on-surface">{aut.name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{aut.expertise || "-"}</td>
                <td className="px-4 py-3 text-on-surface-variant">{aut._count?.posts || 0} Yazı</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(aut)} className="p-1.5 text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(aut.id)} className="p-1.5 text-outline hover:text-error transition-colors">
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
