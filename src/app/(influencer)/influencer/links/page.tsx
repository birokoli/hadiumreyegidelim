'use client';

import { useEffect, useState } from 'react';

export default function InfluencerLinksPage() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/influencer/dashboard').then(r => r.json()).then(setData);
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
      </div>
    );
  }

  const { links, influencer, stats } = data;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const platforms = [
    { key: 'instagram', label: 'Instagram Bio', icon: 'photo_camera', url: `${links.trackingUrl}?utm_source=instagram&utm_medium=bio` },
    { key: 'story',     label: 'Instagram Story', icon: 'fiber_manual_record', url: `${links.trackingUrl}?utm_source=instagram&utm_medium=story` },
    { key: 'whatsapp',  label: 'WhatsApp',        icon: 'chat',            url: `${links.trackingUrl}?utm_source=whatsapp` },
    { key: 'tiktok',    label: 'TikTok',           icon: 'music_note',     url: `${links.trackingUrl}?utm_source=tiktok` },
    { key: 'youtube',   label: 'YouTube',          icon: 'play_circle',    url: `${links.trackingUrl}?utm_source=youtube` },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Linklerim & Kupon Kodum</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Takipçilerinizle paylaşmak için link ve kupon araçları</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam Tıklanma', value: stats.totalClicks },
          { label: 'Toplam Satış',    value: stats.totalSales },
          { label: 'Bu Ay Tıklanma', value: stats.monthlyClicks },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <p className="text-[26px] font-bold text-gray-900">{s.value}</p>
            <p className="text-[12px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Kupon kodu */}
      <div className="bg-gradient-to-br from-[#003781] to-[#002a63] rounded-2xl p-6 text-white shadow-lg shadow-[#003781]/20">
        <p className="text-[13px] text-white/60 font-medium mb-1">Kişisel Kupon Kodunuz</p>
        <div className="flex items-center justify-between">
          <span className="text-[32px] font-black tracking-widest">{links.couponCode}</span>
          <button onClick={() => copy(links.couponCode, 'coupon')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all ${
              copied === 'coupon' ? 'bg-green-400 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}>
            <span className="material-symbols-outlined text-[18px]">{copied === 'coupon' ? 'check' : 'content_copy'}</span>
            {copied === 'coupon' ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
        <p className="text-[13px] text-white/50 mt-3">
          Müşteriler bu kodu kullandığında satış size atanır — link tıklanmasa bile.
        </p>
      </div>

      {/* Ana link */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-4">Ana Takip Linki</h2>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 mb-4">
          <span className="material-symbols-outlined text-[20px] text-gray-400">link</span>
          <p className="flex-1 text-[13px] text-gray-700 font-medium truncate">{links.trackingUrl}</p>
          <button onClick={() => copy(links.trackingUrl, 'main')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all shrink-0 ${
              copied === 'main' ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
            <span className="material-symbols-outlined text-[15px]">{copied === 'main' ? 'check' : 'content_copy'}</span>
            {copied === 'main' ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>

        {/* QR hint */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
          <p className="text-[13px] text-blue-700">QR kod oluşturmak için herhangi bir QR üretici siteye bu linki yapıştırabilirsiniz.</p>
        </div>
      </div>

      {/* Platform linkleri */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-1">Platform Linkleri</h2>
        <p className="text-[13px] text-gray-400 mb-5">Her platform için UTM parametreli özel linkler — nereden geldiğini takip ederiz</p>
        <div className="space-y-3">
          {platforms.map(p => (
            <div key={p.key} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-gray-500">{p.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-gray-400 font-medium">{p.label}</p>
                <p className="text-[12px] text-gray-600 truncate">{p.url}</p>
              </div>
              <button onClick={() => copy(p.url, p.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all shrink-0 ${
                  copied === p.key ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                <span className="material-symbols-outlined text-[15px]">{copied === p.key ? 'check' : 'content_copy'}</span>
                {copied === p.key ? 'Kopyalandı!' : 'Kopyala'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Kullanım ipuçları */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-4">Kullanım İpuçları</h2>
        <div className="space-y-3">
          {[
            { icon: 'photo_camera', text: 'Instagram biyografinize ana linki ekleyin, story\'lerde swipe-up linki kullanın.' },
            { icon: 'sell', text: 'Her paylaşımda kupon kodunuzu sözlü olarak da belirtin.' },
            { icon: 'tag', text: 'Her paylaşımda #işbirliği veya #reklam etiketini eklemeyi unutmayın.' },
            { icon: 'timer', text: 'Link 60 gün cookie\'yi korur — tıklayan biri ilerleyen günlerde satın alsa bile size atanır.' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <div className="w-7 h-7 bg-[#003781]/5 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-[#003781]">{tip.icon}</span>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
