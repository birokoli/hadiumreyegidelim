'use client';
// İçeriklerim (27 Ekim yenilemesi): paylaşımı kampanyaya bağlayarak bildirme; onay durumu ve ekibin geri bildirimi.

import Ikon from '@/components/influencer/Ikon';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Paylasim = {
  id: string; platform: string; shareUrl: string | null; shareDate: string; description: string | null; status: string;
  rejectReason: string | null; adminNote: string | null; campaignTitle: string | null; clickCount: number; saleCount: number;
};

const PLATFORM: Record<string, { ad: string; ikon: string }> = {
  instagram_story: { ad: 'Instagram story', ikon: 'story' },
  instagram_reel: { ad: 'Reels', ikon: 'film' },
  instagram_post: { ad: 'Instagram gönderi', ikon: 'kamera' },
  tiktok: { ad: 'TikTok', ikon: 'muzik' },
  youtube: { ad: 'YouTube', ikon: 'video' },
  x: { ad: 'X', ikon: 'etiket' },
  other: { ad: 'Diğer', ikon: 'dunya' },
};
const DURUM: Record<string, { ad: string; sinif: string; ikon: string }> = {
  pending: { ad: 'Onay bekliyor', sinif: 'mk-rozet-bekliyor', ikon: 'saat' },
  approved: { ad: 'Onaylandı', sinif: 'mk-rozet-onay', ikon: 'tik-daire' },
  rejected: { ad: 'Düzeltme istendi', sinif: 'mk-rozet-red', ikon: 'kalem' },
};
const bugun = () => new Date().toISOString().slice(0, 10);

