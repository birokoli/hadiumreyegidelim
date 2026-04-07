export const dynamic = 'force-dynamic';

import React from "react";
import BrandImageFallback from "@/components/ui/BrandImageFallback";

async function fetchMediaFiles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/uploads`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prefix: "",
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" }
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error("Storage fetch failed", await res.text());
      return [];
    }

    const files = await res.json();
    return files.filter((f: any) => f.name !== '.emptyFolderPlaceholder' && f.metadata); // Sadece gerçek dosyaları al
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function MediaPage() {
  const mediaFiles = await fetchMediaFiles();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="pt-20 p-8 min-h-screen bg-surface">
      {/* Header Section */}
      <section className="mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <p className="text-tertiary font-label text-xs tracking-[0.2em] mb-2 font-bold uppercase">The Visual Archive</p>
          <h2 className="text-4xl font-serif text-primary leading-tight">Medya Kütüphanesi</h2>
          <p className="text-on-surface-variant mt-4 font-body leading-relaxed">
            Paketlere, otellere veya blog yazılarına yüklediğiniz tüm canlı görseller burada toplanmaktadır.
          </p>
        </div>
      </section>

      {/* Categories & Filter Bar */}
      <section className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold border-l-2 border-secondary">Tüm Görseller</button>
        </div>
        <div className="flex items-center gap-4 text-outline text-sm font-bold">
          <span className="material-symbols-outlined">filter_list</span>
          <span>Sıralama: En Yeniler ({mediaFiles.length} Görsel)</span>
        </div>
      </section>

      {/* UI Fallbacks Showcase */}
      <section className="mb-12 opacity-80">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif text-primary">Sistem Yedekleri (Fallbacks)</h3>
            <p className="text-sm text-on-surface-variant mt-1">Görsel yüklenmediği durumlarda uygulamaların çökmeyip otomatik renderladığı varsayılan logolar.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {[
            { title: "Paketler", category: "Umre", icon: "mosque" },
            { title: "Bloglar", category: "İçerik", icon: "menu_book" },
            { title: "Konaklama", category: "Config", icon: "hotel_class" },
            { title: "Transfer", category: "Config", icon: "directions_car" },
            { title: "Tren", category: "Config", icon: "train" },
            { title: "Turlar", category: "Config", icon: "tour" },
            { title: "Rehberler", category: "Config", icon: "record_voice_over" },
          ].map((item, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all border border-outline-variant/10 shadow-sm hover:shadow-lg hover:-translate-y-1">
              <div className="relative aspect-square">
                <BrandImageFallback icon={item.icon} iconSize={4} />
              </div>
              <div className="p-3 border-t border-primary/10 bg-primary/5">
                <span className="text-[9px] text-tertiary font-bold tracking-widest uppercase block mb-0.5">{item.category}</span>
                <h4 className="font-headline font-bold text-sm text-primary truncate">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Bento Grid Media Display */}
      <section className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-serif text-primary">Yüklenen Sistem Görselleri</h3>
      </section>
      
      {mediaFiles.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-outline-variant/40 rounded-3xl bg-surface-container-lowest">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">image_not_supported</span>
          <h3 className="text-xl font-bold text-primary mb-2">Henüz Medya Yok</h3>
          <p className="text-on-surface-variant">Sisteme herhangi bir paket veya blog görseli yüklenmemiş.</p>
        </div>
      ) : (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {mediaFiles.map((file: any, idx: number) => {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${file.name}`;
            const sizeKB = (file.metadata?.size / 1024).toFixed(1);
            const date = new Date(file.created_at).toLocaleDateString('tr-TR');
            
            // First item could be large for a Bento Grid feel
            const isLarge = idx === 0;

            return (
              <div key={file.id || file.name} className={`group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all border border-outline-variant/10 hover:shadow-xl hover:shadow-primary/10 ${isLarge ? 'col-span-2 row-span-2' : ''}`}>
                <div className={`relative ${isLarge ? 'h-96' : 'h-48'}`}>
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={publicUrl} alt={file.name}/>
                  {/* Subtle black overlay for text readability on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {isLarge ? (
                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] bg-primary text-white px-2 py-1 rounded inline-block font-bold mb-2">YENİ YÜKLEME</span>
                      <h3 className="text-white font-bold truncate text-xl">{file.name}</h3>
                      <p className="text-white/70 text-xs mt-1">{sizeKB} KB • {date}</p>
                    </div>
                  ) : (
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="text-white font-bold truncate text-sm">{file.name}</h4>
                      <p className="text-white/80 text-[10px] mt-1">{sizeKB} KB • {date}</p>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
