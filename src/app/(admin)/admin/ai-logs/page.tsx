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
  WRITING_CONTENT:    { label: "Yazıyor",          badge: "bg-primary/[0.08] text-primary",    dot: "bg-primary/[0.08]0",    spinning: true },
  GENERATING_IMAGES:  { label: "Görsel Üretiyor",  badge: "bg-[#b8862f]/10 text-[#b8862f]",dot: "bg-[#b8862f]",  spinning: true },
  INTERNET_SEARCH:    { label: "Araştırıyor",       badge: "bg-[#b8862f]/10 text-[#b8862f]",  dot: "bg-[#b8862f]/100",   spinning: true },
  RESEARCHING:        { label: "Araştırıyor",       badge: "bg-[#b8862f]/10 text-[#b8862f]",  dot: "bg-[#b8862f]/100",   spinning: true },
  DRAFT_READY:        { label: "Onay Bekliyor",     badge: "bg-[#b8862f]/10 text-[#b8862f]",dot: "bg-[#b8862f]"  },
  COMPLETED:          { label: "Yayınlandı",        badge: "bg-secondary/10 text-secondary", dot: "bg-secondary/100" },
  FAILED:             { label: "Başarısız",         badge: "bg-error/10 text-error",      dot: "bg-error"     },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, badge: "bg-surface-container text-on-surface-variant", dot: "bg-outline" };
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
  const [autoBlogEnabled, setAutoBlogEnabled] = useState(false);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/ai-logs");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchToggleState = async () => {
    try {
      const res = await fetch('/api/admin/auto-blog-toggle');
      const data = await res.json();
      setAutoBlogEnabled(!!data.enabled);
    } catch {}
  };

  const handleToggleEnabled = async () => {
    setTogglingEnabled(true);
    try {
      const res = await fetch('/api/admin/auto-blog-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoBlogEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setAutoBlogEnabled(data.enabled);
        toast(data.enabled ? 'Auto-blog aktif edildi' : 'Auto-blog durduruldu', 'success');
      }
    } catch {
      toast('Güncelleme başarısız', 'error');
    } finally {
      setTogglingEnabled(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchToggleState();
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

  // 20 dakikadan eski ve hâlâ çalışıyor görünen → takılı kalmış
  const STALE_MS = 20 * 60 * 1000;
  const stale = logs.find(l =>
    !['COMPLETED', 'FAILED'].includes(l.status) &&
    Date.now() - new Date(l.createdAt).getTime() > STALE_MS
  );
  const running = logs.some(l => !['COMPLETED','FAILED'].includes(l.status));

  const handleReset = async () => {
    try {
      await fetch('/api/admin/reset-pipeline', { method: 'POST' });
      toast('Takılı pipeline temizlendi.', 'success');
      setTimeout(fetchLogs, 500);
    } catch {
      toast('Sıfırlama başarısız.', 'error');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI Blog Motoru</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Claude Opus ile otomatik blog üretimi — günde 3 kez çalışır
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-blog enable/disable toggle */}
          <button
            onClick={handleToggleEnabled}
            disabled={togglingEnabled}
            title={autoBlogEnabled ? 'Otomatik üretimi durdur' : 'Otomatik üretimi aktif et'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm border ${
              autoBlogEnabled
                ? 'bg-secondary/10 text-secondary border-secondary/25 hover:bg-secondary/20'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/25 hover:bg-outline-variant/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className={`material-symbols-outlined text-[18px] ${togglingEnabled ? 'animate-spin' : ''}`}>
              {togglingEnabled ? 'sync' : autoBlogEnabled ? 'toggle_on' : 'toggle_off'}
            </span>
            {autoBlogEnabled ? 'Otomatik Açık' : 'Otomatik Kapalı'}
          </button>
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
      </div>

      {/* Takılı pipeline uyarısı */}
      {stale && (
        <div className="bg-[#b8862f]/10 border border-[#b8862f]/25 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#b8862f] text-[22px]">warning</span>
            <p className="text-sm font-medium text-[#8f6a24]">
              Pipeline 20 dakikadan uzun süredir yanıt vermiyor — muhtemelen takıldı.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-[#b8862f]/15 hover:bg-[#b8862f]/25 text-[#8f6a24] px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Sıfırla
          </button>
        </div>
      )}

      {/* Status banner when running */}
      {running && !stale && (
        <div className="bg-primary/[0.08] border border-primary/20 rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/[0.08]0 animate-pulse shrink-0" />
          <p className="text-sm font-medium text-primary">
            Pipeline aktif — yazma, görsel üretimi ve yayınlama işlemi devam ediyor
          </p>
        </div>
      )}


      {/* Logs */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between">
          <h2 className="font-semibold text-on-surface">Aktivite Geçmişi</h2>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary/100" />
            </span>
            Canlı · 5s
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-7 h-7 border-[3px] border-[#003781] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-outline">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">history</span>
            <p className="text-sm font-medium">Henüz AI aktivitesi yok</p>
            <p className="text-xs mt-1">Yukarıdaki butona basarak ilk blog üretimini başlatın</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-5 flex flex-col md:flex-row gap-4 hover:bg-surface-container-low/50 transition-colors">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={log.status} />
                    <span className="text-xs text-outline">
                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                    </span>
                    {log.completedAt && (
                      <span className="text-xs text-outline">
                        · Tamamlandı {new Date(log.completedAt).toLocaleTimeString('tr-TR')}
                      </span>
                    )}
                  </div>
                  {log.topic && (
                    <p className="font-semibold text-on-surface text-sm">{log.topic}</p>
                  )}
                  {!['COMPLETED','FAILED'].includes(log.status) && (
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary/[0.08]0 rounded-full animate-pulse" style={{ width: '65%' }} />
                    </div>
                  )}
                  {log.details && (
                    <p className="text-xs text-on-surface-variant bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 font-mono leading-relaxed">
                      {log.details}
                    </p>
                  )}
                </div>
                {log.imageUrl && (
                  <div className="shrink-0 relative w-full md:w-44 h-28 rounded-xl overflow-hidden border border-outline-variant/15 shadow-sm">
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