function Icerik() {
  const sp = useSearchParams();
  const [liste, setListe] = useState<Paylasim[]>([]);
  const [kampanyalar, setKampanyalar] = useState<{ id: string; ad: string }[]>([]);
  const [yuk, setYuk] = useState(true);
  const [form, setForm] = useState({ platform: 'instagram_story', shareUrl: '', shareDate: bugun(), description: '', campaignId: sp.get('kampanya') ?? '' });
  const [gonder, setGonder] = useState(false);
  const [mesaj, setMesaj] = useState<{ tur: 'ok' | 'hata'; metin: string } | null>(null);
  const [acik, setAcik] = useState(Boolean(sp.get('kampanya')));

  const yukle = useCallback(async () => {
    const d = await fetch('/api/influencer/shares').then((r) => r.json()).catch(() => ({}));
    setListe(d.shares ?? []);
    setKampanyalar(d.kampanyalar ?? []);
    setYuk(false);
  }, []);
  useEffect(() => { yukle(); }, [yukle]);

  const sayi = (s: string) => liste.filter((p) => p.status === s).length;

  return (
    <div className="space-y-6">
      <div className="mk-gir flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mk-ust">İçeriklerim</p>
          <h1 className="mt-1 text-[28px] font-extrabold">Paylaşımlarınız ve onaylar</h1>
          <p className="mt-1 mk-soluk text-[15px] max-w-2xl">Paylaştığınız her story, gönderi ya da Reels’i bildirin. Ekibimiz bakar; onaylanan paylaşım kampanyaya sayılır, düzeltme gerekirse notunu burada görürsünüz.</p>
        </div>
        <button className="mk-btn mk-btn-ana" onClick={() => setAcik((v) => !v)}>
          <Ikon ad={acik ? 'kapat' : 'arti'} boyut={19} />{acik ? 'Kapat' : 'Paylaşım bildir'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(['pending', 'approved', 'rejected'] as const).map((k) => (
          <div key={k} className="mk-kart p-4">
            <p className="text-[26px] font-extrabold leading-none">{sayi(k)}</p>
            <p className="mt-1.5 text-[13px] mk-soluk font-semibold">{DURUM[k].ad}</p>
          </div>
        ))}
      </div>

      {acik && (
        <form
          className="mk-kart p-5 lg:p-6 mk-gir space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setGonder(true); setMesaj(null);
            const r = await fetch('/api/influencer/shares', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) setMesaj({ tur: 'hata', metin: d.error || 'Gönderilemedi.' });
            else {
              setMesaj({ tur: 'ok', metin: 'Paylaşımınız ekibe iletildi; onaylanınca burada göreceksiniz.' });
              setForm({ ...form, shareUrl: '', description: '' });
              await yukle();
            }
            setGonder(false);
          }}
        >
          <div>
            <p className="text-[13px] font-bold mb-2">Nerede paylaştınız?</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLATFORM).map(([k, p]) => (
                <button type="button" key={k} onClick={() => setForm({ ...form, platform: k })} className={`mk-btn !py-2 !px-3 text-[13px] ${form.platform === k ? 'mk-btn-ana' : 'mk-btn-cizgi'}`}>
                  <Ikon ad={p.ikon} boyut={17} />{p.ad}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] font-bold">Kampanya</span>
              <select className="mk-alan mt-1.5" value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
                <option value="">Kampanyasız (genel paylaşım)</option>
                {kampanyalar.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[13px] font-bold">Paylaşım tarihi</span>
              <input type="date" className="mk-alan mt-1.5" value={form.shareDate} max={bugun()} onChange={(e) => setForm({ ...form, shareDate: e.target.value })} required />
            </label>
          </div>
          <label className="block">
            <span className="text-[13px] font-bold">Paylaşım linki</span>
            <input type="url" className="mk-alan mt-1.5" placeholder="https://www.instagram.com/p/…" value={form.shareUrl} onChange={(e) => setForm({ ...form, shareUrl: e.target.value })} />
            <span className="text-[12px] mk-soluk">Story’lerde link yoksa boş bırakın; ekip hesabınızdan kontrol eder.</span>
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Not (isteğe bağlı)</span>
            <textarea className="mk-alan mt-1.5 min-h-[72px]" maxLength={500} placeholder="Örn. 3 story’lik seri, ikincisinde kod var." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="flex items-center gap-3">
            <button className="mk-btn mk-btn-ana" disabled={gonder}><Ikon ad="gonder" boyut={19} />{gonder ? 'Gönderiliyor…' : 'Ekibe gönder'}</button>
            {mesaj && <p className={`text-[13.5px] font-semibold ${mesaj.tur === 'ok' ? 'text-[var(--mk-yesil)]' : 'text-[var(--mk-kirmizi)]'}`}>{mesaj.metin}</p>}
          </div>
        </form>
      )}

      <section className="mk-kart overflow-hidden">
        {yuk ? (
          <p className="p-6 mk-soluk">Yükleniyor…</p>
        ) : liste.length === 0 ? (
          <div className="p-10 text-center">
            <Ikon ad="icerik" boyut={44} className="text-[var(--mk-bulut)]" />
            <p className="mt-2 font-bold">Henüz paylaşım bildirmediniz</p>
            <p className="mt-1 text-[14px] mk-soluk">Bir kampanyaya katılıp paylaştıktan sonra buradan bildirin.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--mk-cizgi)]">
            {liste.map((p) => {
              const pl = PLATFORM[p.platform] ?? PLATFORM.other;
              const du = DURUM[p.status] ?? DURUM.pending;
              const not = p.adminNote || p.rejectReason;
              return (
                <div key={p.id} className="p-4 lg:p-5 flex gap-4">
                  <div className="w-11 h-11 mk-yuvarlak bg-[var(--mk-zemin)] text-[var(--mk-lacivert)] flex items-center justify-center shrink-0">
                    <Ikon ad={pl.ikon} boyut={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-bold">{pl.ad}</p>
                      <span className={`mk-rozet ${du.sinif}`}><Ikon ad={du.ikon} boyut={15} />{du.ad}</span>
                    </div>
                    <p className="text-[13px] mk-soluk mt-0.5">{new Date(p.shareDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}{p.campaignTitle ? ` · ${p.campaignTitle}` : ''}</p>
                    {p.description && <p className="text-[13.5px] mt-1">{p.description}</p>}
                    {not && (
                      <div className="mt-2 bg-[var(--mk-zemin)] mk-yuvarlak px-3 py-2 text-[13.5px] flex gap-2">
                        <Ikon ad="sohbet" boyut={18} className="text-[var(--mk-lacivert)]" /><span><b>Ekibin notu:</b> {not}</span>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] mk-soluk font-semibold">
                      {p.shareUrl && <a href={p.shareUrl} target="_blank" rel="noreferrer" className="text-[var(--mk-lacivert)] inline-flex items-center gap-1"><Ikon ad="disari" boyut={16} />Paylaşımı aç</a>}
                      {p.status === 'approved' && <span>{p.clickCount} tıklama · {p.saleCount} satış</span>}
                      {p.status === 'pending' && (
                        <button className="text-[var(--mk-kirmizi)]" onClick={async () => { if (!confirm('Bu bildirimi geri çekmek istiyor musunuz?')) return; await fetch(`/api/influencer/shares?id=${p.id}`, { method: 'DELETE' }); yukle(); }}>Geri çek</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function IceriklerimPage() {
  return <Suspense fallback={null}><Icerik /></Suspense>;
}
