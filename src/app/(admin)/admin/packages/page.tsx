"use client";
import React, { useState, useEffect } from "react";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pkgSearch, setPkgSearch] = useState("");
  const [selectedPkgs, setSelectedPkgs] = useState<Set<string>>(new Set());

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      try { const arr = JSON.parse(pkg.includes); if (Array.isArray(arr)) includesStr = arr.join(", "); } catch (e) {}
    }
    let galleryArr: string[] = [];
    if (pkg.gallery) {
      try { const arr = JSON.parse(pkg.gallery); if (Array.isArray(arr)) galleryArr = arr; } catch (e) {}
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newPackage,
      price: parseFloat(newPackage.price) || 0,
      includes: JSON.stringify(newPackage.includes.split(",").map(s => s.trim()).filter(Boolean)),
      gallery: JSON.stringify(newPackage.gallery),
    };

    try {
      const url = editingId ? `/api/packages?id=${editingId}` : "/api/packages";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
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
      }
    } catch (e) {}
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Paketler yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Operasyon</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Paket Yönetimi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Sitede gösterilecek Umre paketlerini, fiyatlarını ve içeriklerini yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">{showAdd ? "close" : "add"}</span>
            <span>{showAdd ? "İptal Et" : "Yeni Paket Ekle"}</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="admin-sheet-panel bg-surface-container-low border border-outline-variant/15 p-6 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/15 pb-3">
            {editingId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Paket Adı</label>
                <input
                  required
                  type="text"
                  value={newPackage.title}
                  onChange={e => setNewPackage({ ...newPackage, title: e.target.value })}
                  placeholder="Örn: Lüks İnziwa Umresi"
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newPackage.slug}
                  onChange={e => setNewPackage({ ...newPackage, slug: e.target.value })}
                  placeholder="luks-inziva-umresi"
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Başlangıç Fiyatı</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={newPackage.price}
                  onChange={e => setNewPackage({ ...newPackage, price: e.target.value })}
                  placeholder="1250"
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Para Birimi</label>
                <select
                  value={newPackage.currency}
                  onChange={e => setNewPackage({ ...newPackage, currency: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                >
                  <option value="USD">USD ($)</option>
                  <option value="SAR">SAR (ر.س)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Süre / Gün</label>
                <input
                  required
                  type="text"
                  value={newPackage.duration}
                  onChange={e => setNewPackage({ ...newPackage, duration: e.target.value })}
                  placeholder="7 Gece 8 Gün"
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-on-surface-variant font-bold mb-1">Açıklama</label>
              <textarea
                rows={3}
                value={newPackage.description}
                onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.isPopular}
                  onChange={e => setNewPackage({ ...newPackage, isPopular: e.target.checked })}
                  className="rounded border-outline-variant/40 text-primary focus:ring-primary/40"
                />
                <span className="text-xs font-bold text-on-surface-variant">Popüler Paket</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.published}
                  onChange={e => setNewPackage({ ...newPackage, published: e.target.checked })}
                  className="rounded border-outline-variant/40 text-primary focus:ring-primary/40"
                />
                <span className="text-xs font-bold text-on-surface-variant">Yayında</span>
              </label>
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

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Paket adı ile ara..."
            value={pkgSearch}
            onChange={e => setPkgSearch(e.target.value)}
            className="w-full bg-surface-container-lowest text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/25 focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
            <tr>
              <th className="px-4 py-3">Paket Adı</th>
              <th className="px-4 py-3">Süre</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {packages.filter(pkg => !pkgSearch || pkg.title?.toLowerCase().includes(pkgSearch.toLowerCase())).map(pkg => (
              <tr key={pkg.id} className="hover:bg-primary/[0.03] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-on-surface">{pkg.title}</p>
                    {pkg.isPopular && (
                      <span className="bg-[#b8862f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">POPÜLER</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{pkg.duration}</td>
                <td className="px-4 py-3 font-mono font-bold text-primary">{pkg.price} {pkg.currency}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    pkg.published ? 'bg-secondary/10 text-secondary border-secondary/25' : 'bg-surface-container-low text-outline border-outline-variant/20'
                  }`}>
                    {pkg.published ? 'YAYINDA' : 'TASLAK'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(pkg)} className="p-1.5 text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-outline hover:text-error transition-colors">
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
