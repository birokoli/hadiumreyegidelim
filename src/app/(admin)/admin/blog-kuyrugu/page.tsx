"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type QueueItem = {
  topic: string;
  clusterId?: string;
  clusterName?: string;
  finalScore?: number;
  reason?: string;
};

type UpdateItem = {
  postSlug: string;
  postTitle?: string;
  topic?: string;
  reason?: string;
};

type State = {
  queue: QueueItem[];
  updates: UpdateItem[];
  blocked: string[];
  pinned: string[];
};

export default function BlogKuyruguAdmin() {
  const [data, setData] = useState<State>({ queue: [], updates: [], blocked: [], pinned: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/blog-topics");
      const d = await res.json();
      if (d.error) {
        setMsg(d.error);
      } else {
        setData(d);
      }
    } catch {
      setMsg("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (payload: { action: string; topic?: string; postSlug?: string }) => {
    setMsg("");
    if (payload.action === "refresh") setRefreshing(true);
    try {
      const res = await fetch("/api/admin/blog-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.error) {
        setMsg(d.error);
      } else {
        setData(d);
        if (payload.action === "refresh") setMsg("Kuyruk başarıyla yenilendi.");
      }
    } catch {
      setMsg("İşlem başarısız.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary">Blog Konu Kuyruğu</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary">Blog Konu Kuyruğu</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            SEO ve GEO optimizasyonlu blog konu önerileri, güncelleme bildirimleri ve konu kısıtlamaları.
          </p>
        </div>
        <button
          onClick={() => handleAction({ action: "refresh" })}
          disabled={refreshing}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <span className={`material-symbols-outlined text-[18px] ${refreshing ? "animate-spin" : ""}`}>refresh</span>
          {refreshing ? "Yenileniyor…" : "Kuyruğu Yenile"}
        </button>
      </div>

      {msg && <p className="text-sm font-semibold text-primary" role="status">{msg}</p>}

      {/* Güncelleme Önerileri */}
      {data.updates && data.updates.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <h2 className="font-headline text-lg font-bold text-amber-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700">update</span>
            Güncelleme Önerileri ({data.updates.length})
          </h2>
          <div className="divide-y divide-amber-200/60 border-y border-amber-200/60">
            {data.updates.map((u) => (
              <div key={u.postSlug} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/blog/${u.postSlug}`} target="_blank" className="font-semibold text-primary hover:underline">
                    {u.postTitle || u.postSlug}
                  </Link>
                  {u.topic && <span className="ml-2 text-xs text-on-surface-variant">({u.topic})</span>}
                  {u.reason && <p className="text-xs text-amber-800 mt-0.5">{u.reason}</p>}
                </div>
                <button
                  onClick={() => handleAction({ action: "dismissUpdate", postSlug: u.postSlug })}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  Kapat
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Konu Kuyruğu Tablosu */}
      <section className="space-y-4 rounded-2xl border border-outline-variant/20 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-primary">
            Önerilen Konu Kuyruğu ({data.queue.length})
          </h2>
        </div>

        {data.queue.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4">Kuyrukta bekleyen konu bulunmuyor. &quot;Kuyruğu Yenile&quot; butonuna basarak tohum konulardan analiz çalıştırabilirsiniz.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase">
                <tr>
                  <th className="px-4 py-3">Konu</th>
                  <th className="px-4 py-3">Küme</th>
                  <th className="px-4 py-3 text-center">Puan</th>
                  <th className="px-4 py-3">Gerekçe</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {data.queue.map((item, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest/50">
                    <td className="px-4 py-3 font-semibold text-on-surface">{item.topic}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{item.clusterName || item.clusterId || "Genel"}</td>
                    <td className="px-4 py-3 text-center font-bold text-primary">{item.finalScore ?? "–"}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{item.reason || "–"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleAction({ action: "pin", topic: item.topic })}
                        className="rounded-lg border border-outline-variant/40 bg-white px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                      >
                        Öne al
                      </button>
                      <button
                        onClick={() => handleAction({ action: "block", topic: item.topic })}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Bir daha önerme
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Öne Alınanlar & Engellenenler */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-outline-variant/20 bg-white p-5">
          <h2 className="font-headline text-base font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">push_pin</span>
            Öne Alınan Konular ({data.pinned.length})
          </h2>
          {data.pinned.length === 0 ? (
            <p className="text-xs text-on-surface-variant">Öne alınmış konu yok.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/20 border-y border-outline-variant/20">
              {data.pinned.map((t) => (
                <li key={t} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-on-surface">{t}</span>
                  <button
                    onClick={() => handleAction({ action: "unpin", topic: t })}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-outline-variant/20 bg-white p-5">
          <h2 className="font-headline text-base font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">block</span>
            Engellenen Konular ({data.blocked.length})
          </h2>
          {data.blocked.length === 0 ? (
            <p className="text-xs text-on-surface-variant">Engellenmiş konu yok.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/20 border-y border-outline-variant/20">
              {data.blocked.map((t) => (
                <li key={t} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-on-surface">{t}</span>
                  <button
                    onClick={() => handleAction({ action: "unblock", topic: t })}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Engeli kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
