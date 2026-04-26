"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { marked } from "marked";
import { useAdminContext } from "@/components/admin/AdminContext";

// Rich text editörü Server-Side Rendering'de hata vermemesi için Next/Dynamic ile sarmalıyoruz
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-surface-container rounded-xl border border-outline-variant/30 text-outline">Gelişmiş Editör Yükleniyor...</div> 
});

// Görseli canvas ile sıkıştır — Vercel 4.5MB limitini aşmamak için
async function compressImage(file: File, maxMB = 3.5): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const MAX_DIM = 2400;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
        else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      // Kaliteyi kademeli düşürerek hedef boyuta ulaş
      const tryQuality = (q: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(new Blob([file], { type: "image/jpeg" })); return; }
          if (blob.size > maxMB * 1024 * 1024 && q > 0.4) tryQuality(q - 0.1);
          else resolve(blob);
        }, "image/jpeg", q);
      };
      tryQuality(0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

const MediaUploader = ({ title, slug, onUploadComplete, currentUrl }: { title: string, slug: string, onUploadComplete: (url: string) => void, currentUrl: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Client'ta sıkıştır (Vercel 4.5MB limitini aşmamak için)
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("headingSlug", slug);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      let data: any;
      const rawText = await res.text();
      try { data = JSON.parse(rawText); } catch {
        alert(`Sunucu hatası (${res.status}):\n${rawText.slice(0, 300)}`);
        return;
      }
      if (data.success) onUploadComplete(data.url);
      else alert("Yükleme başarısız:\n" + data.error);
    } catch (err: any) {
      alert("Ağ hatası:\n" + (err?.message || String(err)));
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
  const { toast } = useAdminContext();
  const [showMarkdownPaste, setShowMarkdownPaste] = useState(false);
  const [markdownInput, setMarkdownInput] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null); // inline silme onayı
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit'); // Preview mode toggle
  const [newPost, setNewPost] = useState({
    title: "",
    metaTitle: "",
    slug: "",
    description: "",
    keywords: "",
    tags: "",
    focusKeyword: "",
    seoScore: 0,
    imageUrl: "",
    imageAlt: "",
    tldr: "",
    faq: "[]",
    content: "",
    authorId: "",
    categoryId: "",
    personalExperience: "",
    references: "",
    published: true,
  });

  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [postSearch, setPostSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

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
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  const [isAiEditing, setIsAiEditing] = useState(false);

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

  // Metin İçi Görsel Çıkarıcı (Canlı Editör)
  const extractedImages = useMemo(() => {
    if (typeof window === 'undefined' || !newPost.content) return [];
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(newPost.content, 'text/html');
      const imgs = Array.from(doc.querySelectorAll('img'));
      return imgs.map((img, i) => ({
        id: `img-${i}`,
        src: img.src,
        alt: img.alt || 'Görsel',
        style: img.getAttribute('style') || ''
      }));
    } catch { return []; }
  }, [newPost.content]);

  // Metin İçi Görsel Canlı Düzenleyici
  const updateImageStyle = (src: string, styleString: string) => {
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(newPost.content, 'text/html');
      const imgs = doc.querySelectorAll('img');
      let updated = false;
      imgs.forEach(img => {
        if (img.src === src) {
          img.setAttribute('style', styleString);
          updated = true;
        }
      });
      if (updated) {
        setNewPost(prev => ({...prev, content: doc.body.innerHTML}));
      }
    } catch(e) { console.error(e); }
  };

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
  // Yeni 2030 editörü manuel görsel yüklemeyi içte değil dışta tutar! Handlerlara gerek yok.
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
      clipboard: { matchVisual: false }
    }),
    []
  );

  const handleCancel = () => {
    setShowAdd(false);
    setEditingPostId(null);
    setNewPost({ title: "", metaTitle: "", slug: "", description: "", keywords: "", tags: "", focusKeyword: "", seoScore: 0, imageUrl: "", imageAlt: "", tldr: "", faq: "[]", content: "", authorId: "", categoryId: "", personalExperience: "", references: "", published: true });
    setAiTopic("");
    setAiKeywords("");
    setAiEditInstruction("");
    setMediaMap({});
    setAiAnalysisResult(null);
    setViewMode('edit');
    setShowVersionHistory(false);
    setVersions([]);
  };

  const fetchVersions = async (postId: string) => {
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/admin/post-versions?postId=${postId}`);
      const data = await res.json();
      if (Array.isArray(data)) setVersions(data);
    } catch {}
    finally { setLoadingVersions(false); }
  };

  const restoreVersion = async (version: any) => {
    if (!confirm(`v${version.version} sürümü geri yüklensin mi? Mevcut içerik kaybolacak.`)) return;
    // First fetch the full version content
    const res = await fetch(`/api/admin/post-versions?postId=${editingPostId}`);
    const allVersions = await res.json();
    const full = allVersions.find((v: any) => v.id === version.id);
    // Actually we need the content — let me fetch the full version
    const res2 = await fetch(`/api/admin/post-versions?postId=${editingPostId}&id=${version.id}`);
    if (res2.ok) {
      const data = await res2.json();
      if (data.content) {
        setNewPost(prev => ({ ...prev, title: data.title || prev.title, content: data.content, description: data.description || prev.description }));
        toast(`v${version.version} geri yüklendi.`, 'success');
        setShowVersionHistory(false);
      }
    }
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post.id);
    setNewPost({
      title: post.title || "",
      metaTitle: post.metaTitle || "",
      slug: post.slug || "",
      description: post.description || "",
      keywords: post.keywords || "",
      tags: post.tags || "",
      focusKeyword: post.focusKeyword || "",
      seoScore: post.seoScore || 0,
      imageUrl: post.imageUrl || "",
      imageAlt: post.imageAlt || "",
      tldr: post.tldr || "",
      faq: post.faq || "[]",
      content: post.content || "",
      authorId: post.authorId || "",
      categoryId: post.categoryId || "",
      personalExperience: post.personalExperience || "",
      references: post.references || "",
      published: post.published ?? true,
    });
    setAiTopic("");
    setAiKeywords("");
    setAiEditInstruction("");
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
        // Auto-save version on update
        if (editingPostId) {
          fetch('/api/admin/post-versions', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: editingPostId, title: newPost.title, content: finalContent, description: newPost.description })
          }).catch(() => {});
        }
        toast(editingPostId ? "Blog yazısı başarıyla güncellendi!" : "Blog yazısı yayınlandı!", "success");
        handleCancel();
        fetchPosts();
      } else {
        try {
          const errData = await res.json();
          toast("Kaydedilemedi: " + (errData.error || "Sunucu hatası"), "error");
        } catch {
          toast("Kaydedilemedi — sunucu yanıt vermedi.", "error");
        }
      }
    } catch (e) {
      toast("Sunucu hatası oluştu.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Yazı silindi.", "success");
        setDeletingId(null);
        fetchPosts();
      } else {
        toast("Silinemedi — sunucu hatası.", "error");
      }
    } catch {
      toast("Silinemedi — ağ hatası.", "error");
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic) {
      toast("Lütfen bir konu veya taslak girin.", "warning");
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
        if (contentType?.includes("application/json")) {
          const err = await res.json();
          toast(err.error || "Yapay zeka hatası (limit aşımı vb.)", "error");
        } else {
          const errText = await res.text();
          console.error("Sunucu Hatası (HTML):", errText);
          toast("Sunucu hatası — terminali kontrol et.", "error");
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
          imageUrl: data.imageUrl || data.ImageUrl || prev.imageUrl,
        };
        console.log("AI PARSED DATA BINDING:", data, "=>", nextState);
        return nextState;
      });
      
      toast("Claude makaleyi yazdı! Kategori ve Yazar alanlarını kontrol edip yayınlayabilirsiniz.", "success");
    } catch (e) {
      toast("İçerik üretilirken hata oluştu.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditAI = async () => {
    if (!aiEditInstruction) {
      toast("Lütfen bir düzenleme talimatı girin.", "warning");
      return;
    }
    if (!newPost.content || newPost.content.length < 10) {
      toast("Düzenlenecek yeterli içerik yok.", "warning");
      return;
    }
    
    setIsAiEditing(true);
    try {
      const res = await fetch('/api/ai/edit-blog', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newPost.content, 
          instruction: aiEditInstruction
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Yapay zeka düzenleme hatası.", "error");
        return;
      }
      setNewPost(prev => ({ ...prev, content: data.optimizedContent }));
      setAiEditInstruction("");
      toast("İçerik Claude tarafından güncellendi.", "success");
    } catch {
      toast("İçerik düzenlenirken hata oluştu.", "error");
    } finally {
      setIsAiEditing(false);
    }
  };

  const handleAnalyzeSEO = async () => {
    if (!newPost.focusKeyword || !newPost.content || !newPost.title) {
      toast("Analiz için Başlık, İçerik ve Odak Kelime zorunludur.", "warning");
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
        if (res.ok) { setAiAnalysisResult(data); toast("SEO analizi tamamlandı.", "success"); }
        else toast(data.error || "Analiz hatası.", "error");
    } catch {
        toast("Analiz sırasında hata oluştu.", "error");
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
          <p className="text-sm text-on-surface-variant mt-2 font-light">Claude AI entegrasyonu ve zengin metin editörü ile blog içerikleri yönetin.</p>
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
                Claude AI Asistanı
              </h3>
              <p className="text-sm text-blue-800/70 mb-6 max-w-2xl">
                Bireysel umre, ziyaret noktaları veya manevi deneyimler üzerine bir konu verin. Claude Opus eğitim verilerindeki güncel bilgilerle Google SEO standartlarında uzun ve kaliteli bir makaleyi otomatik olarak editörde yazar.
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
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-8">
              <h3 className="font-headline text-3xl text-primary">
                {editingPostId ? 'İçerik Düzenle' : 'İçerik Detayları'}
              </h3>
              {editingPostId && (
                <button
                  type="button"
                  onClick={() => { setShowVersionHistory(!showVersionHistory); if (!showVersionHistory) fetchVersions(editingPostId); }}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-container rounded-xl font-bold text-sm transition-colors border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Sürüm Geçmişi
                </button>
              )}
            </div>

            {/* Version History Panel */}
            {showVersionHistory && editingPostId && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
                <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Sürüm Geçmişi (Son 20)
                </h4>
                {loadingVersions ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500"><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Yükleniyor...</div>
                ) : versions.length === 0 ? (
                  <p className="text-sm text-slate-500">Henüz sürüm kaydedilmemiş. İlk kaydetme sonrası otomatik oluşturulur.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {versions.map(v => (
                      <div key={v.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3">
                        <div>
                          <span className="text-xs font-bold text-primary">v{v.version}</span>
                          <span className="mx-2 text-slate-300">·</span>
                          <span className="text-sm text-slate-700 font-medium">{v.title}</span>
                          <span className="mx-2 text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleString('tr-TR')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => restoreVersion(v)}
                          className="text-xs font-bold text-primary hover:text-[#002f6c] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">restore</span>
                          Geri Yükle
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
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

                {/* Meta Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                    SEO Meta Başlığı (Title Tag)
                    <span className={`text-xs font-bold tabular-nums ${newPost.metaTitle.length > 60 ? 'text-error' : newPost.metaTitle.length >= 50 ? 'text-success' : 'text-outline'}`}>
                      {newPost.metaTitle.length}/60
                    </span>
                  </label>
                  <input className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-secondary focus:ring-primary focus:border-primary outline-none"
                    value={newPost.metaTitle} onChange={e => setNewPost(prev => ({...prev, metaTitle: e.target.value}))} placeholder="Boş bırakılırsa Başlık (H1) kullanılır — 50-60 karakter ideal" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                    SEO Meta Description
                    <span className={`text-xs font-bold tabular-nums ${newPost.description.length > 160 ? 'text-error' : newPost.description.length >= 120 ? 'text-success' : 'text-outline'}`}>
                      {newPost.description.length}/160
                    </span>
                  </label>
                  <textarea required className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface-variant min-h-[110px] focus:ring-primary focus:border-primary outline-none"
                    value={newPost.description} onChange={e => setNewPost(prev => ({...prev, description: e.target.value}))} placeholder="Google'da göze çarpacak makale odak özeti. Maksimum 160 karakter önerilir." />
                </div>

                {/* Cover Image Alt Text */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Kapak Görseli Alt Metni (imageAlt)
                  </label>
                  <input className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary focus:border-primary outline-none"
                    value={newPost.imageAlt} onChange={e => setNewPost(prev => ({...prev, imageAlt: e.target.value}))} placeholder="Örn: Medine'de Mescid-i Nebevi'nin havadan görünümü" />
                </div>

                {/* TL;DR */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[13px]">summarize</span>
                    TL;DR — Kısa Özet (İçerik öncesi gösterilir)
                  </label>
                  <textarea className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface-variant min-h-[90px] focus:ring-primary focus:border-primary outline-none"
                    value={newPost.tldr} onChange={e => setNewPost(prev => ({...prev, tldr: e.target.value}))} placeholder="Bu yazıyı okumak için 2 dakikan yoksa özetle: 3-4 madde veya kısa paragraf." />
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

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[13px]">label</span>
                    Etiketler / Tags (virgülle ayır)
                  </label>
                  <input className="w-full bg-surface border border-outline-variant/30 rounded-xl p-4 text-sm text-secondary focus:ring-primary focus:border-primary outline-none"
                    value={newPost.tags} onChange={e => setNewPost(prev => ({...prev, tags: e.target.value}))} placeholder="umre, mekke, medine, hac rehberi" />
                  {newPost.tags && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {newPost.tags.split(',').map((t, i) => t.trim() && (
                        <span key={i} className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full">{t.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* FAQ Builder */}
                <div className="space-y-4 pt-6 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[13px]">quiz</span>
                      SSS / FAQ Oluşturucu (FAQPage Schema otomatik eklenir)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = JSON.parse(newPost.faq || '[]');
                        setNewPost(prev => ({...prev, faq: JSON.stringify([...current, {q: '', a: ''}])}));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>Soru Ekle
                    </button>
                  </div>
                  {(() => {
                    let items: {q: string; a: string}[] = [];
                    try { items = JSON.parse(newPost.faq || '[]'); } catch {}
                    return items.length === 0 ? (
                      <p className="text-xs text-outline italic text-center py-4 bg-surface-container rounded-xl border border-dashed border-outline-variant/40">Henüz soru eklenmedi. "Soru Ekle" butonuna tıklayın.</p>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 space-y-3 relative">
                            <button type="button" onClick={() => {
                              const next = items.filter((_, i) => i !== idx);
                              setNewPost(prev => ({...prev, faq: JSON.stringify(next)}));
                            }} className="absolute top-3 right-3 text-outline hover:text-error transition-colors">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                            <div>
                              <label className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1 block">Soru {idx+1}</label>
                              <input
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm text-secondary focus:ring-primary focus:border-primary outline-none"
                                value={item.q}
                                onChange={e => {
                                  const next = [...items]; next[idx] = {...next[idx], q: e.target.value};
                                  setNewPost(prev => ({...prev, faq: JSON.stringify(next)}));
                                }}
                                placeholder="Örn: Bireysel umre vizesi nasıl alınır?"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1 block">Cevap {idx+1}</label>
                              <textarea
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface-variant min-h-[80px] focus:ring-primary focus:border-primary outline-none"
                                value={item.a}
                                onChange={e => {
                                  const next = [...items]; next[idx] = {...next[idx], a: e.target.value};
                                  setNewPost(prev => ({...prev, faq: JSON.stringify(next)}));
                                }}
                                placeholder="Detaylı ve bilgilendirici bir cevap yazın..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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
                 <div className="space-y-4">
                   <div className="bg-[#f0f4f8] border border-blue-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end shadow-inner">
                     <div className="flex-1 w-full">
                       <label className="text-[10px] font-bold text-blue-900 uppercase tracking-widest flex items-center gap-1 mb-2">
                         <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                         Mevcut İçeriği Yapay Zeka İle Düzenle
                       </label>
                       <input 
                         className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm focus:ring-blue-500 outline-none shadow-sm placeholder:text-blue-900/40"
                         placeholder="Örn: Bu makalenin son paragrafını daha samimi yaz ve /paketler sayfasına link ver..."
                         value={aiEditInstruction} 
                         onChange={e => setAiEditInstruction(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             handleEditAI();
                           }
                         }}
                       />
                     </div>
                     <button 
                       type="button"
                       onClick={handleEditAI}
                       disabled={isAiEditing || !aiEditInstruction || !newPost.content}
                       className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold tracking-[0.15em] text-xs uppercase shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                     >
                       {isAiEditing ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">magic_button</span>}
                       {isAiEditing ? "DÜZENLENİYOR..." : "UYGULA"}
                     </button>
                   </div>
                   
                   {/* Claude / Markdown Yapıştır Paneli */}
                   <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 p-4 mb-2">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-violet-600 text-[20px]">smart_toy</span>
                         <span className="font-bold text-sm text-violet-700 uppercase tracking-widest">Claude'dan Yapıştır</span>
                         <span className="text-[10px] text-violet-500 font-medium">Markdown → HTML otomatik çevrilir</span>
                       </div>
                       <button
                         type="button"
                         onClick={() => setShowMarkdownPaste(v => !v)}
                         className="text-[10px] font-bold uppercase tracking-widest text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                       >
                         <span className="material-symbols-outlined text-[16px]">{showMarkdownPaste ? 'expand_less' : 'expand_more'}</span>
                         {showMarkdownPaste ? 'Kapat' : 'Aç'}
                       </button>
                     </div>
                     {showMarkdownPaste && (
                       <div className="space-y-3">
                         <textarea
                           value={markdownInput}
                           onChange={e => setMarkdownInput(e.target.value)}
                           placeholder="Claude'un ürettiği markdown içeriği buraya yapıştır..."
                           className="w-full h-64 p-4 text-sm font-mono border border-violet-200 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700 placeholder:text-slate-400"
                         />
                         <div className="flex gap-3">
                           <button
                             type="button"
                             onClick={() => {
                               if (!markdownInput.trim()) return;
                               const html = marked.parse(markdownInput) as string;
                               setNewPost(prev => ({ ...prev, content: prev.content ? prev.content + html : html }));
                               setMarkdownInput("");
                               setShowMarkdownPaste(false);
                               toast("Markdown başarıyla HTML'e çevrildi ve editöre eklendi!", "success");
                             }}
                             className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-violet-200"
                           >
                             <span className="material-symbols-outlined text-[16px]">transform</span>
                             Çevir & Ekle
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               if (!markdownInput.trim()) return;
                               const html = marked.parse(markdownInput) as string;
                               setNewPost(prev => ({ ...prev, content: html }));
                               setMarkdownInput("");
                               setShowMarkdownPaste(false);
                               toast("Markdown çevrildi — mevcut içerik değiştirildi.", "success");
                             }}
                             className="flex items-center gap-2 bg-white border border-violet-300 hover:bg-violet-50 text-violet-700 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
                           >
                             <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                             Değiştir
                           </button>
                           <button
                             type="button"
                             onClick={() => { setMarkdownInput(""); }}
                             className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                           >
                             Temizle
                           </button>
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                     <ReactQuill
                       theme="snow"
                       value={newPost.content}
                       onChange={(val) => setNewPost(prev => ({...prev, content: val}))}
                       modules={modules}
                       className="min-h-[700px] mb-2 text-lg"
                       placeholder="Yazınızı buraya yazın veya yapay zeka ile otomatik doldurun..."
                     />
                   </div>

                    {/* Canlı Görsel Denetim Paneli */}
                    {extractedImages.length > 0 && (
                      <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 px-6 py-5 mt-4 shadow-sm relative overflow-hidden">
                        {/* Arkadan Süs */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/20 pb-3 relative z-10">
                          <span className="material-symbols-outlined text-primary text-[22px]">imagesmode</span>
                          <div>
                            <h4 className="font-bold text-[13px] text-primary uppercase tracking-widest leading-none">Metin İçi Görselleri Yönet</h4>
                            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Görselin boyutunu tek tıkla canlı olarak HTML üzerinden editleyin.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                           {extractedImages.map(img => (
                             <div key={img.id} className="bg-white border border-outline-variant/20 rounded-xl flex flex-col shadow-sm hover:border-primary/30 transition-all overflow-hidden relative group">
                               <div className="h-32 w-full bg-surface-container relative">
                                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                                    <p className="text-[10px] font-bold text-white uppercase truncate drop-shadow-md" title={img.alt}>{img.alt || "Görsel İsmi Yok"}</p>
                                  </div>
                               </div>
                               <div className="p-3 bg-surface-container-lowest">
                                 <div className="grid grid-cols-3 gap-2">
                                    <button 
                                       type="button" 
                                       onClick={() => updateImageStyle(img.src, "width: 45%; min-width: 200px; max-width: 350px; float: left; margin: 15px 25px 15px 0; border-radius: 12px; height: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);")} 
                                       className="flex flex-col items-center justify-center text-[9px] font-bold bg-surface-container-high py-2 rounded-lg text-secondary hover:bg-primary hover:text-white transition-colors uppercase group/btn border border-outline-variant/30 shadow-sm gap-1 cursor-pointer"
                                    >
                                       <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">align_horizontal_left</span>
                                       Yasla
                                    </button>
                                    <button 
                                       type="button" 
                                       onClick={() => updateImageStyle(img.src, "width: 100%; max-width: 500px; margin: 30px auto; display: block; border-radius: 16px; height: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1);")} 
                                       className="flex flex-col items-center justify-center text-[9px] font-bold bg-surface-container-high py-2 rounded-lg text-secondary hover:bg-primary hover:text-white transition-colors uppercase group/btn border border-outline-variant/30 shadow-sm gap-1 cursor-pointer"
                                    >
                                       <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">align_horizontal_center</span>
                                       Orta
                                    </button>
                                    <button 
                                       type="button" 
                                       onClick={() => updateImageStyle(img.src, "width: 100%; margin: 35px 0; display: block; border-radius: 20px; height: auto; box-shadow: 0 15px 40px rgba(0,0,0,0.15);")} 
                                       className="flex flex-col items-center justify-center text-[9px] font-bold bg-surface-container-high py-2 rounded-lg text-secondary hover:bg-primary hover:text-white transition-colors uppercase group/btn border border-outline-variant/30 shadow-sm gap-1 cursor-pointer"
                                    >
                                       <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">crop_din</span>
                                       Tam Boy
                                    </button>
                                 </div>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
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
        <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-headline text-2xl text-primary font-bold">Tüm İçerikler ({posts.length})</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedPosts.size > 0 && (
              <button
                onClick={async () => {
                  if (!confirm(`${selectedPosts.size} yazı silinsin mi?`)) return;
                  for (const id of selectedPosts) {
                    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
                  }
                  setSelectedPosts(new Set());
                  fetchPosts();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-xs hover:bg-red-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                {selectedPosts.size} Sil
              </button>
            )}
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                placeholder="Başlık veya anahtar kelime..."
                value={postSearch}
                onChange={e => setPostSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-4 py-5 w-10">
                <input type="checkbox"
                  checked={selectedPosts.size === posts.filter(p => !postSearch || p.title?.toLowerCase().includes(postSearch.toLowerCase())).length && posts.length > 0}
                  onChange={e => setSelectedPosts(e.target.checked ? new Set(posts.map((p: any) => p.id)) : new Set())}
                />
              </th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Başlık / Yazar</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Tarih</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {posts.filter((p: any) => !postSearch || p.title?.toLowerCase().includes(postSearch.toLowerCase()) || (p.focusKeyword || "").toLowerCase().includes(postSearch.toLowerCase())).map((post: any) => (
              <tr key={post.id} className={`group hover:bg-surface-container-low/50 transition-colors ${selectedPosts.has(post.id) ? 'bg-primary/3' : ''}`}>
                <td className="px-4 py-6"><input type="checkbox" checked={selectedPosts.has(post.id)} onChange={() => setSelectedPosts(prev => { const n = new Set(prev); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })} /></td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-primary font-headline text-lg">{post.title}</p>
                    {!post.published && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">Taslak</span>}
                  </div>
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
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {deletingId === post.id ? (
                      // Inline silme onayı
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-red-600">Emin misin?</span>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Sil
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(post)} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all" title="Yazıyı Düzenle">
                          <span className="material-symbols-outlined text-lg block">edit</span>
                        </button>
                        <button onClick={() => setDeletingId(post.id)} className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all" title="Yazıyı Sil">
                          <span className="material-symbols-outlined text-lg block">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="text-center py-16 text-outline font-medium flex-col flex items-center justify-center gap-3">
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
