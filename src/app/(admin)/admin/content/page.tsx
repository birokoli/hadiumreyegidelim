"use client";
import { SITE_URL } from "@/lib/seo/site";
import { thToTd } from "@/lib/blog/table-html";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { marked } from "marked";
import { useAdminContext } from "@/components/admin/AdminContext";
import BlogEngine from "@/components/admin/content/BlogEngine";
import BlogTakvim, { bosGunler, trTarih, yaziGunu } from "@/components/admin/content/BlogTakvim";

import HubTabs from "@/components/admin/HubTabs";

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
        {currentUrl && <span className="bg-secondary/10 text-secondary text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">Hazır</span>}
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

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS_SHORT = ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];

function calFirstDow(y: number, m: number) {
  const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1;
}
function calDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }

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
    scheduledAt: "" as string,
  });
  // Kişisel deneyim: yazarın notlarını paragrafa çevirir (bilgi eklemez)
  const [polishing, setPolishing] = useState(false);
  const polishExperience = async () => {
    setPolishing(true);
    try {
      const res = await fetch("/api/admin/blog-experience", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: newPost.personalExperience, title: newPost.title }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Düzenlenemedi.");
      setNewPost((prev) => ({ ...prev, personalExperience: d.text }));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setPolishing(false);
    }
  };


  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => new Date());
  const [pickerTime, setPickerTime] = useState("09:00");
  const [pickerViewMonth, setPickerViewMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [postSearch, setPostSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  // Ekran düzeni: liste görünümü, filtre, düzenleyici sekmesi
  const [gorunum, setGorunum] = useState<"yazilar" | "takvim" | "motor">("yazilar");
  const [filtre, setFiltre] = useState<"tumu" | "taslak" | "zamanli" | "yayinda" | "gorselsiz">("tumu");
  const [editorSekme, setEditorSekme] = useState<"yazi" | "seo" | "gorsel" | "ozet" | "deneyim">("yazi");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [zamanlananId, setZamanlananId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Kaydedilmemiş değişiklik takibi: açılıştaki hâlin özeti tutulur. İçerik etiketsiz karşılaştırılır
  // (editör açılışta HTML'i kendi biçimine çevirir; bu değişiklik sayılmamalı).
  const hal = () => JSON.stringify({
    ...newPost,
    seoScore: 0,
    content: (newPost.content || "").replace(/<[^>]*>/g, "").replace(/&nbsp;|\s+/g, ""),
    mod: publishMode,
    gun: publishMode === "scheduled" ? `${pickerDate.toDateString()} ${pickerTime}` : "",
    medya: Object.keys(mediaMap).length,
  });
  const simdikiHal = hal();
  const sonHal = useRef("");
  useEffect(() => { sonHal.current = simdikiHal; });
  const [acilisHali, setAcilisHali] = useState("");
  const [anlikIstek, setAnlikIstek] = useState(0);
  useEffect(() => {
    if (!anlikIstek) return;
    const t = setTimeout(() => setAcilisHali(sonHal.current), 700);
    return () => clearTimeout(t);
  }, [anlikIstek]);
  const degisti = showAdd && acilisHali !== "" && simdikiHal !== acilisHali;


  // AI Prompt State
  // Blog motoru: ?topic= ve ?panel= ile (SEO Masası / AI Görünürlük / eski Yapay Zeka sayfasından) gelinebilir
  const [engineInit, setEngineInit] = useState<{ topic: string; tab?: "auto" | "new" | "links" } | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
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
    const q = new URLSearchParams(window.location.search);
    const panel = q.get("panel");
    setEngineInit({ topic: q.get("topic") ?? "", tab: panel === "auto" || panel === "new" || panel === "links" ? panel : undefined });
    if (panel || q.get("topic")) setGorunum("motor");
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

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link", "image"],
          ["clean"],
        ],
      },
      clipboard: {
        // Excel/Word yapıştırmada inline style'ları temizle
        matchVisual: false,
      },
    }),
    []
  );

  const handleCancel = () => {
    setShowAdd(false);
    setEditingPostId(null);
    setNewPost({ title: "", metaTitle: "", slug: "", description: "", keywords: "", tags: "", focusKeyword: "", seoScore: 0, imageUrl: "", imageAlt: "", tldr: "", faq: "[]", content: "", authorId: "", categoryId: "", personalExperience: "", references: "", published: true, scheduledAt: "" });
    setAiEditInstruction("");
    setMediaMap({});
    setAiAnalysisResult(null);
    setViewMode('edit');
    setShowVersionHistory(false);
    setVersions([]);
    setPublishMode('immediate');
    setPickerDate(new Date());
    setPickerTime("09:00");
    setPickerViewMonth(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  };

  const yeniYazi = () => {
    handleCancel();
    // Yeni yazı taslak olarak başlar: Ctrl+S yanlışlıkla yayına almasın
    setNewPost((prev) => ({ ...prev, published: false }));
    setEditorSekme("yazi");
    setShowAdd(true);
    setAcilisHali("");
    setAnlikIstek((n) => n + 1);
    window.scrollTo({ top: 0 });
  };

  const editordenCik = () => {
    if (degisti && !confirm("Kaydedilmemiş değişiklikler var. Çıkılsın mı?")) return;
    handleCancel();
    setAcilisHali("");
  };

  // Listeden tek tıkla: yazısı olmayan ilk güne 09:00 (TR) zamanla. PUT tüm alanları yazar, yazının tamamı gönderilir.
  const hizliZamanla = async (post: any) => {
    const gun = bosGunler(posts, 1)[0];
    if (!gun) return;
    setZamanlananId(post.id);
    try {
      const res = await fetch(`/api/posts?id=${post.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: false, scheduledAt: `${gun}T09:00:00+03:00` }),
      });
      if (!res.ok) throw new Error();
      toast(`${trTarih(gun)} 09:00'a zamanlandı.`, "success");
      fetchPosts();
    } catch {
      toast("Zamanlanamadı.", "error");
    } finally {
      setZamanlananId(null);
    }
  };

  const zamaniKaldir = async (post: any) => {
    setZamanlananId(post.id);
    try {
      const res = await fetch(`/api/posts?id=${post.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: false, scheduledAt: null }),
      });
      if (!res.ok) throw new Error();
      toast("Zamanlama kaldırıldı, yazı taslakta.", "success");
      fetchPosts();
    } catch {
      toast("Kaldırılamadı.", "error");
    } finally {
      setZamanlananId(null);
    }
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
      scheduledAt: post.scheduledAt || "",
    });
    // Restore scheduling state if post has a future scheduledAt
    if (post.scheduledAt && !post.published) {
      const dt = new Date(post.scheduledAt);
      setPublishMode('scheduled');
      setPickerDate(dt);
      setPickerTime(`${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`);
      setPickerViewMonth({ y: dt.getFullYear(), m: dt.getMonth() });
    } else {
      setPublishMode('immediate');
    }
    setAiEditInstruction("");
    setMediaMap({});
    setAiAnalysisResult(null);
    setShowAdd(true);
    setViewMode('edit');
    setEditorSekme("yazi");
    setShowVersionHistory(false);
    setAcilisHali("");
    setAnlikIstek((n) => n + 1);
    window.scrollTo({ top: 0 });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kaydediliyor) return;
    // Zorunlu alanlar (sekmeler gizli olabildiği için tarayıcı doğrulaması yerine burada)
    const eksik: [boolean, string, "yazi" | "seo"][] = [
      [!newPost.title.trim(), "Başlık", "yazi"],
      [!newPost.authorId, "Yazar", "yazi"],
      [!newPost.focusKeyword.trim(), "Odak anahtar kelime", "seo"],
      [!newPost.description.trim(), "Meta açıklama", "seo"],
    ];
    const ilk = eksik.find(([yok]) => yok);
    if (ilk) {
      toast(`${eksik.filter(([y]) => y).map(([, ad]) => ad).join(", ")} boş. Doldurup tekrar kaydet.`, "warning");
      setEditorSekme(ilk[2]);
      return;
    }
    setKaydediliyor(true);
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
      let scheduledAt: string | null = null;
      let publishedFlag = newPost.published;
      if (publishMode === 'scheduled') {
        const [h, min] = pickerTime.split(':').map(Number);
        const dt = new Date(pickerDate);
        dt.setHours(h, min, 0, 0);
        scheduledAt = dt.toISOString();
        publishedFlag = false; // will be published by cron at scheduled time
      }
      const payload = { ...newPost, content: finalContent, slug: slugToUse, published: publishedFlag, scheduledAt: scheduledAt || null };
      
      const url = editingPostId ? `/api/posts?id=${editingPostId}` : "/api/posts";
      const method = editingPostId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Auto-save version on update
        const kayit = await res.json().catch(() => null);
        if (editingPostId) {
          fetch('/api/admin/post-versions', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: editingPostId, title: newPost.title, content: finalContent, description: newPost.description })
          }).catch(() => {});
        }
        toast(
          publishMode === 'scheduled'
            ? `Zamanlandı: ${new Date(scheduledAt!).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })} tarihinde yayına girecek.`
            : !publishedFlag
              ? "Taslak kaydedildi."
              : editingPostId ? "Güncellendi." : "Yayınlandı.",
          "success"
        );
        // Ekranda kal: başlık görselleri yazıya işlendi, yeni yazıysa artık düzenleme kaydı
        setNewPost((prev) => ({ ...prev, content: finalContent, slug: slugToUse, published: publishedFlag, scheduledAt: scheduledAt || "" }));
        setMediaMap({});
        if (!editingPostId && kayit?.id) setEditingPostId(kayit.id);
        setAcilisHali("");
        setAnlikIstek((n) => n + 1);
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
    } finally {
      setKaydediliyor(false);
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

  // Blog motorunun ürettiği taslağı düzenleyicide aç
  const openDraft = async (postId: string) => {
    const res = await fetch(`/api/posts?t=${Date.now()}`, { cache: "no-store" });
    const data = await res.json().catch(() => []);
    if (Array.isArray(data)) {
      setPosts(data);
      const post = data.find((p: any) => p.id === postId);
      if (post) {
        handleEdit(post);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast("Taslak hazır: gözden geçirip yayınlayabilirsiniz.", "success");
      }
    }
  };

  // Listedeki taslağı yayınla: sıra takibine ve AI Görünürlük'e de bağlanır
  const publishDraft = async (postId: string) => {
    setPublishingId(postId);
    try {
      const res = await fetch("/api/admin/geo-blog/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Yayınlanamadı.");
      toast(`Yayınlandı. ${(data.notes || []).join(", ")}`, "success");
      fetchPosts();
    } catch (e: any) {
      toast(e.message || "Yayınlanamadı.", "error");
    } finally {
      setPublishingId(null);
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

  // Kısayollar ve sayfadan çıkış uyarısı (yalnızca düzenleyici açıkken)
  useEffect(() => {
    if (!showAdd) return;
    const tus = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); formRef.current?.requestSubmit(); }
      else if (e.key === "Escape" && !(e.target as HTMLElement)?.closest?.(".ql-editor, textarea, input")) editordenCik();
    };
    const cikis = (e: BeforeUnloadEvent) => { if (degisti) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("keydown", tus);
    window.addEventListener("beforeunload", cikis);
    return () => { window.removeEventListener("keydown", tus); window.removeEventListener("beforeunload", cikis); };
  });

  if (loading) return <div className="pt-24 px-12 pb-20 max-w-7xl mx-auto flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  // ── Ortak biçimler ──
  const inp = "w-full bg-white border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-outline/70";
  const lbl = "text-xs font-bold text-on-surface-variant flex items-center justify-between gap-2 mb-1.5";
  const kart = "bg-surface-container-lowest rounded-xl border border-outline-variant/15 shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

  // ── Liste sayıları ve filtre ──
  const sayac = {
    tumu: posts.length,
    taslak: posts.filter((p) => !p.published && !p.scheduledAt).length,
    zamanli: posts.filter((p) => !p.published && p.scheduledAt).length,
    yayinda: posts.filter((p) => p.published).length,
    gorselsiz: posts.filter((p) => !p.imageUrl).length,
  };
  const ara = postSearch.trim().toLocaleLowerCase("tr-TR");
  const listelenen = posts
    .filter((p) =>
      filtre === "taslak" ? !p.published && !p.scheduledAt
      : filtre === "zamanli" ? !p.published && p.scheduledAt
      : filtre === "yayinda" ? p.published
      : filtre === "gorselsiz" ? !p.imageUrl
      : true)
    .filter((p) => !ara || (p.title || "").toLocaleLowerCase("tr-TR").includes(ara) || (p.focusKeyword || "").toLocaleLowerCase("tr-TR").includes(ara))
    .sort((a, b) => {
      // Zamanlanmış görünümünde yayın sırasına göre
      if (filtre === "zamanli") return String(a.scheduledAt).localeCompare(String(b.scheduledAt));
      return 0;
    });
  const ilkBos = bosGunler(posts, 1)[0] ?? null;

  // ── Düzenleyici: durum, eksikler, SEO kontrolleri ──
  const durum: "yayinda" | "taslak" | "zamanli" = publishMode === "scheduled" ? "zamanli" : newPost.published ? "yayinda" : "taslak";
  const durumSec = (d: typeof durum) => {
    if (d === "zamanli") { setPublishMode("scheduled"); setNewPost((p) => ({ ...p, published: false })); }
    else { setPublishMode("immediate"); setNewPost((p) => ({ ...p, published: d === "yayinda", scheduledAt: "" })); }
  };
  const kelime = newPost.content.replace(/<[^>]*>?/gm, " ").split(/\s+/).filter((w) => w.trim()).length;
  let faqSayisi = 0;
  try { faqSayisi = (JSON.parse(newPost.faq || "[]") as { q: string; a: string }[]).filter((f) => f.q.trim() && f.a.trim()).length; } catch {}
  const kw = newPost.focusKeyword.trim().toLocaleLowerCase("tr-TR");
  const kontroller = [
    { ok: !!kw, metin: "Odak kelime girildi", sekme: "seo" as const },
    { ok: !!kw && newPost.title.toLocaleLowerCase("tr-TR").includes(kw), metin: "Başlıkta odak kelime var", sekme: "yazi" as const },
    { ok: newPost.description.length >= 120 && newPost.description.length <= 160, metin: `Meta açıklama 120–160 (${newPost.description.length})`, sekme: "seo" as const },
    { ok: newPost.metaTitle.length <= 60, metin: `Meta başlık en fazla 60 (${newPost.metaTitle.length || newPost.title.length})`, sekme: "seo" as const },
    { ok: kelime >= 900, metin: `En az 900 kelime (${kelime.toLocaleString("tr-TR")})`, sekme: "yazi" as const },
    { ok: faqSayisi >= 4, metin: `En az 4 SSS (${faqSayisi})`, sekme: "ozet" as const },
    { ok: !!newPost.imageUrl, metin: "Kapak görseli", sekme: "gorsel" as const },
    { ok: !!newPost.categoryId && !!newPost.authorId, metin: "Kategori ve yazar seçildi", sekme: "yazi" as const },
  ];
  const sekmeler: { k: typeof editorSekme; ad: string; ikon: string; eksik?: number }[] = [
    { k: "yazi", ad: "Yazı", ikon: "edit_note" },
    { k: "seo", ad: "SEO", ikon: "travel_explore", eksik: kontroller.filter((c) => c.sekme === "seo" && !c.ok).length },
    { k: "gorsel", ad: "Görseller", ikon: "image", eksik: newPost.imageUrl ? 0 : 1 },
    { k: "ozet", ad: "Özet ve SSS", ikon: "quiz", eksik: faqSayisi >= 4 ? 0 : 1 },
    { k: "deneyim", ad: "Deneyim ve kaynaklar", ikon: "menu_book" },
  ];
  const kaydetMetni = kaydediliyor ? "Kaydediliyor…" : durum === "zamanli" ? "Zamanla" : durum === "taslak" ? "Taslağı kaydet" : editingPostId ? "Güncelle" : "Yayınla";
  const doluGunler = new Set(posts.filter((p) => p.id !== editingPostId).map(yaziGunu).filter(Boolean) as string[]);
  const pickerBos = bosGunler(posts, 3, editingPostId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="blog" />

      {/* ═══════════════ LİSTE EKRANI ═══════════════ */}
      {!showAdd && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">Blog</h1>
              <p className="text-xs text-on-surface-variant mt-1">
                {sayac.yayinda} yayında · {sayac.zamanli} zamanlanmış · {sayac.taslak} tarihsiz taslak
                {ilkBos && <> · <span className="font-bold text-error">İlk boş gün: {trTarih(ilkBos)}</span></>}
              </p>
            </div>
            <button
              onClick={yeniYazi}
              className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#002f6c] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Yeni yazı
            </button>
          </div>

          {/* Görünüm sekmeleri */}
          <div className="flex gap-1 border-b border-outline-variant/20 overflow-x-auto">
            {([
              ["yazilar", "Yazılar", "list"],
              ["takvim", "Takvim", "calendar_month"],
              ["motor", "Blog motoru", "auto_awesome"],
            ] as const).map(([k, ad, ikon]) => (
              <button
                key={k}
                onClick={() => setGorunum(k)}
                aria-current={gorunum === k ? "page" : undefined}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${gorunum === k ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
              >
                <span className="material-symbols-outlined text-[18px]">{ikon}</span>{ad}
              </button>
            ))}
          </div>

          {gorunum === "motor" && engineInit && (
            <BlogEngine
              initialTopic={engineInit.topic}
              initialTab={engineInit.tab}
              onDraftCreated={openDraft}
              onPostsChanged={fetchPosts}
            />
          )}

          {gorunum === "takvim" && <BlogTakvim posts={posts} onEdit={(p) => handleEdit(p)} />}

          {gorunum === "yazilar" && (
            <div className={`${kart} overflow-hidden`}>
              {/* Filtre ve arama */}
              <div className="p-3 sm:p-4 border-b border-outline-variant/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {([
                    ["tumu", "Tümü"],
                    ["taslak", "Taslak"],
                    ["zamanli", "Zamanlanmış"],
                    ["yayinda", "Yayında"],
                    ["gorselsiz", "Görselsiz"],
                  ] as const).map(([k, ad]) => (
                    <button
                      key={k}
                      onClick={() => { setFiltre(k); setSelectedPosts(new Set()); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filtre === k ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
                    >
                      {ad} <span className="opacity-70 tabular-nums">{sayac[k]}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {selectedPosts.size > 0 && (
                    <button
                      onClick={async () => {
                        if (!confirm(`${selectedPosts.size} yazı silinsin mi?`)) return;
                        for (const id of selectedPosts) {
                          await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
                        }
                        setSelectedPosts(new Set());
                        fetchPosts();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-error/10 text-error rounded-lg font-bold text-xs hover:bg-error/20 transition-colors whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                      {selectedPosts.size} sil
                    </button>
                  )}
                  <div className="relative flex-1 lg:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                      type="text"
                      placeholder="Başlık veya odak kelime ara"
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant/25 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Satırlar */}
              <div className="hidden md:grid grid-cols-[32px_1fr_150px_auto] gap-3 px-4 py-2 bg-surface-container-low/60 text-[10px] font-bold tracking-widest text-outline uppercase">
                <input
                  type="checkbox"
                  aria-label="Tümünü seç"
                  checked={listelenen.length > 0 && listelenen.every((p) => selectedPosts.has(p.id))}
                  onChange={(e) => setSelectedPosts(e.target.checked ? new Set(listelenen.map((p) => p.id)) : new Set())}
                />
                <span>Yazı</span>
                <span>Tarih</span>
                <span className="text-right">İşlem</span>
              </div>
              <ul className="divide-y divide-outline-variant/10">
                {listelenen.map((post: any) => {
                  const zamanli = !post.published && post.scheduledAt;
                  return (
                    <li key={post.id} className={`grid grid-cols-[32px_1fr] md:grid-cols-[32px_1fr_150px_auto] gap-x-3 gap-y-2 px-4 py-3 items-center hover:bg-surface-container-low/40 transition-colors ${selectedPosts.has(post.id) ? "bg-primary/[0.03]" : ""}`}>
                      <input
                        type="checkbox"
                        aria-label="Seç"
                        checked={selectedPosts.has(post.id)}
                        onChange={() => setSelectedPosts((prev) => { const n = new Set(prev); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                      />
                      <div className="min-w-0">
                        <button onClick={() => handleEdit(post)} className="text-left font-bold text-primary hover:underline leading-snug">
                          {post.title}
                        </button>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-on-surface-variant">
                          {post.published
                            ? <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Yayında</span>
                            : zamanli
                              ? <span className="font-bold text-[#8a6420] bg-[#b8862f]/10 px-1.5 py-0.5 rounded">Zamanlanmış</span>
                              : <span className="font-bold text-on-surface-variant bg-outline-variant/25 px-1.5 py-0.5 rounded">Taslak</span>}
                          {!post.imageUrl && <span className="font-bold text-error bg-error/10 px-1.5 py-0.5 rounded">Görsel yok</span>}
                          {!post.published && typeof post.seoScore === "number" && post.seoScore > 0 && (
                            <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded" title="Blog motoru kalite kapısı puanı">Kalite {post.seoScore}</span>
                          )}
                          {post.category && <span>{post.category.name}</span>}
                          <span className="text-outline">·</span>
                          {post.published ? (
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="hover:text-secondary underline inline-flex items-center gap-0.5">
                              /blog/{post.slug}<span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            </a>
                          ) : (
                            <span className="text-outline" title="Taslaklar sitede görünmez">/blog/{post.slug}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-start-2 md:col-start-auto text-xs text-on-surface-variant">
                        {zamanli ? (
                          <span className="text-[#8a6420] font-bold inline-flex items-center gap-1" title="Zamanlanmış yayın tarihi">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {new Date(post.scheduledAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : post.published ? new Date(post.createdAt).toLocaleDateString("tr-TR") : <span className="text-outline">Tarih yok</span>}
                      </div>
                      <div className="col-start-2 md:col-start-auto flex items-center md:justify-end gap-1.5 flex-wrap">
                        {deletingId === post.id ? (
                          <div className="flex items-center gap-2 bg-error/5 border border-error/20 rounded-lg px-2.5 py-1.5">
                            <span className="text-xs font-bold text-error">Silinsin mi?</span>
                            <button onClick={() => handleDelete(post.id)} className="px-2.5 py-1 bg-error text-white text-xs font-bold rounded-md hover:bg-error/85">Sil</button>
                            <button onClick={() => setDeletingId(null)} className="px-2.5 py-1 bg-outline-variant/40 text-on-surface text-xs font-bold rounded-md hover:bg-outline-variant/60">Vazgeç</button>
                          </div>
                        ) : (
                          <>
                            {!post.published && !zamanli && ilkBos && (
                              <button
                                onClick={() => hizliZamanla(post)}
                                disabled={zamanlananId === post.id}
                                className="px-2.5 py-1.5 bg-[#b8862f]/10 text-[#8a6420] text-xs font-bold rounded-lg hover:bg-[#b8862f]/20 disabled:opacity-50 inline-flex items-center gap-1 whitespace-nowrap"
                                title={`Yazısı olmayan ilk güne, ${trTarih(ilkBos)} 09:00'a zamanlar`}
                              >
                                <span className="material-symbols-outlined text-[15px]">event_available</span>
                                {zamanlananId === post.id ? "…" : `${trTarih(ilkBos)}'e zamanla`}
                              </button>
                            )}
                            {zamanli && (
                              <button
                                onClick={() => zamaniKaldir(post)}
                                disabled={zamanlananId === post.id}
                                className="px-2.5 py-1.5 text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container disabled:opacity-50 whitespace-nowrap"
                                title="Zamanlamayı kaldırır, yazı tarihsiz taslağa döner"
                              >
                                Zamanı kaldır
                              </button>
                            )}
                            {!post.published && (
                              <button
                                onClick={() => publishDraft(post.id)}
                                disabled={publishingId === post.id}
                                className="px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#002f6c] disabled:opacity-50"
                                title="Şimdi yayınla ve ölçüme bağla"
                              >
                                {publishingId === post.id ? "…" : "Yayınla"}
                              </button>
                            )}
                            <button onClick={() => handleEdit(post)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all" title="Düzenle">
                              <span className="material-symbols-outlined text-[18px] block">edit</span>
                            </button>
                            <button onClick={() => setDeletingId(post.id)} className="p-1.5 text-error hover:bg-error hover:text-white rounded-lg transition-all" title="Sil">
                              <span className="material-symbols-outlined text-[18px] block">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
                {listelenen.length === 0 && (
                  <li className="text-center py-14 text-outline text-sm">
                    <span className="material-symbols-outlined text-4xl opacity-50 block mb-2">article</span>
                    {posts.length === 0 ? "Henüz yazı yok." : "Bu filtrede yazı yok."}
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ DÜZENLEYİCİ ═══════════════ */}
      {showAdd && (
        <form ref={formRef} onSubmit={handleCreate} noValidate className="space-y-5">
          {/* Üst çubuk: her zaman görünür */}
          <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-surface/95 backdrop-blur border-b border-outline-variant/20 flex items-center gap-3">
            <button type="button" onClick={editordenCik} className="p-2 rounded-lg hover:bg-surface-container text-primary shrink-0" title="Listeye dön (Esc)">
              <span className="material-symbols-outlined block">arrow_back</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-on-surface-variant flex items-center gap-2">
                {editingPostId ? "Yazıyı düzenle" : "Yeni yazı"}
                {degisti && <span className="text-[#8a6420]">· kaydedilmedi</span>}
              </p>
              <p className="font-bold text-primary truncate">{newPost.title || "Başlıksız yazı"}</p>
            </div>
            {editingPostId && (
              <button
                type="button"
                onClick={() => { setShowVersionHistory(!showVersionHistory); if (!showVersionHistory) fetchVersions(editingPostId); }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg font-bold text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">history</span>Sürümler
              </button>
            )}
            {newPost.published && newPost.slug && editingPostId && (
              <a href={`/blog/${newPost.slug}`} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>Sitede gör
              </a>
            )}
            <button
              type="submit"
              disabled={kaydediliyor}
              className="bg-primary hover:bg-[#002f6c] text-white px-4 sm:px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60 shrink-0"
              title="Kaydet (Ctrl+S)"
            >
              <span className="material-symbols-outlined text-[18px]">{durum === "zamanli" ? "schedule" : durum === "taslak" ? "save" : "publish"}</span>
              {kaydetMetni}
            </button>
          </div>

          {/* Sürüm geçmişi */}
          {showVersionHistory && editingPostId && (
            <div className={`${kart} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-primary text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>Sürüm geçmişi (son 20)
                </h4>
                <button type="button" onClick={() => setShowVersionHistory(false)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px] block">close</span>
                </button>
              </div>
              {loadingVersions ? (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Yükleniyor…</div>
              ) : versions.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Henüz sürüm yok. Her güncellemede otomatik kaydedilir.</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-3 bg-white border border-outline-variant/15 rounded-lg px-3 py-2">
                      <div className="min-w-0 text-sm truncate">
                        <span className="text-xs font-bold text-primary">v{v.version}</span>
                        <span className="mx-2 text-outline-variant">·</span>
                        <span className="font-medium">{v.title}</span>
                        <span className="mx-2 text-outline-variant">·</span>
                        <span className="text-xs text-outline">{new Date(v.createdAt).toLocaleString("tr-TR")}</span>
                      </div>
                      <button type="button" onClick={() => restoreVersion(v)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-[14px]">restore</span>Geri yükle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
            {/* ── Sol: yazı alanı ── */}
            <div className="space-y-4 min-w-0">
              <div className={`${kart} p-4 space-y-3`}>
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 outline-none font-headline text-xl sm:text-2xl font-bold text-primary pb-2 placeholder:text-outline/50"
                  value={newPost.title}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Yazı başlığı (H1)"
                  aria-label="Yazı başlığı"
                />
                <label className="flex items-center gap-1 text-sm text-on-surface-variant">
                  <span className="text-outline shrink-0">/blog/</span>
                  <input
                    className="flex-1 min-w-0 bg-transparent border-0 border-b border-dashed border-outline-variant/40 focus:border-primary focus:ring-0 outline-none py-0.5 text-secondary"
                    value={newPost.slug}
                    onChange={(e) => setNewPost((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="adres-bos-kalirsa-basliktan-uretilir"
                    aria-label="URL adresi"
                  />
                </label>
              </div>

              {/* Sekmeler */}
              <div className="flex gap-1 border-b border-outline-variant/20 overflow-x-auto">
                {sekmeler.map((s) => (
                  <button
                    key={s.k}
                    type="button"
                    onClick={() => setEditorSekme(s.k)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${editorSekme === s.k ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{s.ikon}</span>
                    {s.ad}
                    {!!s.eksik && <span className="w-1.5 h-1.5 rounded-full bg-error" title="Eksik var" />}
                  </button>
                ))}
              </div>

              {/* ── Sekme: Yazı ── */}
              <div className={editorSekme === "yazi" ? "space-y-3" : "hidden"}>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Yapay zekayla düzenle */}
                  <div className="flex-1 flex gap-2">
                    <input
                      className={inp}
                      placeholder="Yapay zekaya talimat: ör. son paragrafı daha samimi yaz"
                      value={aiEditInstruction}
                      onChange={(e) => setAiEditInstruction(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleEditAI(); } }}
                    />
                    <button
                      type="button"
                      onClick={handleEditAI}
                      disabled={isAiEditing || !aiEditInstruction || !newPost.content}
                      className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 rounded-lg font-bold text-xs flex items-center gap-1 whitespace-nowrap disabled:opacity-40"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${isAiEditing ? "animate-spin" : ""}`}>{isAiEditing ? "sync" : "magic_button"}</span>
                      {isAiEditing ? "Düzenleniyor" : "Uygula"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMarkdownPaste((v) => !v)}
                    className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 whitespace-nowrap border ${showMarkdownPaste ? "bg-[#b8862f] text-white border-[#b8862f]" : "border-[#b8862f]/35 text-[#8a6420] hover:bg-[#b8862f]/10"}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">content_paste</span>Markdown yapıştır
                  </button>
                  <div className="flex bg-surface-container rounded-lg p-0.5 self-start sm:self-auto">
                    {(["edit", "preview"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setViewMode(m)}
                        className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${viewMode === m ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"}`}
                      >
                        {m === "edit" ? "Düzenle" : "Önizleme"}
                      </button>
                    ))}
                  </div>
                </div>

                {showMarkdownPaste && (
                  <div className="rounded-xl border border-dashed border-[#b8862f]/40 bg-[#b8862f]/[0.05] p-3 space-y-2">
                    <p className="text-xs text-[#8a6420] font-bold">Claude'un ürettiği Markdown metnini yapıştır; HTML'e çevrilir.</p>
                    <textarea
                      value={markdownInput}
                      onChange={(e) => setMarkdownInput(e.target.value)}
                      placeholder="Markdown metni…"
                      className="w-full h-56 p-3 text-sm font-mono border border-[#b8862f]/25 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-[#b8862f]/40"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!markdownInput.trim()) return;
                          const html = await marked.parse(markdownInput);
                          setNewPost((prev) => ({ ...prev, content: prev.content ? prev.content + html : html }));
                          setMarkdownInput("");
                          setShowMarkdownPaste(false);
                          toast("Markdown HTML'e çevrildi ve yazının sonuna eklendi.", "success");
                        }}
                        className="flex items-center gap-1.5 bg-[#b8862f] hover:bg-[#8f6a24] text-white px-4 py-2 rounded-lg font-bold text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>Sona ekle
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!markdownInput.trim()) return;
                          if (newPost.content && !confirm("Mevcut yazının tamamı bu metinle değiştirilsin mi?")) return;
                          const html = await marked.parse(markdownInput);
                          setNewPost((prev) => ({ ...prev, content: html }));
                          setMarkdownInput("");
                          setShowMarkdownPaste(false);
                          toast("Markdown çevrildi, mevcut içerik değiştirildi.", "success");
                        }}
                        className="flex items-center gap-1.5 bg-white border border-[#b8862f]/35 hover:bg-[#b8862f]/10 text-[#8a6420] px-4 py-2 rounded-lg font-bold text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>Tümünü değiştir
                      </button>
                      <button type="button" onClick={() => setMarkdownInput("")} className="text-xs text-outline hover:text-on-surface-variant px-3 py-2 rounded-lg hover:bg-surface-container">
                        Temizle
                      </button>
                    </div>
                  </div>
                )}

                {viewMode === "edit" ? (
                  <>
                    <div className="bg-white rounded-xl border border-outline-variant/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-[64px] [&_.ql-toolbar]:z-20 [&_.ql-toolbar]:bg-white [&_.ql-toolbar]:rounded-t-xl">
                      <ReactQuill
                        theme="snow"
                        value={thToTd(newPost.content)}
                        onChange={(val) => setNewPost((prev) => ({ ...prev, content: val }))}
                        modules={modules}
                        className="min-h-[600px] text-base"
                        placeholder="Yazını buraya yaz ya da Markdown yapıştır…"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant text-right tabular-nums">{kelime.toLocaleString("tr-TR")} kelime</p>

                    {extractedImages.length > 0 && (
                      <div className={`${kart} p-4`}>
                        <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[18px]">imagesmode</span>Metin içindeki görseller
                        </h4>
                        <p className="text-xs text-on-surface-variant mb-3">Her görselin yerleşimini tek tıkla değiştir.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {extractedImages.map((img) => (
                            <div key={img.id} className="bg-white border border-outline-variant/20 rounded-lg overflow-hidden">
                              <div className="h-24 bg-surface-container">
                                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] font-bold text-on-surface-variant truncate px-2 pt-1.5" title={img.alt}>{img.alt || "Alt metin yok"}</p>
                              <div className="grid grid-cols-3 gap-1 p-2">
                                {([
                                  ["Yasla", "align_horizontal_left", "width: 45%; min-width: 200px; max-width: 350px; float: left; margin: 15px 25px 15px 0; border-radius: 12px; height: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);"],
                                  ["Orta", "align_horizontal_center", "width: 100%; max-width: 500px; margin: 30px auto; display: block; border-radius: 16px; height: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"],
                                  ["Tam boy", "crop_din", "width: 100%; margin: 35px 0; display: block; border-radius: 20px; height: auto; box-shadow: 0 15px 40px rgba(0,0,0,0.15);"],
                                ] as const).map(([ad, ikon, stil]) => (
                                  <button
                                    key={ad}
                                    type="button"
                                    onClick={() => updateImageStyle(img.src, stil)}
                                    className="flex flex-col items-center gap-0.5 text-[9px] font-bold bg-surface-container py-1.5 rounded-md text-secondary hover:bg-primary hover:text-white transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">{ikon}</span>{ad}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-6 md:p-12 border border-outline-variant/30 min-h-[500px]">
                    <article className="max-w-3xl mx-auto">
                      {newPost.imageUrl && (
                        <div className="w-full h-[320px] mb-10 rounded-2xl overflow-hidden border border-outline-variant/10">
                          <img src={newPost.imageUrl} alt={newPost.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-outline mb-6 font-bold">
                        <span className="bg-primary/5 text-primary px-3 py-1 rounded-full">{new Date().toLocaleDateString("tr-TR")}</span>
                        <span>{authors.find((a) => a.id === newPost.authorId)?.name || "Yazar seçilmedi"}</span>
                      </div>
                      <h1 className="font-headline text-4xl lg:text-5xl text-primary font-bold leading-[1.15] tracking-tight mb-10">
                        {newPost.title || "Başlık girilmedi"}
                      </h1>
                      {newPost.tldr && (
                        <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-5 mb-10 text-[15px] text-[#334155] whitespace-pre-line">{newPost.tldr}</div>
                      )}
                      <div className={breathtakingStyles} dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </article>
                  </div>
                )}
              </div>

              {/* ── Sekme: SEO ── */}
              <div className={editorSekme === "seo" ? "space-y-4" : "hidden"}>
                <div className={`${kart} p-4 space-y-4`}>
                  <div>
                    <label className={lbl}>Odak anahtar kelime <span className="font-normal text-outline">zorunlu</span></label>
                    <input className={`${inp} font-bold`} value={newPost.focusKeyword} onChange={(e) => setNewPost((prev) => ({ ...prev, focusKeyword: e.target.value }))} placeholder="ör. bireysel umre fiyatları" />
                  </div>
                  <div>
                    <label className={lbl}>
                      Meta başlık (Google'da görünen başlık)
                      <span className={`tabular-nums ${newPost.metaTitle.length > 60 ? "text-error" : newPost.metaTitle.length >= 50 ? "text-secondary" : "text-outline"}`}>{newPost.metaTitle.length}/60</span>
                    </label>
                    <input className={inp} value={newPost.metaTitle} onChange={(e) => setNewPost((prev) => ({ ...prev, metaTitle: e.target.value }))} placeholder="Boş kalırsa yazı başlığı kullanılır. 50–60 karakter ideal." />
                  </div>
                  <div>
                    <label className={lbl}>
                      <span>Meta açıklama <span className="font-normal text-outline">zorunlu</span></span>
                      <span className={`tabular-nums ${newPost.description.length > 160 ? "text-error" : newPost.description.length >= 120 ? "text-secondary" : "text-outline"}`}>{newPost.description.length}/160</span>
                    </label>
                    <textarea className={`${inp} min-h-[90px]`} value={newPost.description} onChange={(e) => setNewPost((prev) => ({ ...prev, description: e.target.value }))} placeholder="Google'da başlığın altında görünen özet. 120–160 karakter." />
                  </div>
                  <div>
                    <label className={lbl}>SEO anahtar kelimeleri <span className="font-normal text-outline">virgülle ayır</span></label>
                    <input className={inp} value={newPost.keywords} onChange={(e) => setNewPost((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="umre, bireysel umre, umre vizesi" />
                  </div>
                </div>

                {/* Google önizlemesi */}
                <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-5">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">google</span>Google'da böyle görünür
                  </p>
                  <div className="max-w-[600px]">
                    <p className="text-[12px] text-[#4d5156] truncate">{SITE_URL.replace("https://", "")} › blog › {newPost.slug || "adres"}</p>
                    <h3 className="text-[#1a0dab] text-[20px] leading-[1.3] mt-1 line-clamp-2">{newPost.metaTitle || newPost.title || "Başlık girilmedi"}</h3>
                    <p className="text-[#4d5156] text-[14px] leading-[1.58] mt-1 line-clamp-2">
                      <span className="text-[#70757a]">{new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })} — </span>
                      {newPost.description || "Meta açıklama girilmedi."}
                    </p>
                  </div>
                </div>

                {/* Yapay zekayla derin SEO analizi */}
                <div className={`${kart} p-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-primary flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">psychology</span>Yapay zekayla derin SEO analizi</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Okunabilirlik, arama amacına uyum, eksik kelimeler ve öneriler.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAnalyzeSEO}
                      disabled={isAnalyzing || !newPost.focusKeyword}
                      className="bg-primary hover:bg-[#002f6c] text-white px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${isAnalyzing ? "animate-spin" : ""}`}>{isAnalyzing ? "sync" : "radar"}</span>
                      {isAnalyzing ? "Analiz ediliyor…" : "Analiz et"}
                    </button>
                  </div>
                  {aiAnalysisResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-outline-variant/15">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-on-surface-variant">Okunabilirlik</span>
                          <span className="font-bold text-primary">{aiAnalysisResult.okunabilirlik_puani} / 100</span>
                        </div>
                        <div className="flex justify-between items-center text-sm gap-3">
                          <span className="text-on-surface-variant">Arama amacına uyum</span>
                          <span className={`font-bold px-2.5 py-1 rounded-md text-xs ${aiAnalysisResult.kullanici_amaci_uyumu?.toLowerCase().includes("evet") ? "bg-secondary text-white" : "bg-error text-white"}`}>{aiAnalysisResult.kullanici_amaci_uyumu}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant mb-2">Eksik kelimeler</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(aiAnalysisResult.eksik_lsi_kelimeler || []).map((w: string, i: number) => (
                              <span key={i} className="bg-surface-container px-2.5 py-1 rounded-md text-xs font-bold text-secondary">{w}</span>
                            ))}
                            {(!aiAnalysisResult.eksik_lsi_kelimeler || aiAnalysisResult.eksik_lsi_kelimeler.length === 0) && <span className="text-xs text-secondary font-bold">Eksik kelime yok.</span>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface-variant mb-2">Öneriler</p>
                        <ul className="space-y-2">
                          {(aiAnalysisResult.gelistirme_onerileri || []).map((tip: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-[#334155] bg-primary/5 p-3 rounded-lg">
                              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">check_circle</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Sekme: Görseller ── */}
              <div className={editorSekme === "gorsel" ? "space-y-4" : "hidden"}>
                <div className={`${kart} p-4`}>
                  <label className={lbl}>Kapak görseli alt metni</label>
                  <input className={inp} value={newPost.imageAlt} onChange={(e) => setNewPost((prev) => ({ ...prev, imageAlt: e.target.value }))} placeholder="ör. Mescid-i Nebevi'nin avlusu, öğle vakti" />
                </div>
                <p className="text-xs text-on-surface-variant">
                  İlk kutu kapak görseli. Diğer kutular yazıdaki ara başlıklardan otomatik çıkar; yüklediğin görsel kaydederken o başlığın hemen altına eklenir.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <MediaUploader
                    title="Kapak görseli"
                    slug={newPost.slug || "ana-kapak"}
                    currentUrl={newPost.imageUrl}
                    onUploadComplete={(url) => setNewPost((prev) => ({ ...prev, imageUrl: url }))}
                  />
                  {parsedHeadings.map((h, i) => (
                    <MediaUploader
                      key={i}
                      title={`${h.order}. ${h.text} (${h.tag.toUpperCase()})`}
                      slug={h.slug}
                      currentUrl={mediaMap[h.text] || ""}
                      onUploadComplete={(url) => setMediaMap((prev) => ({ ...prev, [h.text]: url }))}
                    />
                  ))}
                  {parsedHeadings.length === 0 && (
                    <div className="flex items-center justify-center p-6 border-2 border-dashed border-outline-variant/40 rounded-xl text-xs text-outline text-center">
                      Yazıya ara başlık (H2/H3) ekleyince her başlık için burada bir görsel kutusu çıkar.
                    </div>
                  )}
                </div>
              </div>

              {/* ── Sekme: Özet ve SSS ── */}
              <div className={editorSekme === "ozet" ? "space-y-4" : "hidden"}>
                <div className={`${kart} p-4`}>
                  <label className={lbl}>Kısa özet (TL;DR) <span className="font-normal text-outline">yazının başında gösterilir</span></label>
                  <textarea className={`${inp} min-h-[90px]`} value={newPost.tldr} onChange={(e) => setNewPost((prev) => ({ ...prev, tldr: e.target.value }))} placeholder="3–4 madde ya da kısa bir paragraf." />
                </div>
                <div className={`${kart} p-4 space-y-3`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-primary">Sık sorulan sorular</h4>
                      <p className="text-xs text-on-surface-variant">Google için SSS işaretlemesi otomatik eklenir. En az 4 soru.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        let current: { q: string; a: string }[] = [];
                        try { current = JSON.parse(newPost.faq || "[]"); } catch {}
                        setNewPost((prev) => ({ ...prev, faq: JSON.stringify([...current, { q: "", a: "" }]) }));
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#002f6c] whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>Soru ekle
                    </button>
                  </div>
                  {(() => {
                    let items: { q: string; a: string }[] = [];
                    try { items = JSON.parse(newPost.faq || "[]"); } catch {}
                    const yaz = (next: { q: string; a: string }[]) => setNewPost((prev) => ({ ...prev, faq: JSON.stringify(next) }));
                    return items.length === 0 ? (
                      <p className="text-xs text-outline text-center py-6 border border-dashed border-outline-variant/40 rounded-lg">Henüz soru yok.</p>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="bg-surface-container-low rounded-lg p-3 space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-primary">Soru {idx + 1}</span>
                              <div className="flex items-center gap-0.5">
                                <button type="button" disabled={idx === 0} onClick={() => { const n = [...items]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; yaz(n); }} className="p-1 text-outline hover:text-primary disabled:opacity-30" title="Yukarı taşı">
                                  <span className="material-symbols-outlined text-[16px] block">arrow_upward</span>
                                </button>
                                <button type="button" disabled={idx === items.length - 1} onClick={() => { const n = [...items]; [n[idx + 1], n[idx]] = [n[idx], n[idx + 1]]; yaz(n); }} className="p-1 text-outline hover:text-primary disabled:opacity-30" title="Aşağı taşı">
                                  <span className="material-symbols-outlined text-[16px] block">arrow_downward</span>
                                </button>
                                <button type="button" onClick={() => yaz(items.filter((_, i) => i !== idx))} className="p-1 text-outline hover:text-error" title="Soruyu sil">
                                  <span className="material-symbols-outlined text-[16px] block">close</span>
                                </button>
                              </div>
                            </div>
                            <input className={inp} value={item.q} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], q: e.target.value }; yaz(n); }} placeholder="Soru" />
                            <textarea className={`${inp} min-h-[70px]`} value={item.a} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], a: e.target.value }; yaz(n); }} placeholder="Cevap" />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ── Sekme: Deneyim ve kaynaklar ── */}
              <div className={editorSekme === "deneyim" ? "space-y-4" : "hidden"}>
                <div className={`${kart} p-4`}>
                  <label className={lbl}>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">volunteer_activism</span>Kişisel deneyim</span>
                    <button type="button" disabled={polishing || !newPost.personalExperience.trim()} onClick={polishExperience} className="text-secondary font-bold flex items-center gap-1 hover:underline disabled:opacity-40" title="Kısa notlarını düzgün bir paragrafa çevirir; notlarda olmayan bilgi eklemez">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>{polishing ? "Düzenleniyor…" : "Notlarımdan düzenle"}
                    </button>
                  </label>
                  <textarea className={`${inp} min-h-[120px] bg-[#f4f7fb]`} value={newPost.personalExperience} onChange={(e) => setNewPost((prev) => ({ ...prev, personalExperience: e.target.value }))} placeholder="Gerçekten yaşadığın bir şey: kısa notlar yazıp 'Notlarımdan düzenle'ye basabilirsin. Boş kalırsa sitede kutu görünmez." />
                  <p className="text-[11px] text-on-surface-variant mt-1.5">Sitede yazının içinde "Yazarın Kişisel Deneyimi" kutusu olarak, yazarın adıyla görünür.</p>
                </div>
                <div className={`${kart} p-4`}>
                  <label className={lbl}><span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">menu_book</span>Kaynaklar</span><span className="font-normal text-outline">her satıra bir bağlantı</span></label>
                  <textarea className={`${inp} min-h-[100px]`} value={newPost.references} onChange={(e) => setNewPost((prev) => ({ ...prev, references: e.target.value }))} placeholder="Başlık — https://… (sitede yalnızca resmî kaynaklar gösterilir: nusuk.sa, .gov.sa, diyanet.gov.tr)" />
                </div>
                <div className={`${kart} p-4`}>
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5 mb-1"><span className="material-symbols-outlined text-[18px]">link</span>İç link önerileri</h4>
                  <p className="text-xs text-on-surface-variant mb-3">Yalnızca yayındaki yazılar listelenir; taslağa link verilmez. Kopyala, yazıda ilgili kelimeye bağla.</p>
                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                    {posts.filter((p) => p.id !== editingPostId && p.published).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 bg-white border border-outline-variant/15 rounded-lg px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-primary truncate">{p.title}</p>
                          <p className="text-[10px] text-outline truncate">/blog/{p.slug}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(`${SITE_URL}/blog/${p.slug}`); toast("Bağlantı kopyalandı.", "success"); }}
                          className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold hover:bg-primary hover:text-white shrink-0"
                        >
                          Kopyala
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sağ: sabit panel ── */}
            <aside className="space-y-4 lg:sticky lg:top-[76px]">
              {/* Yayın */}
              <div className={`${kart} p-4 space-y-3`}>
                <h4 className="font-bold text-sm text-primary">Yayın</h4>
                <div className="grid grid-cols-3 bg-surface-container rounded-lg p-0.5">
                  {([
                    ["yayinda", "Yayında"],
                    ["taslak", "Taslak"],
                    ["zamanli", "Zamanla"],
                  ] as const).map(([k, ad]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => durumSec(k)}
                      className={`py-2 text-xs font-bold rounded-md transition-all ${durum === k ? (k === "zamanli" ? "bg-[#b8862f] text-white shadow-sm" : k === "yayinda" ? "bg-primary text-white shadow-sm" : "bg-white text-on-surface shadow-sm") : "text-on-surface-variant"}`}
                    >
                      {ad}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {durum === "yayinda" ? "Kaydedince sitede görünür." : durum === "taslak" ? "Kaydedilir ama sitede görünmez." : "Seçtiğin gün ve saatte kendiliğinden yayına girer."}
                </p>

                {durum === "zamanli" && (() => {
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const { y, m } = pickerViewMonth;
                  const firstDow = calFirstDow(y, m);
                  const daysInMonth = calDaysInMonth(y, m);
                  const prevMonth = () => setPickerViewMonth((prev) => (prev.m === 0 ? { y: prev.y - 1, m: 11 } : { y: prev.y, m: prev.m - 1 }));
                  const nextMonth = () => setPickerViewMonth((prev) => (prev.m === 11 ? { y: prev.y + 1, m: 0 } : { y: prev.y, m: prev.m + 1 }));
                  const isSelected = (d: number) => pickerDate.getFullYear() === y && pickerDate.getMonth() === m && pickerDate.getDate() === d;
                  const isPast = (d: number) => new Date(y, m, d) < today;
                  const isToday = (d: number) => new Date(y, m, d).toDateString() === today.toDateString();
                  const gunSec = (k: string) => {
                    const [yy, mm, dd] = k.split("-").map(Number);
                    setPickerDate(new Date(yy, mm - 1, dd));
                    setPickerViewMonth({ y: yy, m: mm - 1 });
                  };
                  return (
                    <div className="space-y-3">
                      {pickerBos.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-on-surface-variant mb-1.5">Boş günler</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pickerBos.map((k) => (
                              <button key={k} type="button" onClick={() => gunSec(k)} className="px-2.5 py-1 rounded-md text-xs font-bold bg-error/5 text-error border border-dashed border-error/30 hover:bg-error/10">
                                {trTarih(k)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container text-outline">
                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <span className="font-bold text-sm text-primary">{TR_MONTHS[m]} {y}</span>
                        <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container text-outline">
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-0.5">
                        {TR_DAYS_SHORT.map((d) => <div key={d} className="text-center text-[10px] font-bold text-outline py-1">{d}</div>)}
                        {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const past = isPast(day);
                          const sel = isSelected(day);
                          const dolu = doluGunler.has(`${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={past}
                              onClick={() => setPickerDate(new Date(y, m, day))}
                              title={dolu ? "Bu günde yazı var" : undefined}
                              className={`relative aspect-square w-full flex items-center justify-center rounded-full text-xs font-bold transition-colors
                                ${sel ? "bg-primary text-white" : ""}
                                ${!sel && isToday(day) ? "border-2 border-primary text-primary" : ""}
                                ${!sel && !isToday(day) && !past ? "text-on-surface hover:bg-primary/10" : ""}
                                ${past ? "text-outline-variant cursor-not-allowed" : ""}`}
                            >
                              {day}
                              {dolu && !past && <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${sel ? "bg-white" : "bg-[#b8862f]"}`} />}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                        <span className="text-xs font-bold text-on-surface-variant">Saat</span>
                        <input
                          type="time"
                          value={pickerTime}
                          onChange={(e) => setPickerTime(e.target.value)}
                          className="ml-auto bg-white border border-outline-variant/30 rounded-lg px-2 py-1.5 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div className="bg-[#b8862f]/10 rounded-lg px-3 py-2 text-xs font-bold text-[#8a6420] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
                        {new Date(pickerDate.getFullYear(), pickerDate.getMonth(), pickerDate.getDate(), ...(pickerTime.split(":").map(Number) as [number, number])).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
                        {doluGunler.has(`${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, "0")}-${String(pickerDate.getDate()).padStart(2, "0")}`) && <span className="text-error"> · bu günde başka yazı var</span>}
                      </div>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  disabled={kaydediliyor}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-60 ${durum === "zamanli" ? "bg-[#b8862f] hover:bg-[#8f6a24]" : "bg-primary hover:bg-[#002f6c]"}`}
                >
                  {kaydetMetni}
                </button>
                <p className="text-[10px] text-outline text-center">Ctrl+S ile kaydet · Esc ile listeye dön</p>
              </div>

              {/* Ayarlar */}
              <div className={`${kart} p-4 space-y-3`}>
                <div>
                  <label className={lbl}>Kategori</label>
                  <select className={`${inp} cursor-pointer`} value={newPost.categoryId} onChange={(e) => setNewPost((prev) => ({ ...prev, categoryId: e.target.value }))}>
                    <option value="">Kategori seç</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Yazar <span className="font-normal text-outline">zorunlu</span></label>
                  <select className={`${inp} cursor-pointer`} value={newPost.authorId} onChange={(e) => setNewPost((prev) => ({ ...prev, authorId: e.target.value }))}>
                    <option value="">Yazar seç</option>
                    {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Etiketler <span className="font-normal text-outline">virgülle ayır</span></label>
                  <input className={inp} value={newPost.tags} onChange={(e) => setNewPost((prev) => ({ ...prev, tags: e.target.value }))} placeholder="umre, mekke, medine" />
                  {newPost.tags && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {newPost.tags.split(",").map((t, i) => t.trim() && <span key={i} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{t.trim()}</span>)}
                    </div>
                  )}
                </div>
              </div>

              {/* Kapak */}
              <button type="button" onClick={() => setEditorSekme("gorsel")} className={`${kart} p-3 w-full text-left flex items-center gap-3 hover:border-primary/30`}>
                {newPost.imageUrl
                  ? <img src={newPost.imageUrl} alt="" className="w-16 h-12 rounded-md object-cover shrink-0" />
                  : <span className="w-16 h-12 rounded-md bg-error/5 border border-dashed border-error/30 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error/60">add_photo_alternate</span></span>}
                <span className="text-xs">
                  <span className="font-bold text-primary block">Kapak görseli</span>
                  <span className="text-on-surface-variant">{newPost.imageUrl ? "Değiştirmek için tıkla" : "Henüz yok, eklemek için tıkla"}</span>
                </span>
              </button>

              {/* SEO puanı ve kontrol listesi */}
              <div className={`${kart} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-primary">SEO puanı</h4>
                  <span className={`font-headline font-black text-xl tabular-nums ${newPost.seoScore >= 80 ? "text-secondary" : newPost.seoScore >= 50 ? "text-[#b8862f]" : "text-error"}`}>{newPost.seoScore}<span className="text-xs text-outline font-bold">/100</span></span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-3">
                  <div className={`h-full transition-all duration-500 ${newPost.seoScore >= 80 ? "bg-secondary" : newPost.seoScore >= 50 ? "bg-[#b8862f]" : "bg-error"}`} style={{ width: `${newPost.seoScore}%` }} />
                </div>
                <ul className="space-y-1">
                  {kontroller.map((c) => (
                    <li key={c.metin}>
                      <button type="button" onClick={() => setEditorSekme(c.sekme)} className="w-full flex items-start gap-1.5 text-left text-xs hover:bg-surface-container-low rounded px-1 py-0.5">
                        <span className={`material-symbols-outlined text-[15px] shrink-0 ${c.ok ? "text-secondary" : "text-error/70"}`}>{c.ok ? "check_circle" : "radio_button_unchecked"}</span>
                        <span className={c.ok ? "text-on-surface-variant" : "text-on-surface font-medium"}>{c.metin}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </form>
      )}
    </div>
  );
}
