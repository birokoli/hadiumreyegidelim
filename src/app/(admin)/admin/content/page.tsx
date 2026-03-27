"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Rich text editörü Server-Side Rendering'de hata vermemesi için Next/Dynamic ile sarmalıyoruz
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-surface-container rounded-xl border border-outline-variant/30 text-outline">Gelişmiş Editör Yükleniyor...</div> 
});

const MediaUploader = ({ title, slug, onUploadComplete, currentUrl }: { title: string, slug: string, onUploadComplete: (url: string) => void, currentUrl: string }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("headingSlug", slug);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) onUploadComplete(data.url);
      else alert("Hata: " + data.error);
    } catch {
      alert("Yükleme hatası.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-outline-variant/30 rounded-2xl p-6 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4 gap-4">
        <h4 className="font-headline font-bold text-primary text-[13px] leading-tight flex-1 line-clamp-3">{title}</h4>
        {currentUrl && <span className="bg-success/10 text-success text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">Hazır</span>}
      </div>
      {currentUrl ? (
        <div className="relative group rounded-xl overflow-hidden h-40 w-full mt-auto">
           <img src={currentUrl} className="w-full h-full object-cover" alt={title} />
           <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
             <button type="button" onClick={() => onUploadComplete("")} className="bg-white text-error p-3 rounded-full hover:scale-110 shadow-lg transition-transform"><span className="material-symbols-outlined text-[18px] block">delete</span></button>
           </div>
        </div>
      ) : (
        <label className={`flex flex-col flex-1 items-center justify-center min-h-[160px] border-2 border-dashed rounded-xl cursor-pointer transition-colors mt-auto ${uploading ? 'bg-primary/5 border-primary/20' : 'bg-surface hover:bg-surface-container border-outline-variant/40 hover:border-primary/30'}`}>
          {uploading ? (
             <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
          ) : (
             <div className="flex flex-col items-center text-outline">
               <span className="material-symbols-outlined text-3xl mb-3 opacity-60">add_photo_alternate</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">JPEG / PNG Seç</span>
             </div>
          )}
          <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
};

export default function ContentPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit'); // Preview mode toggle
  const [newPost, setNewPost] = useState({
    title: "",
    slug: "",
    description: "",
    keywords: "",
    focusKeyword: "",
    seoScore: 0,
    imageUrl: "",
    content: "",
    authorId: "",
    categoryId: "",
    personalExperience: "",
    references: "",
    published: true,
  });

  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Canlı SEO Skorlama Algoritması
  useEffect(() => {
    if (!newPost.focusKeyword) {
      setNewPost(prev => prev.seoScore !== 0 ? { ...prev, seoScore: 0 } : prev);
      return;
    }
    
    let score = 0;
    const keyword = newPost.focusKeyword.toLowerCase();
    const title = newPost.title.toLowerCase();
    const description = (newPost.description || "").toLowerCase();
    const slug = newPost.slug.toLowerCase();
    const content = newPost.content.toLowerCase();
    
    if (title.includes(keyword)) score += 15;
    if (description.includes(keyword)) score += 10;
    if (slug.includes(keyword.replace(/\s+/g, '-')) || slug.includes(keyword.replace(/\s+/g, ''))) score += 10;
    
    // Strip HTML to count pure words
    const strippedContent = content.replace(/<[^>]*>?/gm, ' ');
    const words = strippedContent.split(/\s+/).filter(w => w.trim().length > 0);
    const first100Words = words.slice(0, 100).join(' ');
    
    if (first100Words.includes(keyword)) score += 10;
    
    if (words.length > 600) score += 15;
    else if (words.length > 300) score += 10;
    
    const altRegex = /alt=["']([^"']*)["']/gi;
    let match;
    let foundInAlt = false;
    while ((match = altRegex.exec(content)) !== null) {
      if (match[1].toLowerCase().includes(keyword)) {
        foundInAlt = true; break;
      }
    }
    if (foundInAlt) score += 10;
    
    if (content.includes('href=')) score += 10;
    
    if (words.length > 0) {
       // count occurrences
       const keywordCount = (strippedContent.match(new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
       const density = (keywordCount / words.length) * 100;
       if (density >= 1 && density <= 2.5) score += 10;
       else if (density > 3) score -= 10;
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    setNewPost(prev => prev.seoScore !== finalScore ? { ...prev, seoScore: finalScore } : prev);
  }, [newPost.title, newPost.description, newPost.slug, newPost.content, newPost.focusKeyword]);


  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});


  // AI Prompt State
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await fetch(`/api/authors?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setAuthors(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    Promise.all([fetchPosts(), fetchCategories(), fetchAuthors()]).finally(() => setLoading(false));
  }, []);

  const parsedHeadings = useMemo(() => {
    if (!newPost.content) return [];
    // Gelişmiş Semantik Başlık Algılayıcı (H2 ve H3)
    const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    const headings = [];
    let order = 1;
    while ((match = regex.exec(newPost.content)) !== null) {
       const rawText = match[2].replace(/<[^>]+>/g, '').trim();
       
       // Decode HTML Entities directly natively
       let text = rawText;
       if (typeof window !== 'undefined') {
         const txt = document.createElement("textarea");
         txt.innerHTML = rawText;
         text = txt.value;
       }

       if (text && text.length > 2) {
         headings.push({
           tag: `h${match[1]}`, 
           text,
           fullMatch: match[0],
           slug: text.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-').replace(/(^-|-$)+/g, ''),
           order: order++
         });
       }
    }
    return headings;
  }, [newPost.content]);

  // Önizleme Motoru için Gerçek Zamanlı HTML Enjeksiyonu
  const previewHtml = useMemo(() => {
    if (!newPost.content) return '<p class="text-outline italic font-bold tracking-widest uppercase">Önizlenecek içerik bulunmuyor...</p>';
    
    let html = newPost.content;
    parsedHeadings.forEach(h => {
      if (mediaMap[h.text]) {
         // Yalnızca img ekliyoruz. Tasarımı üst container halledecek.
         const imgHtml = `\n<img src="${mediaMap[h.text]}" alt="${h.text}" />\n`;
         html = html.replace(h.fullMatch, `${h.fullMatch}${imgHtml}`);
      }
    });
    return html;
  }, [newPost.content, parsedHeadings, mediaMap]);

  // Breathtaking Article Styling Classes
  const breathtakingStyles = `
    [&>h2]:font-headline [&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:text-primary [&>h2]:mt-20 [&>h2]:mb-8 [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:border-b [&>h2]:border-outline-variant/20 [&>h2]:pb-4
    [&>h3]:font-headline [&>h3]:text-2xl [&>h3]:text-secondary [&>h3]:mt-12 [&>h3]:mb-6 [&>h3]:font-bold [&>h3]:italic
    [&>p]:text-[#334155] [&>p]:leading-[2.2] [&>p]:mb-8 [&>p]:font-body [&>p]:text-[1.125rem] [&>p]:tracking-wide [&>p]:break-words [&>p]:whitespace-pre-wrap
    [&>a]:text-secondary [&>a]:underline [&>a]:underline-offset-4 [&>a]:decoration-2 [&>a]:hover:text-primary [&>a]:transition-colors
    [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-10 [&>ul>li]:relative [&>ul>li]:pl-8 [&>ul>li]:mb-4 [&>ul>li]:text-[#334155] [&>ul>li]:leading-[1.8]
    [&>ul>li::before]:content-[''] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:top-[0.6em] [&>ul>li::before]:w-3 [&>ul>li::before]:h-3 [&>ul>li::before]:bg-secondary/40 [&>ul>li::before]:rounded-full
    [&>blockquote]:border-l-4 [&>blockquote]:border-secondary [&>blockquote]:bg-secondary/5 [&>blockquote]:p-8 [&>blockquote]:rounded-r-3xl [&>blockquote]:italic [&>blockquote]:my-12 [&>blockquote]:text-xl [&>blockquote]:text-primary/90 [&>blockquote]:font-headline [&>blockquote]:shadow-sm
    [&>img]:w-full [&>img]:h-auto [&>img]:rounded-[2rem] [&>img]:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] [&>img]:my-16 [&>img]:object-cover [&>img]:border [&>img]:border-outline-variant/10 [&>img]:max-h-[600px]
  `;

  // Yeni 2030 editörü manuel görsel yüklemeyi içte değil dışta tutar! Handlerlara gerek yok.
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ],
      },
    }),
    []
  );

  const handleCancel = () => {
    setShowAdd(false);
    setEditingPostId(null);
    setNewPost({ title: "", slug: "", description: "", keywords: "", focusKeyword: "", seoScore: 0, imageUrl: "", content: "", authorId: "", categoryId: "", personalExperience: "", references: "", published: true });
    setAiTopic("");
    setAiKeywords("");
    setMediaMap({});
    setAiAnalysisResult(null);
    setViewMode('edit');
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post.id);
    setNewPost({
      title: post.title || "",
      slug: post.slug || "",
      description: post.description || "",
      keywords: post.keywords || "",
      focusKeyword: post.focusKeyword || "",
      seoScore: post.seoScore || 0,
      imageUrl: post.imageUrl || "",
      content: post.content || "",
      authorId: post.authorId || "",
      categoryId: post.categoryId || "",
      personalExperience: post.personalExperience || "",
      references: post.references || "",
      published: post.published ?? true,
    });
    setAiTopic("");
    setAiKeywords("");
    setMediaMap({});
    setAiAnalysisResult(null);
    setShowAdd(true);
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalContent = newPost.content;
      
      // Auto-inject semantically mapped media directly into the HTML tree before saving to Prisma!
      parsedHeadings.forEach(h => {
        if (mediaMap[h.text]) {
           const imgHtml = `\n<img src="${mediaMap[h.text]}" alt="${h.text}" />\n`;
           // Insert the image immediately AFTER the heading tag
           finalContent = finalContent.replace(h.fullMatch, `${h.fullMatch}${imgHtml}`);
        }
      });

      const slugToUse = newPost.slug || newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = { ...newPost, content: finalContent, slug: slugToUse };
      
      const url = editingPostId ? `/api/posts?id=${editingPostId}` : "/api/posts";
      const method = editingPostId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(editingPostId ? "Blog yazısı başarıyla güncellendi!" : "Blog yazısı başarıyla eklendi ve yayınlandı!");
        handleCancel();
        fetchPosts();
      } else {
        try {
          const errData = await res.json();
          alert("Kaydedilirken hata oluştu: " + (errData.error || "Bilinmeyen sunucu hatası"));
        } catch {
          alert("Kaydedilirken hata oluştu (Sunucu yanıt vermedi).");
        }
      }
    } catch (e) {
      alert("Sunucu hatası.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu içeriği silmek istediğinize emin misiniz? Geri alınamaz.")) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts(); // Refresh list automatically
      } else {
        alert("Silinirken hata oluştu (Sunucu Hatası)");
      }
    } catch (e) {
      alert("Silinirken hata oluştu (Ağ Hatası)");
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic) {
      alert("Lütfen yapay zeka için bir konu veya taslak girin.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-blog', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: aiTopic, 
          keywords: aiKeywords,
          categories: categories.map(c => ({ id: c.id, name: c.name })),
          authors: authors.map(a => ({ id: a.id, name: a.name, expertise: a.expertise }))
        })
      });
      
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json();
          alert(err.error || "Yapay zeka hatası (Limit aşımı vs.).");
        } else {
          const errText = await res.text();
          console.error("Sunucu Hatası (HTML):", errText);
          alert("Next.js sunucu hatası döndürdü, terminali kontrol edin.");
        }
        return;
      }
      
      const data = await res.json();
      
      setNewPost(prev => {
        const nextState = {
          ...prev,
          title: data.title || data.Title || prev.title,
          slug: data.slug || data.Slug || prev.slug,
          description: data.metaDescription || data.description || data.summary || data.MetaDescription || prev.description,
          content: data.content || data.Content || prev.content,
          keywords: data.keywords || data.Keywords || aiKeywords || prev.keywords,
          focusKeyword: data.focusKeyword || data.FocusKeyword || prev.focusKeyword,
          personalExperience: data.personalExperience || data.PersonalExperience || prev.personalExperience,
          references: data.references || data.References || prev.references,
          categoryId: data.categoryId || data.CategoryId || prev.categoryId,
          authorId: data.authorId || data.AuthorId || prev.authorId,
        };
        console.log("AI PARSED DATA BINDING:", data, "=>", nextState);
        return nextState;
      });
      
      alert("Yapay Zeka makaleyi başarıyla üretti! Lütfen formdaki eksik kısımları (Kategori, Yazar vb.) kontrol edip Yayınla butonuna basın.");

      
    } catch (e) {
      alert("İçerik üretilirken hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeSEO = async () => {
    if (!newPost.focusKeyword || !newPost.content || !newPost.title) {
        alert("Gelişmiş analiz için Başlık, İçerik ve Odak Anahtar Kelime zorunludur."); 
        return;
    }
    setIsAnalyzing(true);
    try {
        const res = await fetch('/api/ai/analyze-seo', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              title: newPost.title, 
              content: newPost.content, 
              focusKeyword: newPost.focusKeyword 
            })
        });
        const data = await res.json();
        if (res.ok) setAiAnalysisResult(data);
        else alert(data.error);
    } catch (e) {
        alert("Analiz sırasında hata oluştu.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="pt-24 px-12 pb-20 max-w-7xl mx-auto flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="pt-24 px-12 pb-20 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-tertiary font-label text-[10px] tracking-[0.3em] uppercase block mb-2">Manevi Yönetim</span>
          <h2 className="font-headline text-4xl font-light text-primary tracking-tight">Görünüm ve İçerik Yönetimi</h2>
          <p className="text-sm text-on-surface-variant mt-2 font-light">Gemini AI entegrasyonu ve zengin metin editörü ile blog içerikleri yönetin.</p>
        </div>
        <button 
          onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-primary-container hover:text-primary transition-all shadow-lg flex items-center gap-2"
        >
          {showAdd ? <><span className="material-symbols-outlined text-[18px]">close</span> İptal Et</> : <><span className="material-symbols-outlined text-[18px]">add</span> Yeni Blog Ekle</>}
        </button>
      </header>

      {showAdd && (
        <section className="bg-surface-container p-12 rounded-2xl relative overflow-hidden mb-12 shadow-sm border border-outline-variant/10">
          
          {/* AI Generator Panel */}
          <div className="bg-[#f0f4f8] border border-blue-200 p-8 rounded-2xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <span className="material-symbols-outlined text-8xl text-blue-800">magic_button</span>
            </div>
            <div className="relative z-10">
              <h3 className="font-headline text-2xl text-blue-900 font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                Gemini AI Asistanı
              </h3>
              <p className="text-sm text-blue-800/70 mb-6 max-w-2xl">
                Bireysel umre, ziyaret noktaları veya manevi deneyimler üzerine bir taslak verin. Gemini internette araştırma yapıp Google SEO standartlarında kusursuz bir makaleyi otomatik olarak editörde yazar.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl">
                <div>
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1 block">Konu veya Başlık Fikri</label>
                  <input 
                    className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm focus:ring-blue-500 outline-none shadow-sm"
                    placeholder="Örn: Medine'de ziyaret edilecek gizli kalmış yerler"
                    value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1 block">SEO Anahtar Kelimeleri</label>
                  <input 
                    className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm focus:ring-blue-500 outline-none shadow-sm"
                    placeholder="medine ziyareti, uhud dağı, kuba mescidi"
                    value={aiKeywords} onChange={e => setAiKeywords(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiTopic}
                className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-3.5 rounded-xl font-bold tracking-wide uppercase shadow-lg flex items-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isGenerating ? (
                  <><span className="material-symbols-outlined animate-spin text-sm" style={{fontVariationSettings: "'FILL' 0"}}>sync</span> Makale Araştırılıyor ve Yazılıyor...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>temp_preferences_custom</span> Makaleyi Yaz</>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreate} className="relative z-10 w-full space-y-8">
            <h3 className="font-headline text-3xl text-primary border-b border-outline-variant/20 pb-4 mb-8">
              {editingPostId ? 'İçerik Düzenle' : 'İçerik Detayları'}
            </h3>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-6xl">
              {/* Sol Sütun: Form Girdileri */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      Yazı Başlığı (H1) <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                    </label>
                    <input required className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none font-bold placeholder:font-normal" 
                      value={newPost.title} onChange={e => setNewPost(prev => ({...prev, title: e.target.value}))} placeholder="Örn: 2026'da Çiftler İçin Bireysel Umre Deneyimi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      URL Slug <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                    </label>
                    <input className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none" 
                      value={newPost.slug} onChange={e => setNewPost(prev => ({...prev, slug: e.target.value}))} placeholder="ciftler-icin-umre-deneyimi" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                    SEO Meta Description <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                  </label>
                  <textarea required className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface-variant min-h-[110px] focus:ring-primary focus:border-primary outline-none" 
                    value={newPost.description} onChange={e => setNewPost(prev => ({...prev, description: e.target.value}))} placeholder="Google'da göze çarpacak makale odak özeti. Maksimum 160 karakter önerilir." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      SEO Keywords <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                    </label>
                    <input className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary outline-none" 
                      value={newPost.keywords} onChange={e => setNewPost(prev => ({...prev, keywords: e.target.value}))} placeholder="umre, VIP umre, çiftler için umre" />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest flex justify-between items-center">
                      Odak Anahtar Kelime <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                    </label>
                    <input required className="w-full bg-surface border-2 border-primary/20 rounded-xl p-4 text-sm text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold placeholder:font-normal" 
                      value={newPost.focusKeyword} onChange={e => setNewPost(prev => ({...prev, focusKeyword: e.target.value}))} placeholder="Örn: bireysel umre fiyatları" />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      Kategori <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary outline-none font-bold appearance-none cursor-pointer"
                        value={newPost.categoryId}
                        onChange={e => setNewPost(prev => ({...prev, categoryId: e.target.value}))}
                      >
                        <option value="">-- Kategori Şeç --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-bold text-[#003781] uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">badge</span> Yazar (E-E-A-T)</span>
                      <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                    </label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full bg-surface border border-[#003781]/20 rounded-xl p-4 text-sm text-[#003781] focus:ring-[#003781] outline-none font-bold appearance-none cursor-pointer shadow-sm"
                        value={newPost.authorId}
                        onChange={e => setNewPost(prev => ({...prev, authorId: e.target.value}))}
                      >
                        <option value="">-- Uzman Yazar Seç --</option>
                        {authors.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#003781] pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* E-E-A-T Advanced Modules (Experience & Network) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-outline-variant/20">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#003781] uppercase tracking-widest flex items-center justify-between">
                         <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">volunteer_activism</span> Kişisel Deneyim / Görüş</span>
                         <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                       </label>
                       <textarea required className="w-full bg-[#f4f7fb] border border-[#003781]/20 rounded-xl p-4 text-sm text-[#334155] min-h-[120px] focus:ring-[#003781] focus:border-[#003781] outline-none" 
                         value={newPost.personalExperience} onChange={e => setNewPost(prev => ({...prev, personalExperience: e.target.value}))} placeholder="Google'a 'Bunu gerçekten yaşadım' sinyali vermek için 2-3 cümlelik gerçek bir hikaye/tecrübe yazın..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#003781] uppercase tracking-widest flex items-center justify-between">
                         <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">menu_book</span> Kaynaklar / Referanslar</span>
                         <span className="text-secondary/60 lowercase italic font-normal tracking-normal flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> ai otomatik doldurur</span>
                       </label>
                       <textarea className="w-full bg-[#f4f7fb] border border-[#003781]/20 rounded-xl p-4 text-sm text-[#334155] min-h-[100px] focus:ring-[#003781] focus:border-[#003781] outline-none" 
                         value={newPost.references} onChange={e => setNewPost(prev => ({...prev, references: e.target.value}))} placeholder="Wikipedia, Diyanet, Resmi Kurum linkleri vb. (Güvenilirlik sinyali)" />
                    </div>
                  </div>
                  
                  <div className="bg-[#f0f4f8] border border-[#003781]/10 rounded-2xl p-6 shadow-inner overflow-hidden flex flex-col h-full max-h-[300px]">
                     <h4 className="text-[10px] font-bold text-[#003781] uppercase tracking-widest mb-4 flex items-center gap-1 border-b border-[#003781]/10 pb-2">
                       <span className="material-symbols-outlined text-[14px]">link</span> Otorite (İç Link Önerileri)
                     </h4>
                     <p className="text-[10px] text-on-surface-variant mb-3 italic">Konu bütünlüğü için yazınıza aşağıdaki bloglardan link vermeyi unutmayın.</p>
                     <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                       {posts.filter(p => p.id !== editingPostId).map((p) => (
                         <div key={p.id} className="flex flex-col bg-white p-3 rounded-lg border border-outline-variant/10 shadow-sm gap-2">
                           <span className="font-bold text-[11px] text-primary line-clamp-1">{p.title}</span>
                           <div className="flex items-center gap-2">
                             <code className="bg-surface-container px-2 py-0.5 rounded text-[9px] text-secondary/70 flex-1 truncate">
                               /blog/{p.slug}
                             </code>
                             <button type="button" onClick={() => navigator.clipboard.writeText(`https://hadiumreyegidelim.com/blog/${p.slug}`)} className="text-[9px] bg-[#003781] text-white px-2 py-1 rounded font-bold uppercase hover:bg-primary-container hover:text-[#003781] transition-colors">Kopyala</button>
                           </div>
                         </div>
                       ))}
                       {posts.length <= 1 && <span className="text-xs text-outline block text-center mt-4">Henüz başka yazı yok.</span>}
                     </div>
                  </div>
                </div>
              </div>

              {/* Sağ Sütun: CANLI GOOGLE SERP SIMULATOR */}
              <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden h-full">
                <h4 className="flex items-center gap-2 font-bold text-[10px] text-outline uppercase tracking-widest mb-6 border-b border-[#dadce0] pb-3 w-full">
                  <span className="material-symbols-outlined text-[16px]">google</span>
                  Google Arama Sonuçları (SERP) Önizlemesi
                </h4>
                
                <div className="flex flex-col gap-1 w-full max-w-[600px]">
                  <div className="flex items-center gap-3 text-sm text-[#202124]">
                    <div className="w-8 h-8 bg-surface border border-[#dadce0] rounded-full flex items-center justify-center font-bold text-primary text-xs tracking-tighter shadow-sm overflow-hidden">
                      <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[14px] font-medium text-[#202124] mb-1">Ethereal Serenity</span>
                      <span className="text-[12px] text-[#4d5156]">
                        https://hadiumreyegidelim.com &gt; blog &gt; {newPost.slug || <span className="text-[#70757a] italic">ornek-url-slug</span>}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-[#1a0dab] text-[20px] font-normal leading-[1.3] mt-3 hover:underline cursor-pointer break-words line-clamp-2 pr-6">
                    {newPost.title || "Örnek Makale Başlığı (Henüz Başlık Girmediniz)"}
                  </h3>
                  
                  <p className="text-[#4d5156] text-[14px] leading-[1.58] mt-1 break-words line-clamp-2">
                    <span className="text-[#70757a] font-medium mr-1">{new Date().toLocaleDateString('tr-TR', {day: '2-digit', month: 'short', year: 'numeric'})} —</span>
                    {newPost.description || "Google arama sonuçlarında ziyaretçilerinizin göreceği cazip açıklama metni burada yer alacaktır. Makalenin tıklanmasını sağlayan en önemli alandır."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-4xl">
               {/* Kapak Görsel alanı Media Engine'e taşındı. Sadece açıklama bırakıyoruz. */}
            </div>

            {/* AKILLI MEDYA MOTORU 2030 */}
            <div className="space-y-8 pt-12 border-t border-outline-variant/20 -mx-12 px-12 bg-surface-container-low/30 pb-12">
               <div className="max-w-4xl">
                 <h3 className="font-headline text-3xl text-primary font-bold mb-3 flex items-center gap-3">
                   <span className="material-symbols-outlined text-secondary text-4xl" data-icon="auto_awesome_mosaic">auto_awesome_mosaic</span>
                   Akıllı Medya Kütüphanesi
                 </h3>
                 <p className="text-sm text-on-surface-variant leading-relaxed">
                   Metin editörünün içerisine rastgele görsel atmak yerine, bu sistem yazıyı (ve yapay zeka taslağını) eşzamanlı okuyarak 
                   <strong> her alt başlığa özel bir dijital çerçeve</strong> üretir. Görselleriniz SEO uyumlu olarak isimlendirilir ve direkt doğru boşluğa 2030 standartlarında yerleşir.
                 </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Kapak Görsel Penceresi (H1) */}
                  <MediaUploader 
                    title="0. Ana Kapak Görseli (H1 Ana Başlık)" 
                    slug={newPost.slug || "ana-kapak"} 
                    currentUrl={newPost.imageUrl} 
                    onUploadComplete={(url) => setNewPost(prev => ({...prev, imageUrl: url}))} 
                  />

                  {/* Dinamik Algılanan Alt Başlık (H2/H3) Gorselleri */}
                  {parsedHeadings.map((h, i) => (
                    <MediaUploader 
                      key={i} 
                      title={`${h.order}. ${h.text} (${h.tag.toUpperCase()})`} 
                      slug={h.slug}
                      currentUrl={mediaMap[h.text] || ""}
                      onUploadComplete={(url) => setMediaMap(prev => ({...prev, [h.text]: url}))}
                    />
                  ))}
                  
                  {parsedHeadings.length === 0 && (
                     <div className="col-span-1 md:col-span-2 flex items-center justify-center p-8 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface/50 opacity-60">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-outline text-center flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm block">hourglass_empty</span>
                          Yapay zeka metni ürettiğinde alt başlık alanları sihirli gibi belirecek.
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* SEO ANALİZ & YAPAY ZEKA SKOR MOTORU */}
            <div className="space-y-8 pt-12 border-t border-outline-variant/20 -mx-12 px-12 bg-[#f4f7fb] pb-12 mt-12 shadow-inner">
               <div className="max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                   <h3 className="font-headline text-3xl text-primary font-bold mb-3 flex items-center gap-3">
                     <span className="material-symbols-outlined text-secondary text-4xl">radar</span>
                     SEO & Yapay Zeka Analizi
                   </h3>
                   <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
                     Yazınızın Google'da üst sıralara çıkması için gerekli teknik SEO kriterlerini canlı olarak ölçün. Daha derin bir semantik analiz için Yapay Zeka'ya başvurun.
                   </p>
                 </div>
                 
                 <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20 min-w-[180px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Canlı SEO Skoru</span>
                    <div className={`text-5xl font-headline font-black transition-colors ${newPost.seoScore >= 80 ? 'text-success' : newPost.seoScore >= 50 ? 'text-[#f59e0b]' : 'text-error'}`}>
                       {newPost.seoScore} <span className="text-2xl text-outline-variant">/ 100</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-surface-container rounded-full mt-4 overflow-hidden">
                       <div className={`h-full transition-all duration-700 ease-out ${newPost.seoScore >= 80 ? 'bg-success' : newPost.seoScore >= 50 ? 'bg-[#f59e0b]' : 'bg-error'}`} style={{width: `${newPost.seoScore}%`}}></div>
                    </div>
                 </div>
               </div>

               <div className="max-w-6xl">
                 <button 
                  type="button"
                  onClick={handleAnalyzeSEO}
                  disabled={isAnalyzing || !newPost.focusKeyword}
                  className="bg-primary hover:bg-[#002f6c] text-white px-8 py-3.5 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-primary/30 transition-all flex items-center gap-3 disabled:opacity-50"
                 >
                   {isAnalyzing ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">psychology</span>}
                   {isAnalyzing ? 'YAPAY ZEKA ANALİZ EDİYOR...' : 'YAPAY ZEKA İLE DERİN SEO ANALİZİ YAP'}
                 </button>
               </div>

               {aiAnalysisResult && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-blue-100 relative overflow-hidden">
                   {/* Background element */}
                   <div className="absolute top-0 right-0 p-8 opacity-5 -z-0">
                     <span className="material-symbols-outlined text-9xl text-primary">robot_2</span>
                   </div>
                   
                   <div className="relative z-10">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-primary/10 pb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">analytics</span> Temel Metrikler
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center py-3 border-b border-surface-container/50">
                          <span className="text-sm text-on-surface-variant font-medium">Okunabilirlik Puanı:</span>
                          <span className="font-bold text-lg text-primary bg-primary/5 px-4 py-1 rounded-full">{aiAnalysisResult.okunabilirlik_puani} / 100</span>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b border-surface-container/50">
                          <span className="text-sm text-on-surface-variant font-medium">Kullanıcı Amacı Uyumu:</span>
                          <span className={`font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-sm ${aiAnalysisResult.kullanici_amaci_uyumu?.toLowerCase().includes('evet') ? 'bg-success text-white' : 'bg-error text-white'}`}>
                            {aiAnalysisResult.kullanici_amaci_uyumu}
                          </span>
                        </li>
                      </ul>
                      
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest mt-10 mb-6 border-b border-primary/10 pb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">travel_explore</span> Eksik LSI Kelimeler
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {(aiAnalysisResult.eksik_lsi_kelimeler || []).map((word: string, i: number) => (
                           <span key={i} className="bg-surface-container-high px-4 py-2 rounded-xl text-[13px] font-bold text-secondary border border-outline-variant/20 shadow-sm">{word}</span>
                        ))}
                        {(!aiAnalysisResult.eksik_lsi_kelimeler || aiAnalysisResult.eksik_lsi_kelimeler.length === 0) && (
                           <span className="text-sm text-success font-medium flex items-center gap-2 bg-success/10 px-4 py-2 rounded-xl"><span className="material-symbols-outlined text-[18px]">verified</span> Harika, tüm LSI kelimeleri kullanmışsınız.</span>
                        )}
                      </div>
                   </div>
                   
                   <div className="relative z-10 lg:pl-4">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-primary/10 pb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">lightbulb</span> Geliştirme Önerileri
                      </h4>
                      <ul className="space-y-4">
                        {(aiAnalysisResult.gelistirme_onerileri || []).map((tip: string, i: number) => (
                          <li key={i} className="flex gap-4 text-sm text-[#334155] bg-primary/5 p-5 rounded-2xl leading-relaxed border border-primary/10">
                            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">check_circle</span>
                            <span className="font-medium">{tip}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                 </div>
               )}
            </div>

            <div className="space-y-4 pt-8">
               <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                 <label className="text-[14px] font-headline font-bold text-primary tracking-wide">Zengin İçerik Editörü</label>
                 
                 {/* VIEW MODE TOGGLE */}
                 <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/10">
                   <button 
                     type="button"
                     onClick={() => setViewMode('edit')}
                     className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'edit' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:bg-surface'}`}
                   >
                     Düzenle
                   </button>
                   <button 
                     type="button"
                     onClick={() => setViewMode('preview')}
                     className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'preview' ? 'bg-primary text-white shadow-sm' : 'text-outline hover:bg-surface'}`}
                   >
                     Önizleme
                   </button>
                 </div>
               </div>

               {viewMode === 'edit' ? (
                 <div className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                   <ReactQuill 
                     theme="snow" 
                     value={newPost.content} 
                     onChange={(val) => setNewPost(prev => ({...prev, content: val}))} 
                     modules={modules}
                     className="min-h-[700px] mb-16 text-lg"
                     placeholder="Yazınızı buraya yazın veya yapay zeka ile otomatik doldurun..."
                   />
                 </div>
               ) : (
                 <div className="bg-white rounded-3xl p-10 md:p-16 border border-outline-variant/30 min-h-[500px] max-w-4xl mx-auto shadow-[0px_32px_64px_-12px_rgba(0,55,129,0.06)] relative overflow-hidden">
                   {/* Dış çerçeveler süslemeler */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                   
                   <article className="relative z-10">
                     {newPost.imageUrl && (
                       <div className="w-full h-[400px] mb-12 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-outline-variant/10">
                         <img src={newPost.imageUrl} alt={newPost.title} className="w-full h-full object-cover" />
                       </div>
                     )}
                     
                     <div className="flex items-center gap-4 text-xs text-outline mb-8 uppercase tracking-[0.2em] font-bold">
                       <span className="bg-primary/5 text-primary px-3 py-1.5 rounded-full">{new Date().toLocaleDateString('tr-TR')}</span>
                       <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                       <span>Kaleme Alan: {authors.find(a => a.id === newPost.authorId)?.name || "Yazar Gösterimi"}</span>
                     </div>

                     <h1 className="font-headline text-5xl lg:text-6xl text-primary font-bold leading-[1.15] tracking-tight mb-16 drop-shadow-sm decoration-secondary decoration-4 underline-offset-[16px]">
                       {newPost.title || "Lütfen bir yazı başlığı girin..."}
                     </h1>
                     
                     <div 
                        className={breathtakingStyles}
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                   </article>
                 </div>
               )}
            </div>

            <div className="pt-10 flex justify-end gap-6 items-center border-t border-outline-variant/20 mt-12">
               <span className="text-xs text-outline italic">SEO tagleri, URL rotaları ve Schema işaretleri otomatik uygulanır.</span>
               <button type="submit" className="bg-primary hover:bg-[#002f6c] text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                 <span className="material-symbols-outlined text-lg block">{editingPostId ? 'save' : 'publish'}</span> 
                 {editingPostId ? 'GÜNCELLE' : 'BLOGU YAYINLA'}
               </button>
            </div>
          </form>
        </section>
      )}

      {/* Existing Blogs Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_32px_64px_-12px_rgba(0,55,129,0.06)] border border-outline-variant/10">
        <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/30">
          <h3 className="font-headline text-2xl text-primary font-bold">Yayındaki İçerikler</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Başlık / Yazar</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Tarih</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {posts.map(post => (
              <tr key={post.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-primary font-headline text-lg mb-1">{post.title}</p>
                  <p className="text-xs text-tertiary font-bold tracking-widest uppercase mb-2">
                    {post.authorModel ? post.authorModel.name : post.author} {post.category && `• ${post.category.name}`}
                  </p>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-sm text-outline hover:text-secondary underline flex items-center gap-1 w-fit">
                    /blog/{post.slug}
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </td>
                <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">
                  {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-8 py-6 text-right flex items-center justify-end gap-2 text-nowrap">
                  <button onClick={() => handleEdit(post)} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all" title="Yazıyı Düzenle">
                    <span className="material-symbols-outlined text-lg block">edit</span>
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all" title="Yazıyı Sil">
                    <span className="material-symbols-outlined text-lg block">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={3} className="text-center py-16 text-outline font-medium flex-col flex items-center justify-center gap-3">
                <span className="material-symbols-outlined text-4xl opacity-50">article</span>
                Henüz yapay zeka ile veya manuel bir blog yazısı girmediniz.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
