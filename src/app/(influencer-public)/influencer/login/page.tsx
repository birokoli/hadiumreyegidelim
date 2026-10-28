'use client';
// Marketing paneli girişi (27 Ekim yenilemesi): marka kiti görünümü. Eski sayfadaki "%2.5 komisyon" (sistemde %3–7)
// ve yasaklı "24/7" ifadesi kaldırıldı; sayılar yerine programın nasıl işlediği anlatılır.

import Ikon from '@/components/influencer/Ikon';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FullIconFont from "@/components/ui/FullIconFont";
import "../../../(influencer)/influencer/marketing.css";

const ADIMLAR = [
  { ikon: 'kampanya', baslik: 'Kampanyaya katılın', metin: 'Brief, hazır görseller ve açıklamalar sizi bekliyor.' },
  { ikon: 'paylas', baslik: 'Kendi kodunuzla paylaşın', metin: 'Linkinizden ve kodunuzdan gelen her yolcu size yazılır.' },
  { ikon: 'cuzdan', baslik: 'Kazancınızı izleyin', metin: 'Müşteri, satış ve komisyon tek panelde.' },
];

export default function InfluencerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/influencer/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(data.status === 'pending' ? '/influencer/pending' : '/influencer/dashboard');
      router.refresh();
    } else {
      setError(data.error || 'Giriş başarısız.');
    }
    setLoading(false);
  };

  return (
    <div className="mk min-h-screen flex">
      <FullIconFont />

      <div className="hidden lg:flex lg:w-[52%] mk-kart-koyu mk-desen flex-col justify-between p-14" style={{ borderRadius: 0 }}>
        <img src="/marketing-kilit-beyaz.svg" alt="Hadi Umreye Gidelim Marketing" className="relative h-[120px] w-fit" />
        <div className="relative max-w-[440px]">
          <p className="mk-ust !text-[var(--mk-kum)]">İş birliği programı</p>
          <h2 className="mt-3 text-[46px] font-extrabold leading-[1.05]">Takipçilerinizin umresine birlikte vesile olalım.</h2>
          <div className="mt-10 space-y-5">
            {ADIMLAR.map((a) => (
              <div key={a.baslik} className="flex gap-4">
                <div className="w-11 h-11 mk-yuvarlak bg-white/10 flex items-center justify-center shrink-0"><Ikon ad={a.ikon} boyut={22} className="text-[var(--mk-kum)]" /></div>
                <div><p className="text-[16px] font-bold">{a.baslik}</p><p className="text-[14px] text-white/65">{a.metin}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-[12px] text-white/40 font-semibold">marketing.hadiumreyegidelim.com</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <img src="/marketing-kilit-lacivert.svg" alt="Hadi Umreye Gidelim Marketing" className="lg:hidden h-24 w-auto mb-10" />
        <div className="w-full max-w-[380px]">
          <p className="mk-ust">Marketing paneli</p>
          <h1 className="mt-1 text-[32px] font-extrabold">Giriş yapın</h1>
          <p className="mt-1 mk-soluk text-[15px]">Kampanyalarınız ve kazancınız sizi bekliyor.</p>

          {error && (
            <div className="mt-6 mk-yuvarlak bg-[#fdecea] text-[var(--mk-kirmizi)] text-[13.5px] px-4 py-3 flex items-center gap-2">
              <Ikon ad="uyari" boyut={18} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-[13px] font-bold">E-posta</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" required autoComplete="email" className="mk-alan mt-1.5 !py-3.5" />
            </label>
            <label className="block">
              <span className="text-[13px] font-bold">Şifre</span>
              <div className="relative mt-1.5">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="mk-alan !py-3.5 pr-12" />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 mk-soluk" tabIndex={-1} aria-label="Şifreyi göster">
                  <Ikon ad={showPass ? 'goz-kapali' : 'goz'} boyut={20} />
                </button>
              </div>
            </label>
            <button type="submit" disabled={loading} className="mk-btn mk-btn-ana w-full !py-3.5 text-[15px]">
              {loading ? 'Giriş yapılıyor…' : <>Giriş yap <Ikon ad="ok" boyut={19} /></>}
            </button>
          </form>

          <p className="text-center text-[14px] mk-soluk mt-8">
            Hesabınız yok mu? <Link href="/influencer/apply" className="font-bold text-[var(--mk-lacivert)]">Başvurun</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
