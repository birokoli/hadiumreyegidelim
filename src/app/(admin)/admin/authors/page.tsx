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

  const handleEdit = (author: any) => {
    setEditingId(author.id);
    setNewAuthor({
      name: author.name || "",
      bio: author.bio || "",
      image: author.image || "",
      expertise: author.expertise || "",
      linkedin: author.linkedin || "",
      twitter: author.twitter || "",
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        alert(editingId ? "Yazar başarıyla güncellendi!" : "Yazar başarıyla eklendi!");
        handleCancel();
        fetchAuthors();
      } else {
        alert("Kaydedilirken hata oluştu.");
      }
    } catch (e) {
      alert("Sunucu hatası.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu yazarı silmek istediğinize emin misiniz? (Yazar silindiğinde bağlandığı blog yazılarının yazar bilgisi boş kalacaktır)")) return;
    try {
      const res = await fetch(`/api/authors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAuthors();
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
          <span className="text-tertiary font-label text-[10px] tracking-[0.3em] uppercase block mb-2">Google E-E-A-T SEO</span>
          <h2 className="font-headline text-4xl font-light text-primary tracking-tight">Yazar Yönetimi</h2>
          <p className="text-sm text-on-surface-variant mt-2 font-light">Site içerisindeki içerik üreticilerinin uzmanlık (Expertise) ve profillerini yönetin.</p>
        </div>
        <button 
          onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-primary-container hover:text-primary transition-all shadow-lg flex items-center gap-2"
        >
          {showAdd ? <><span className="material-symbols-outlined text-[18px]">close</span> İptal Et</> : <><span className="material-symbols-outlined text-[18px]">add</span> Yeni Yazar Ekle</>}
        </button>
      </header>

      {showAdd && (
        <section className="bg-surface-container p-12 rounded-2xl relative overflow-hidden mb-12 shadow-sm border border-outline-variant/10">
          <form onSubmit={handleCreate} className="relative z-10 w-full space-y-8 max-w-4xl">
            <h3 className="font-headline text-3xl text-primary border-b border-outline-variant/20 pb-4 mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">badge</span>
              {editingId ? 'Yazar Düzenle' : 'Yazar Detayları'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ad Soyad (Yazar Adı) <span className="text-error font-normal">*</span></label>
                <input required className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none font-bold" 
                  value={newAuthor.name} onChange={e => setNewAuthor({...newAuthor, name: e.target.value})} placeholder="Örn: Dr. Ahmet Yılmaz" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uzmanlık Alanı (Expertise)</label>
                <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newAuthor.expertise} onChange={e => setNewAuthor({...newAuthor, expertise: e.target.value})} placeholder="Örn: İlahiyatçı, Hac & Umre Rehberi" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Yazar Profil Görseli URL</span>
                <span className="text-[10px] font-normal italic lowercase">(Kare profil fotoğrafı önerilir)</span>
              </label>
              <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary focus:border-primary outline-none" 
                value={newAuthor.image} onChange={e => setNewAuthor({...newAuthor, image: e.target.value})} placeholder="https://example.com/profil.jpg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn Profil Linki</label>
                <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newAuthor.linkedin} onChange={e => setNewAuthor({...newAuthor, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Twitter (X) Profil Linki</label>
                <input className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary focus:border-primary outline-none" 
                  value={newAuthor.twitter} onChange={e => setNewAuthor({...newAuthor, twitter: e.target.value})} placeholder="https://twitter.com/..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biyografi (Hakkında)</label>
              <textarea className="w-full bg-white border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface-variant min-h-[120px] focus:ring-primary focus:border-primary outline-none" 
                value={newAuthor.bio} onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})} placeholder="Yazarın sektörel deneyimini ve özgeçmişini kısaca özetleyin..." />
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
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase w-16">Profil</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Yazar Bilgileri</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Uzmanlık</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Yazı Sayısı</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {authors.map(author => (
              <tr key={author.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-6">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                     {author.image ? <img src={author.image} className="w-full h-full object-cover" alt={author.name} /> : author.name.charAt(0)}
                   </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-primary font-headline text-lg mb-1">{author.name}</p>
                  <p className="text-xs text-outline line-clamp-1 max-w-sm">{author.bio}</p>
                </td>
                <td className="px-8 py-6 text-sm text-on-surface-variant">
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold tracking-widest">{author.expertise || "Belirtilmedi"}</span>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-primary">
                  {author._count?.posts || 0}
                </td>
                <td className="px-8 py-6 text-right flex items-center justify-end gap-2 h-full py-auto mt-4">
                  <button onClick={() => handleEdit(author)} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all" title="Düzenle">
                    <span className="material-symbols-outlined text-lg block">edit</span>
                  </button>
                  <button onClick={() => handleDelete(author.id)} className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all" title="Sil">
                    <span className="material-symbols-outlined text-lg block">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr><td colSpan={5} className="text-center py-16 text-outline font-medium">
                Henüz yazar yazar eklemediniz. "Yeni Yazar Ekle" butonuna tıklayarak ilk yazarınızı ekleyin.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
