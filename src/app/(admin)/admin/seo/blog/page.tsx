"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorLine, PageHead, Section, formatDate } from "@/components/admin/seo/ui";
import type { BlogOpportunity } from "@/lib/geo-blog/opportunities";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  tldr: string | null;
  faq: string | null;
  keywords: string | null;
  published: boolean;
  focusKeyword: string | null;
  seoScore: number | null;
  references: string | null;
  createdAt: string;
}

interface StreamLog {
  step: string;
  message?: string;
  data?: unknown;
  error?: string;
}

function GeoBlogDesk() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  const [topic, setTopic] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<StreamLog[]>([]);
  const [opportunities, setOpportunities] = useState<(BlogOpportunity & { id?: string })[]>([]);
  const [loadingOps, setLoadingOps] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [previewPost, setPreviewPost] = useState<PostItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoadingOps(true);
    try {
      const res = await fetch("/api/admin/geo-blog/opportunities");
      const json = await res.json();
      if (res.ok && json.opportunities) {
        setOpportunities(json.opportunities);
      }
    } catch (e) {
      console.error("Fırsatlar yüklenemedi:", e);
    } finally {
      setLoadingOps(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/admin/geo-blog/drafts");
      const json = await res.json();
      if (res.ok && json.posts) {
        setPosts(json.posts);
      }
    } catch (e) {
      console.error("Yazılar yüklenemedi:", e);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    fetchPosts();
  }, [fetchOpportunities, fetchPosts]);

  const handleGenerate = async (topicToRun?: string) => {
    const targetTopic = (topicToRun || topic).trim();
    if (!targetTopic || isGenerating) return;

    setError(null);
    setIsGenerating(true);
    setLogs([]);

    try {
      const res = await fetch("/api/admin/geo-blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Yanıt gövdesi bulunamadı.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            setLogs((prev) => [...prev, parsed]);
          } catch (e) {
            console.error("NDJSON okuma hatası:", e, line);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          setLogs((prev) => [...prev, parsed]);
        } catch {
          // ignore trailing
        }
      }

      await fetchPosts();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setError(errMsg);
      setLogs((prev) => [...prev, { step: "error", error: errMsg }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (postId: string) => {
    setPublishingId(postId);
    try {
      const res = await fetch("/api/admin/geo-blog/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Yayınlama başarısız.");
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, published: true } : p))
      );
      if (previewPost?.id === postId) {
        setPreviewPost((prev) => (prev ? { ...prev, published: true } : null));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Yayınlama hatası.");
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <>
      <PageHead
        n="07"
        title="GEO Blog Motoru"
        lede="Google AI Overviews ve ChatGPT'de yüksek görünürlük ve kaynak alıntılanabilirliği için tasarlanmış canlı web araştırmalı blog içerik motoru."
      />

      <ErrorLine>{error}</ErrorLine>

      <Section title="Yeni İçerik Üret" aside="Claude web search + Alıntılanabilirlik Kalite Kapısı">
        <div className="max-w-[800px] space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              className="seo-input flex-1 text-[15px]"
              placeholder="Yazı konusu veya ana soru (örn: Umre çantasında ne olmalı?)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
            <button
              type="submit"
              className="seo-btn whitespace-nowrap"
              disabled={!topic.trim() || isGenerating}
            >
              {isGenerating ? "Üretiliyor..." : "Araştır & Üret →"}
            </button>
          </form>

          {isGenerating && (
            <div className="rounded-[4px] bg-[var(--seo-paper-2)] p-4 font-mono text-[13px] text-[var(--seo-ink)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--seo-mark)] font-semibold">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--seo-mark)] animate-ping" />
                Canlı İşlem İlerlemesi
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-1 text-[12px] text-[var(--seo-ink-2)]">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-[var(--seo-ink-3)]">[{log.step}]</span>
                    {log.error ? (
                      <span className="text-[var(--seo-danger)]">{log.error}</span>
                    ) : (
                      <span>{log.message || JSON.stringify(log.data)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Fırsat Kuyruğu" aside="AI Görünürlük içerik boşlukları ve arama fırsatları">
        {loadingOps ? (
          <p className="text-[14px] text-[var(--seo-ink-3)]">Fırsatlar taranıyor...</p>
        ) : opportunities.length === 0 ? (
          <p className="text-[14px] text-[var(--seo-ink-3)]">Şu an taranmış açık fırsat bulunmuyor.</p>
        ) : (
          <div className="grid gap-3 max-w-[960px]">
            {opportunities.map((op) => (
              <div
                key={op.topic}
                className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[4px] bg-[var(--seo-paper-2)] p-4 sm:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--seo-ink)]">{op.topic}</h3>
                  <p className="mt-1 text-[13px] text-[var(--seo-ink-3)]">{op.reason}</p>
                </div>
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold text-[var(--seo-ink-2)] bg-[var(--seo-rule)]">
                  {op.source}
                </span>
                <button
                  type="button"
                  className="seo-btn text-[12px] py-1 px-3"
                  disabled={isGenerating}
                  onClick={() => {
                    setTopic(op.topic);
                    handleGenerate(op.topic);
                  }}
                >
                  Üret →
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Yazılar ve Taslaklar" aside="Kalite kapısından geçmiş blog içerikleri">
        {loadingPosts ? (
          <p className="text-[14px] text-[var(--seo-ink-3)]">Yazılar yükleniyor...</p>
        ) : posts.length === 0 ? (
          <p className="text-[14px] text-[var(--seo-ink-3)]">Henüz üretilmiş bir yazı bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="seo-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Odak Kelime</th>
                  <th className="num">Kalite Puanı</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div>
                        <span className="font-semibold text-[var(--seo-ink)]">{post.title}</span>
                        <div className="text-[12px] text-[var(--seo-ink-3)] seo-mono">/blog/{post.slug}</div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[13px] font-medium text-[var(--seo-ink-2)]">
                        {post.focusKeyword || "—"}
                      </span>
                    </td>
                    <td className="num">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[12px] font-bold ${
                          (post.seoScore ?? 0) >= 80
                            ? "bg-[var(--seo-mark)] text-white"
                            : "bg-[var(--seo-paper-2)] text-[var(--seo-ink-2)]"
                        }`}
                      >
                        {post.seoScore != null ? `${post.seoScore}/100` : "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[12px] font-bold ${
                          post.published ? "text-[var(--seo-mark)]" : "text-[var(--seo-ink-3)]"
                        }`}
                      >
                        {post.published ? "Yayınlandı" : "Taslak"}
                      </span>
                    </td>
                    <td className="text-[13px] text-[var(--seo-ink-3)]">
                      {formatDate(post.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="seo-link text-[13px]"
                          onClick={() => setPreviewPost(post)}
                        >
                          Önizle
                        </button>
                        {!post.published && (
                          <button
                            type="button"
                            className="seo-btn text-[12px] py-1 px-2.5"
                            disabled={publishingId === post.id}
                            onClick={() => handlePublish(post.id)}
                          >
                            {publishingId === post.id ? "Yayınlanıyor..." : "Yayınla"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Önizleme Modal */}
      {previewPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewPost(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[840px] overflow-y-auto rounded-lg bg-[var(--seo-paper)] p-6 shadow-xl border border-[var(--seo-rule)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[var(--seo-rule)] pb-4">
              <div>
                <span className="text-[12px] font-bold text-[var(--seo-mark)]">
                  {previewPost.published ? "Yayınlanmış Blog" : "Blog Taslağı"} · SEO Puanı: {previewPost.seoScore ?? 0}/100
                </span>
                <h2 className="text-[22px] font-extrabold text-[var(--seo-ink)] mt-1">{previewPost.title}</h2>
                <p className="text-[13px] text-[var(--seo-ink-3)] seo-mono">/blog/{previewPost.slug}</p>
              </div>
              <button
                type="button"
                className="text-[20px] font-bold text-[var(--seo-ink-3)] hover:text-[var(--seo-ink)]"
                onClick={() => setPreviewPost(null)}
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {previewPost.tldr && (
                <div className="rounded bg-[var(--seo-paper-2)] p-4 border-l-4 border-[var(--seo-mark)]">
                  <span className="text-[12px] font-bold text-[var(--seo-mark)] uppercase tracking-wider">Özet (TLDR)</span>
                  <p className="mt-1 text-[14px] text-[var(--seo-ink)] leading-relaxed">{previewPost.tldr}</p>
                </div>
              )}

              {previewPost.description && (
                <div>
                  <span className="text-[12px] font-bold text-[var(--seo-ink-3)]">Meta Açıklama</span>
                  <p className="text-[14px] text-[var(--seo-ink-2)]">{previewPost.description}</p>
                </div>
              )}

              <div className="border-t border-[var(--seo-rule)] pt-4">
                <span className="text-[12px] font-bold text-[var(--seo-ink-3)] block mb-3">Makale İçeriği (HTML Önizleme)</span>
                <div
                  className="prose max-w-none text-[15px] leading-relaxed text-[var(--seo-ink)] space-y-4"
                  dangerouslySetInnerHTML={{ __html: previewPost.content }}
                />
              </div>

              {previewPost.references && (
                <div className="border-t border-[var(--seo-rule)] pt-4">
                  <span className="text-[12px] font-bold text-[var(--seo-ink-3)] block mb-2">Dış Kaynaklar</span>
                  <div className="text-[13px] text-[var(--seo-ink-2)] seo-mono space-y-1">
                    {(() => {
                      try {
                        const refs = JSON.parse(previewPost.references);
                        return Array.isArray(refs)
                          ? refs.map((r: { url: string; claim?: string }, i: number) => (
                              <div key={i}>
                                <a href={r.url} target="_blank" rel="noreferrer" className="seo-link">
                                  {r.url}
                                </a>
                              </div>
                            ))
                          : null;
                      } catch {
                        return <div>{previewPost.references}</div>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-[var(--seo-rule)] pt-4">
              <button
                type="button"
                className="seo-btn bg-[var(--seo-paper-2)] text-[var(--seo-ink)] hover:bg-[var(--seo-rule)]"
                onClick={() => setPreviewPost(null)}
              >
                Kapat
              </button>
              {!previewPost.published && (
                <button
                  type="button"
                  className="seo-btn"
                  disabled={publishingId === previewPost.id}
                  onClick={() => handlePublish(previewPost.id)}
                >
                  {publishingId === previewPost.id ? "Yayınlanıyor..." : "Yayınla →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function GeoBlogPage() {
  return (
    <Suspense fallback={<p className="text-[14px] text-[var(--seo-ink-3)]">Yükleniyor...</p>}>
      <GeoBlogDesk />
    </Suspense>
  );
}
