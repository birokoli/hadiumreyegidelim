'use client';

import { useEffect, useRef, useState } from 'react';

interface StoryModalProps {
  campaignSlug: string;
  campaignTitle: string;
  uniqueCode: string;
  discountLabel: string;
  commissionPct?: number | null;
  influencerHandle?: string | null;
  onClose: () => void;
}

export default function StoryModal({
  campaignSlug,
  campaignTitle,
  uniqueCode,
  discountLabel,
  commissionPct,
  influencerHandle,
  onClose,
}: StoryModalProps) {
  const [copied, setCopied]         = useState<'link' | 'caption' | null>(null);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const baseUrl     = 'https://hadiumreyegidelim.com';
  const trackingUrl = `${baseUrl}/c/${campaignSlug}?ref=${uniqueCode}`;
  const storyApiUrl = `/api/og/story?campaign=${campaignSlug}&ref=${uniqueCode}`;

  const caption = [
    `✨ ${campaignTitle}`,
    ``,
    `Özel indirim kodun: ${uniqueCode}`,
    discountLabel ? `💰 ${discountLabel}` : '',
    commissionPct  ? `📈 Komisyon: %${commissionPct}` : '',
    ``,
    `🔗 ${trackingUrl}`,
    ``,
    `#umre #umre2025 #hadiumreyegidelim`,
  ].filter(Boolean).join('\n');

  const copy = (text: string, key: 'link' | 'caption') => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  };

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(storyApiUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-${campaignSlug}-${uniqueCode}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('İndirme başarısız oldu, lütfen tekrar deneyin.');
    } finally {
      setDownloading(false);
    }
  };

  // ESC ile kapat
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#003781]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#003781] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <p className="text-[15px] font-bold text-gray-900">Story Hazır!</p>
              <p className="text-[12px] text-gray-400">Kod ve içerik otomatik oluşturuldu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── İçerik (scroll) ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-0">

            {/* ── Sol: Story önizleme ──────────────────────────────────────── */}
            <div className="lg:w-[280px] shrink-0 bg-gray-50 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Önizleme</p>
              <div className="relative w-full max-w-[180px] aspect-[9/16] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="w-6 h-6 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyApiUrl}
                  alt="Story önizleme"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-3 text-center">1080 × 1920 PNG</p>
            </div>

            {/* ── Sağ: Araçlar ────────────────────────────────────────────── */}
            <div className="flex-1 p-6 space-y-4">

              {/* Katılım başarı notu */}
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 text-[22px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-[13px] text-green-700 leading-relaxed">
                  <span className="font-bold">Kampanyaya katıldın.</span> Kod ve takip linki sana özel oluşturuldu — hiçbir şey yazman gerekmiyor.
                </p>
              </div>

              {/* Kod */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Kampanya Kodun</p>
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#003781]/5 to-[#003781]/10 rounded-2xl px-5 py-4">
                  <span className="text-[28px] font-black text-[#003781] tracking-widest flex-1">{uniqueCode}</span>
                  <button
                    onClick={() => copy(uniqueCode, 'link')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${copied === 'link' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{copied === 'link' ? 'check' : 'content_copy'}</span>
                    {copied === 'link' ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
              </div>

              {/* Takip linki */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Takip Linki (Biyografine Ekle)</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-[13px] text-[#003781] font-medium flex-1 break-all">{trackingUrl}</span>
                  <button
                    onClick={() => copy(trackingUrl, 'caption')}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${copied === 'caption' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{copied === 'caption' ? 'check' : 'content_copy'}</span>
                    {copied === 'caption' ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
              </div>

              {/* Paylaşım metni */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Hazır Paylaşım Metni</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <pre className="text-[13px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{caption}</pre>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(caption); setCopied('link'); setTimeout(() => setCopied(null), 2500); }}
                  className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${copied === 'link' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{copied === 'link' ? 'check' : 'content_copy'}</span>
                  {copied === 'link' ? 'Kopyalandı!' : 'Metni Kopyala'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer: İndir CTA ─────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={download}
            disabled={downloading || !imgLoaded}
            className="flex-1 flex items-center justify-center gap-2.5 bg-[#003781] hover:bg-[#002a63] disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-[15px] transition-all shadow-md"
          >
            {downloading
              ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> İndiriliyor...</>
              : <><span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>download</span> Story'yi İndir (PNG)</>
            }
          </button>
          <button
            onClick={onClose}
            className="sm:w-auto px-6 py-4 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-[14px] hover:bg-gray-50 transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
