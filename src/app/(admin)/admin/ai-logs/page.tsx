"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type AILog = {
  id: string;
  topic: string | null;
  status: string;
  details: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export default function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/ai-logs");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STARTING":
      case "RESEARCHING":
      case "OUTLINING":
      case "INTERNET_SEARCH":
      case "WRITING_CONTENT":
      case "GENERATING_IMAGES":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded w-fit flex items-center gap-1"><span className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"></span>{status}</span>;
      case "DRAFT_READY":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded w-fit flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">pause_circle</span>Yayına Hazır</span>;
      case "COMPLETED":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded w-fit">COMPLETED</span>;
      case "FAILED":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded w-fit">FAILED</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded w-fit">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-24">
      <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B2545] to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">AI Otonom İzleme Merkezi</h1>
          <p className="text-blue-100/80 max-w-2xl text-lg font-light">
            Günde 3 kez çalışan otonom SEO yapay zekasının canlı çalışma sürecini (İnternet Taraması, Görsel Çizimi, Metin Yazımı) buradan saniye saniye izleyebilirsiniz.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 opacity-20 hover:opacity-40 transition-opacity blur-sm">
          <span className="material-symbols-outlined text-[300px] text-blue-300">memory</span>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">sensors</span>
              Canlı Aktivite Kayıtları
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Canlı Bağlantı Aktif
            </div>
          </div>

          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-slate-500 py-8 text-center italic">Henüz kaydedilmiş bir AI aktivitesi bulunmuyor.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-slate-400 font-medium">{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                    {log.topic && (
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {log.topic}
                      </h3>
                    )}
                    {(log.status !== 'COMPLETED' && log.status !== 'FAILED' && log.status !== 'DRAFT_READY') && (
                      <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-800 mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      {">"} {log.details}
                    </p>
                  </div>

                  {log.imageUrl && (
                    <div className="shrink-0 relative w-full md:w-48 h-32 rounded-xl overflow-hidden shadow border border-slate-200 dark:border-slate-700">
                      <Image src={log.imageUrl} alt="AI Generated Graphic" fill className="object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        Görsel Üretildi
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
