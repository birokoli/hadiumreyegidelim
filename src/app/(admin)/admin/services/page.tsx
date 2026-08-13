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

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNewService({ type: "HOTEL" as string, name: "", description: "", price: 0, extraData: "" });
    setShowAddForm(false);
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setNewService({
      type: service.type,
      name: service.name,
      description: service.description || "",
      price: service.price || 0,
      extraData: service.extraData || ""
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu servisi silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/services?id=${editingId}` : '/api/services';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        resetForm();
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredServices = services.filter(s => activeTab === "ALL" || s.type === activeTab);

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Servisler yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Operasyonel Servisler</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Ek Hizmetler Yönetimi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Konaklama, tren, transfer ve uçuş kalemlerini yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">{showAddForm ? "close" : "add"}</span>
            <span>{showAddForm ? "İptal Et" : "Yeni Servis Ekle"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-3 overflow-x-auto">
        {["ALL", "HOTEL", "TRAIN", "TRANSFER", "FLIGHT", "EXTRA"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
              activeTab === tab
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
            }`}
          >
            {tab === "ALL" ? "Tümü" : tab}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-on-surface border-b border-outline-variant/15 pb-3">
            {editingId ? "Servisi Düzenle" : "Yeni Servis Ekle"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-on-surface-variant font-bold mb-1">Kategori</label>
              <select
                value={newService.type}
                onChange={e => setNewService({ ...newService, type: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
              >
                <option value="HOTEL">Konaklama (Hotel)</option>
                <option value="TRAIN">Hızlı Tren</option>
                <option value="TRANSFER">VIP Transfer</option>
                <option value="FLIGHT">Uçuş</option>
                <option value="EXTRA">Ekstra Hizmet</option>
              </select>
            </div>

            <div>
              <label className="block text-on-surface-variant font-bold mb-1">Servis Adı</label>
              <input
                required
                type="text"
                value={newService.name}
                onChange={e => setNewService({ ...newService, name: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-bold mb-1">Fiyat ($)</label>
              <input
                required
                type="number"
                step="any"
                value={newService.price}
                onChange={e => setNewService({ ...newService, price: Number(e.target.value) })}
                className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-on-surface-variant font-bold mb-1">Açıklama</label>
            <textarea
              rows={2}
              value={newService.description}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all active:scale-95"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        {filteredServices.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            Kayıtlı servis bulunamadı.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Servis Detayı</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredServices.map(svc => (
                <tr key={svc.id} className="hover:bg-primary/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-on-surface">{svc.name}</p>
                    {svc.description && <p className="text-[11px] text-outline mt-0.5">{svc.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold bg-primary/[0.08] text-primary px-2 py-0.5 rounded-full">
                      {svc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">${svc.price || 0}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(svc)} className="p-1.5 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(svc.id)} className="p-1.5 text-outline hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
