'use client';
// Kampanya brief'i düzenleyici (27 Ekim): influencer panelindeki kampanya sayfasının içeriği buradan yazılır.
// Listeler satır satır girilir; açıklamalarda {kod} ve {link} influencer'ın kendi kodu ve linkiyle dolar.

import { useEffect, useState } from 'react';

type Brief = { soz: string; amac: string; anaMesaj: string; yap: string[]; yapma: string[]; aciklamalar: string[]; hashtagler: string; bilgiler: string[]; takvim?: string; gorseller: { url: string; ad: string; format: string }[] };

const alan = 'w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/25 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781]';
const satirlar = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

export default function BriefDuzenle({ campaignId, baslik, onClose }: { campaignId: string; baslik: string; onClose: () => void }) {
  const [b, setB] = useState<Brief | null>(null);
  const [metin, setMetin] = useState({ yap: '', yapma: '', bilgiler: '', aciklamalar: '', gorseller: '' });
  const [kayit, setKayit] = useState<'' | 'kaydediliyor' | 'kaydedildi' | 'hata'>('');

  useEffect(() => {
    fetch(`/api/admin/campaigns/${campaignId}/brief`).then((r) => r.json()).then((d) => {
      const br: Brief = d.brief;
      setB(br);
      setMetin({
        yap: br.yap.join('\n'), yapma: br.yapma.join('\n'), bilgiler: br.bilgiler.join('\n'),
        aciklamalar: br.aciklamalar.join('\n---\n'),
        gorseller: br.gorseller.map((g) => [g.url, g.ad, g.format].join(' | ')).join('\n'),
      });
    });
  }, [campaignId]);

  const kaydet = async () => {
    if (!b) return;
    setKayit('kaydediliyor');
    const brief = {
      ...b,
      yap: satirlar(metin.yap), yapma: satirlar(metin.yapma), bilgiler: satirlar(metin.bilgiler),
      aciklamalar: metin.aciklamalar.split(/\n-{3,}\n/).map((x) => x.trim()).filter(Boolean),
      gorseller: satirlar(metin.gorseller).map((l) => { const [url, ad, format] = l.split('|').map((x) => x.trim()); return { url, ad: ad ?? '', format: format ?? 'gonderi' }; }),
    };
    const r = await fetch(`/api/admin/campaigns/${campaignId}/brief`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brief }) });
    setKayit(r.ok ? 'kaydedildi' : 'hata');
  };

  return (
    <div className="admin-modal-scrim fixed inset-0 bg-on-primary-fixed/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="admin-modal-panel bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-2xl p-7 my-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[18px] font-bold text-on-surface">Brief · {baslik}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">close</span></button>
        </div>
        <p className="text-[13px] text-outline mb-5">Influencer panelinde kampanya sayfasında görünür. Fiyat ve tarih yalnızca “Bilgiler”e yazılır; yapay zekâ da yalnızca bunları kullanır.</p>
        {!b ? <p className="text-outline">Yükleniyor…</p> : (
          <div className="space-y-4">
            <label className="block"><span className="text-[13px] font-semibold">Kampanya sözü</span><input className={alan} value={b.soz} onChange={(e) => setB({ ...b, soz: e.target.value })} placeholder="Bir gün değil, bir tarih." /></label>
            <label className="block"><span className="text-[13px] font-semibold">Amaç (neden bu kampanya)</span><textarea rows={2} className={alan} value={b.amac} onChange={(e) => setB({ ...b, amac: e.target.value })} /></label>
            <label className="block"><span className="text-[13px] font-semibold">Ana mesaj (takipçiye söylenecek tek şey)</span><textarea rows={2} className={alan} value={b.anaMesaj} onChange={(e) => setB({ ...b, anaMesaj: e.target.value })} /></label>
            <label className="block"><span className="text-[13px] font-semibold">Bilgiler (satır satır; fiyat, tarih, dahil olanlar)</span><textarea rows={4} className={alan} value={metin.bilgiler} onChange={(e) => setMetin({ ...metin, bilgiler: e.target.value })} /></label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="text-[13px] font-semibold">Yapın (satır satır)</span><textarea rows={4} className={alan} value={metin.yap} onChange={(e) => setMetin({ ...metin, yap: e.target.value })} /></label>
              <label className="block"><span className="text-[13px] font-semibold">Yapmayın (satır satır)</span><textarea rows={4} className={alan} value={metin.yapma} onChange={(e) => setMetin({ ...metin, yapma: e.target.value })} /></label>
            </div>
            <label className="block"><span className="text-[13px] font-semibold">Hazır açıklamalar (aralarına --- koyun; {'{kod}'} ve {'{link}'} kişiye özel dolar)</span><textarea rows={7} className={alan} value={metin.aciklamalar} onChange={(e) => setMetin({ ...metin, aciklamalar: e.target.value })} /></label>
            <label className="block"><span className="text-[13px] font-semibold">Görseller (her satır: adres | ad | story/gonderi/kare/yatay)</span><textarea rows={4} className={`${alan} font-mono text-[12.5px]`} value={metin.gorseller} onChange={(e) => setMetin({ ...metin, gorseller: e.target.value })} placeholder="/marketing/kampanya/bir-gun-story.jpg | Story | story" /></label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="text-[13px] font-semibold">Etiketler</span><input className={alan} value={b.hashtagler} onChange={(e) => setB({ ...b, hashtagler: e.target.value })} /></label>
              <label className="block"><span className="text-[13px] font-semibold">Takvim notu</span><input className={alan} value={b.takvim ?? ''} onChange={(e) => setB({ ...b, takvim: e.target.value })} placeholder="9–22 Kasım açılış" /></label>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={kaydet} disabled={kayit === 'kaydediliyor'} className="bg-[#003781] hover:bg-[#002a63] text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] disabled:opacity-60">{kayit === 'kaydediliyor' ? 'Kaydediliyor…' : 'Kaydet'}</button>
              {kayit === 'kaydedildi' && <span className="text-[13px] font-semibold text-secondary">Kaydedildi; influencer panelinde görünüyor.</span>}
              {kayit === 'hata' && <span className="text-[13px] font-semibold text-error">Kaydedilemedi.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
