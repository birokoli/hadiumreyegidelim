'use client';
// Marketing paneli istemci araçları: kopyala ve paylaş (telefonda Web Share API ile WhatsApp/Instagram'a doğrudan).

import Ikon from '@/components/influencer/Ikon';
import { useState } from 'react';

export function KopyalaButon({ metin, etiket = 'Kopyala', sinif = 'mk-btn mk-btn-cizgi !py-2 !px-3 text-[13px]' }: { metin: string; etiket?: string; sinif?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={sinif}
      onClick={async () => {
        try { await navigator.clipboard.writeText(metin); } catch { /* izin yoksa sessiz */ }
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }}
    >
      <Ikon ad={ok ? 'tik' : 'kopyala'} boyut={18} />
      {ok ? 'Kopyalandı' : etiket}
    </button>
  );
}

export function PaylasButon({ metin, url, baslik = 'Hadi Umreye Gidelim', sinif = 'mk-btn mk-btn-ana !py-2 !px-3 text-[13px]' }: { metin?: string; url?: string; baslik?: string; sinif?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={sinif}
      onClick={async () => {
        const veri = { title: baslik, text: metin, url };
        if (typeof navigator !== 'undefined' && navigator.share) {
          try { await navigator.share(veri); } catch { /* kullanıcı vazgeçti */ }
          return;
        }
        try { await navigator.clipboard.writeText([metin, url].filter(Boolean).join('\n')); } catch { /* sessiz */ }
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }}
    >
      <Ikon ad={ok ? 'tik' : 'paylas'} boyut={18} />
      {ok ? 'Kopyalandı' : 'Paylaş'}
    </button>
  );
}
