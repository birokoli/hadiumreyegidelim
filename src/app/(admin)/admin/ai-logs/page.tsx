"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminContext } from "@/components/admin/AdminContext";

type AILog = {
  id: string;
  topic: string | null;
  status: string;
  details: string | null;
  imageUrl: string | null;
  createdAt: string;
  completedAt: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string; spinning?: boolean }> = {
  WRITING_CONTENT:    { label: "Yazıyor",          badge: "bg-blue-50 text-blue-700",    dot: "bg-blue-500",    spinning: true },
  GENERATING_IMAGES:  { label: "Görsel Üretiyor",  badge: "bg-purple-50 text-purple-700",dot: "bg-purple-500",  spinning: true },
  INTERNET_SEARCH:    { label: "Araştırıyor",       badge: "bg-amber-50 text-amber-700",  dot: "bg-amber-500",   spinning: true },
  RESEARCHING:        { label: "Araştırıyor",       badge: "bg-amber-50 text-amber-700",  dot: "bg-amber-500",   spinning: true },
  DRAFT_READY:        { label: "Onay Bekliyor",     badge: "bg-yellow-50 text-yellow-700",dot: "bg-yellow-500"  },
  COMPLETED:          { label: "Yayınlandı",        badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  FAILED:             { label: "Başarısız",         badge: "bg-red-50 text-red-700",      dot: "bg-red-500"     },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.spinning ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

export default function AILogsPage() {
  const { toast } = useAdminContext();
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/ai-logs");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/admin/trigger-ai', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast("Pipeline ateşlendi! Loglar kısa sürede görünecek.", "success");
        setTimeout(fetchLogs, 2000);
      } else {
        toast("Tetikleme başarısız.", "error");
      }
    } catch {
      toast("Ağ hatası.", "error");
    } finally {
      setTriggering(false);
    }
  };

  const running = logs.some(l => !['COMPLETED','FAILED'].includes(l.status));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Blog Motoru</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Claude Opus ile otomatik blog üretimi — günde 3 kez çalışır
          </p>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering || running}
          className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a5e] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <span className={`material-symbols-outlined text-[18px] ${triggering ? 'animate-spin' : ''}`}>
            {triggering ? 'sync' : 'bolt'}
          </span>
          {triggering ? 'Tetikleniyor...' : running ? 'Çalışıyor' : 'Şimdi Üret'}
        </button>
      </div>

      {/* Status banner when running */}
      {running && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <p className="text-sm font-medium text-blue-800">
            Pipeline aktif — yazma, görsel üretimi ve yayınlama işlemi devam ediyor
          </p>
        </div>
      )}

      {/* Logs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Aktivite Geçmişi</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Canlı · 5s
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-7 h-7 border-[3px] border-[#003781] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">history</span>
            <p className="text-sm font-medium">Henüz AI aktivitesi yok</p>
            <p className="text-xs mt-1">Yukarıdaki butona basarak ilk blog üretimini başlatın</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-5 flex flex-col md:flex-row gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={log.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                    </span>
                    {log.completedAt && (
                      <span className="text-xs text-slate-400">
                        · Tamamlandı {new Date(log.completedAt).toLocaleTimeString('tr-TR')}
                      </span>
                    )}
                  </div>
                  {log.topic && (
                    <p className="font-semibold text-slate-900 text-sm">{log.topic}</p>
                  )}
                  {!['COMPLETED','FAILED'].includes(log.status) && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '65%' }} />
                    </div>
                  )}
                  {log.details && (
                    <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-mono leading-relaxed">
                      {log.details}
                    </p>
                  )}
                </div>
                {log.imageUrl && (
                  <div className="shrink-0 relative w-full md:w-44 h-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                    <Image src={log.imageUrl} alt="AI Generated" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white uppercase tracking-wider">
                      Görsel
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
