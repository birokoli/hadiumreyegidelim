'use client';
// Kampanya brief'i istemci parçaları: katıl, story üret, yapay zekâ ile açıklama kişiselleştir.

import Ikon from '@/components/influencer/Ikon';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { KopyalaButon, PaylasButon } from '@/components/influencer/araclar';

const StoryModal = dynamic(() => import('../StoryModal'), { ssr: false });

export function Katil({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [yuk, setYuk] = useState(false);
  const [hata, setHata] = useState('');
  return (
    <div>
      <button
        className="mk-btn mk-btn-kum w-full sm:w-auto !py-3 !px-6 text-[15px]"
        disabled={yuk}
        onClick={async () => {
          setYuk(true); setHata('');
          const r = await fetch('/api/influencer/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) { setHata(d.error || 'Katılım tamamlanamadı.'); setYuk(false); return; }
          router.refresh();
        }}
      >
        <Ikon ad={yuk ? 'yukleniyor' : 'onay'} boyut={20} />
        {yuk ? 'Katılıyorsunuz…' : 'Kampanyaya katıl, kodumu oluştur'}
      </button>
      {hata && <p className="mt-2 text-[13px] text-[var(--mk-kirmizi)]">{hata}</p>}
    </div>
  );
}

export function StoryUret(p: { slug: string; baslik: string; kod: string; indirim: string; komisyon: number | null; handle: string | null }) {
  const [acik, setAcik] = useState(false);
  return (
    <>
      <button className="mk-btn mk-btn-cizgi" onClick={() => setAcik(true)}>
        <Ikon ad="yapayzeka" boyut={19} />
        Koduma özel story üret
      </button>
      {acik && (
        <StoryModal campaignSlug={p.slug} campaignTitle={p.baslik} uniqueCode={p.kod} discountLabel={p.indirim} commissionPct={p.komisyon} influencerHandle={p.handle} onClose={() => setAcik(false)} />
      )}
    </>
  );
}

export function Aciklama({ metin, link }: { metin: string; link: string }) {
  return (
    <div className="bg-[var(--mk-zemin)] mk-yuvarlak p-4">
      <p className="whitespace-pre-line text-[14.5px] leading-relaxed">{metin}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <KopyalaButon metin={metin} />
        <PaylasButon metin={metin} url={link} />
      </div>
    </div>
  );
}

const PLATFORMLAR = [
  { k: 'instagram_story', ad: 'Instagram story' },
  { k: 'instagram_post', ad: 'Instagram gönderi' },
  { k: 'instagram_reel', ad: 'Reels' },
  { k: 'tiktok', ad: 'TikTok' },
  { k: 'youtube', ad: 'YouTube' },
];

export function YapayZekaAciklama({ campaignId, link }: { campaignId: string; link: string }) {
  const [platform, setPlatform] = useState('instagram_post');
  const [not, setNot] = useState('');
  const [yuk, setYuk] = useState(false);
  const [hata, setHata] = useState('');
  const [sonuc, setSonuc] = useState<string[]>([]);
  return (
    <div className="mk-kart p-5 lg:p-6">
      <div className="flex items-start gap-3">
        <Ikon ad="yapayzeka" boyut={26} className="text-[var(--mk-altin)]" />
        <div>
          <h3 className="text-[17px] font-extrabold">Kendi üslubunuzla açıklama yazdırın</h3>
          <p className="text-[13.5px] mk-soluk mt-0.5">Yapay zekâ brief’e ve marka kurallarına uyan 3 öneri yazar; fiyat ve bilgi uydurmaz. Göndermeden önce okuyun, istediğiniz gibi değiştirin.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {PLATFORMLAR.map((p) => (
          <button key={p.k} onClick={() => setPlatform(p.k)} className={`mk-btn !py-2 !px-3 text-[13px] ${platform === p.k ? 'mk-btn-ana' : 'mk-btn-cizgi'}`}>{p.ad}</button>
        ))}
      </div>
      <textarea
        className="mk-alan mt-3 min-h-[84px]"
        placeholder="İsterseniz kendinizden bir not: “Geçen yıl annemle gitmiştim, ilk kez gidecekler için yazıyorum” gibi. Boş bırakabilirsiniz."
        value={not}
        maxLength={400}
        onChange={(e) => setNot(e.target.value)}
      />
      <button
        className="mk-btn mk-btn-ana mt-3"
        disabled={yuk}
        onClick={async () => {
          setYuk(true); setHata(''); setSonuc([]);
          const r = await fetch('/api/influencer/ai/caption', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId, platform, not }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) setHata(d.error || 'Öneri üretilemedi; biraz sonra tekrar deneyin.');
          else setSonuc(d.oneriler ?? []);
          setYuk(false);
        }}
      >
        <Ikon ad={yuk ? 'yukleniyor' : 'kalem'} boyut={19} />
        {yuk ? 'Yazılıyor…' : 'Öneri yaz'}
      </button>
      {hata && <p className="mt-2 text-[13px] text-[var(--mk-kirmizi)]">{hata}</p>}
      {sonuc.length > 0 && <div className="mt-4 space-y-3">{sonuc.map((m, i) => <Aciklama key={i} metin={m} link={link} />)}</div>}
    </div>
  );
}
