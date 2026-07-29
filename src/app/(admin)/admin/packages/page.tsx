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

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">Paketler yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">OPERASYON</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Paket Yönetimi</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Sitede gösterilecek Umre paketlerini, fiyatlarını ve içeriklerini yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">{showAdd ? "close" : "add"}</span>
            <span>{showAdd ? "İptal Et" : "Yeni Paket Ekle"}</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <section className="bg-zinc-50 border border-zinc-200 p-6 rounded space-y-6">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-3">
            {editingId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Paket Adı</label>
                <input
                  required
                  type="text"
                  value={newPackage.title}
                  onChange={e => setNewPackage({ ...newPackage, title: e.target.value })}
                  placeholder="Örn: Lüks İnziwa Umresi"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newPackage.slug}
                  onChange={e => setNewPackage({ ...newPackage, slug: e.target.value })}
                  placeholder="luks-inziva-umresi"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Başlangıç Fiyatı</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={newPackage.price}
                  onChange={e => setNewPackage({ ...newPackage, price: e.target.value })}
                  placeholder="1250"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Para Birimi</label>
                <select
                  value={newPackage.currency}
                  onChange={e => setNewPackage({ ...newPackage, currency: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="SAR">SAR (ر.س)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Süre / Gün</label>
                <input
                  required
                  type="text"
                  value={newPackage.duration}
                  onChange={e => setNewPackage({ ...newPackage, duration: e.target.value })}
                  placeholder="7 Gece 8 Gün"
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Açıklama</label>
              <textarea
                rows={3}
                value={newPackage.description}
                onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.isPopular}
                  onChange={e => setNewPackage({ ...newPackage, isPopular: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-xs font-medium text-zinc-700">Popüler Paket</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.published}
                  onChange={e => setNewPackage({ ...newPackage, published: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-xs font-medium text-zinc-700">Yayında</span>
              </label>
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

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Paket adı ile ara..."
            value={pkgSearch}
            onChange={e => setPkgSearch(e.target.value)}
            className="w-full bg-white text-xs text-zinc-900 rounded pl-8 pr-3 py-1.5 border border-zinc-200 focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="px-4 py-3">Paket Adı</th>
              <th className="px-4 py-3">Süre</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {packages.filter(pkg => !pkgSearch || pkg.title?.toLowerCase().includes(pkgSearch.toLowerCase())).map(pkg => (
              <tr key={pkg.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900">{pkg.title}</p>
                    {pkg.isPopular && (
                      <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">POPÜLER</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-500">{pkg.duration}</td>
                <td className="px-4 py-3 font-mono font-bold text-zinc-900">{pkg.price} {pkg.currency}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    pkg.published ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                  }`}>
                    {pkg.published ? 'YAYINDA' : 'TASLAK'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleEdit(pkg)} className="p-1 text-zinc-400 hover:text-zinc-900">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-1 text-zinc-400 hover:text-red-600">
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
