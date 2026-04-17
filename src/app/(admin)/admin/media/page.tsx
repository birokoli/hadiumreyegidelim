"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type MediaFile = {
  id: string;
  name: string;
  metadata: { size: number; mimetype: string };
  created_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "other">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setFiles(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const publicUrl = (name: string) => `${SUPABASE_URL}/storage/v1/object/public/uploads/${name}`;

  const copyUrl = (file: MediaFile) => {
    const url = publicUrl(file.name);
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`"${file.name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    setDeleting(file.id);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });
      if (res.ok) { setFiles(prev => prev.filter(f => f.id !== file.id)); }
      else { const d = await res.json(); alert("Silinemedi: " + (d.error || "Bilinmeyen hata")); }
    } catch { alert("Ağ hatası."); }
    finally { setDeleting(null); }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} dosya silinsin mi?`)) return;
    const toDelete = files.filter(f => selected.has(f.id));
    for (const file of toDelete) {
      await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });
    }
    setFiles(prev => prev.filter(f => !selected.has(f.id)));
    setSelected(new Set());
  };

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("headingSlug", "medya-kutuphanesi");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.success) alert(`"${file.name}" yüklenemedi: ${data.error || ""}`);
      }
      await fetchFiles();
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = files.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const mime = f.metadata?.mimetype || "";
    const matchFilter =
      filter === "all" ||
      (filter === "image" && mime.startsWith("image/")) ||
      (filter === "other" && !mime.startsWith("image/"));
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary block mb-1">Medya Yönetimi</span>
          <h1 className="text-3xl font-headline font-bold text-primary">Medya Kütüphanesi</h1>
          <p className="text-sm text-on-surface-variant mt-1">{files.length} dosya · Supabase Storage</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={deleteSelected} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              {selected.size} Seçiliyi Sil
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#002f6c] transition-colors shadow-sm disabled:opacity-60"
          >
            {uploading ? (
              <><span className="material-symbols-outlined text-[18px] animate-spin">sync</span> Yükleniyor...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">cloud_upload</span> Yükle</>
            )}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.webp" className="hidden" onChange={e => uploadFiles(e.target.files)} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            placeholder="Dosya adı ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-outline-variant/20 rounded-xl p-1">
          {(["all", "image", "other"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              {f === "all" ? "Tümü" : f === "image" ? "Görseller" : "Diğer"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-outline-variant/20 rounded-xl p-1">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-all ${view === "grid" ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-all ${view === "list" ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-[18px]">view_list</span>
          </button>
        </div>
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            Seçimi Temizle
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all cursor-pointer ${dragging ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-lowest'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="material-symbols-outlined text-3xl text-outline mb-2 block">cloud_upload</span>
        <p className="text-sm font-bold text-on-surface-variant">{dragging ? 'Dosyaları bırakın' : 'Sürükle-bırak veya tıklayarak yükle'}</p>
        <p className="text-xs text-outline mt-1">PNG, JPG, WebP, PDF desteklenir · Çoklu seçim</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline-variant/30 rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">image_not_supported</span>
          <p className="font-bold text-primary">{search ? 'Arama sonucu yok' : 'Henüz dosya yok'}</p>
          <p className="text-sm text-on-surface-variant mt-1">{search ? 'Farklı anahtar kelime deneyin' : 'Yukarıdan yeni dosya yükleyin'}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(file => {
            const url = publicUrl(file.name);
            const mime = file.metadata?.mimetype || "";
            const isImage = mime.startsWith("image/");
            const isSelected = selected.has(file.id);
            const isCopied = copiedId === file.id;
            const isDeleting = deleting === file.id;
            const date = new Date(file.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

            return (
              <div
                key={file.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all hover:shadow-lg cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-outline-variant/10 hover:border-primary/30'}`}
              >
                {/* Checkbox */}
                <div
                  className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-primary opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}
                  onClick={() => toggleSelect(file.id)}
                >
                  <span className="material-symbols-outlined text-white text-[14px]">{isSelected ? 'check' : ''}</span>
                </div>

                {/* Image/Icon */}
                <div className="aspect-square bg-surface-container-low" onClick={() => toggleSelect(file.id)}>
                  {isImage ? (
                    <img src={url} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-outline">description</span>
                    </div>
                  )}
                </div>

                {/* Info + Actions */}
                <div className="p-2.5">
                  <p className="text-[10px] font-bold text-primary truncate" title={file.name}>{file.name}</p>
                  <p className="text-[9px] text-outline mt-0.5">{formatSize(file.metadata?.size || 0)} · {date}</p>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => copyUrl(file)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold transition-all ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/8 text-primary hover:bg-primary/15'}`}
                      title="URL'yi Kopyala"
                    >
                      <span className="material-symbols-outlined text-[12px]">{isCopied ? 'check' : 'content_copy'}</span>
                      {isCopied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Aç">
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                    <button
                      onClick={() => deleteFile(file)}
                      disabled={isDeleting}
                      className="p-1 bg-surface-container text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all disabled:opacity-40"
                      title="Sil"
                    >
                      <span className="material-symbols-outlined text-[14px]">{isDeleting ? 'hourglass_empty' : 'delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List view
        <div className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="p-4 w-10"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(f => f.id)) : new Set())} /></th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline">Dosya</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline hidden sm:table-cell">Boyut</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline hidden md:table-cell">Tarih</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.map(file => {
                const url = publicUrl(file.name);
                const isImage = (file.metadata?.mimetype || "").startsWith("image/");
                const isCopied = copiedId === file.id;
                const isDeleting = deleting === file.id;
                const date = new Date(file.created_at).toLocaleDateString("tr-TR");
                return (
                  <tr key={file.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                          {isImage ? (
                            <img src={url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[20px] text-outline">description</span></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-primary truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] text-outline">{file.metadata?.mimetype || "?"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant hidden sm:table-cell">{formatSize(file.metadata?.size || 0)}</td>
                    <td className="p-4 text-sm text-on-surface-variant hidden md:table-cell">{date}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => copyUrl(file)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/8 text-primary hover:bg-primary/15'}`}>
                          <span className="material-symbols-outlined text-[14px]">{isCopied ? 'check' : 'content_copy'}</span>
                          {isCopied ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </a>
                        <button onClick={() => deleteFile(file)} disabled={isDeleting} className="p-1.5 bg-surface-container text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all disabled:opacity-40">
                          <span className="material-symbols-outlined text-[16px]">{isDeleting ? 'hourglass_empty' : 'delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
