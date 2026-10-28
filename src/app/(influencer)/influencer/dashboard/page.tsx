// Bugün (27 Ekim yenilemesi): influencer girince ne yapacağını görür: öne çıkan kampanya, kişisel link ve kod,
// bu ayın sayıları, komisyon eşiği, içerik onayları ve son müşteriler. Veri sunucuda hazırlanır (bekleme ekranı yok).
import Ikon from '@/components/influencer/Ikon';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { bugunVerisi, MUSTERI_DURUM, indirimEtiketi } from '@/lib/marketing/panel';
import { KopyalaButon, PaylasButon } from '@/components/influencer/araclar';

export const dynamic = 'force-dynamic';

const tl = (n: number) => `${Math.round(n).toLocaleString('tr-TR')} TL`;

export default async function BugunPage() {
  const s = await getInfluencerSession();
  if (!s) redirect('/influencer/login');
  const d = await bugunVerisi(s.id);
  if (!d) redirect('/influencer/login');
  const { inf, stats, program, one, paylasim, musteriler } = d;
  const ad = inf.fullName.split(' ')[0];
  const saat = new Date().getHours();
  const selam = saat < 12 ? 'Hayırlı sabahlar' : saat < 18 ? 'Hayırlı günler' : 'Hayırlı akşamlar';
  const kalan = Math.max(program.esik - program.gecerli, 0);
  const yuzde = Math.min(100, Math.round((program.gecerli / Math.max(program.esik, 1)) * 100));

  return (
    <div className="space-y-6">
      <div className="mk-gir flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mk-ust">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-[28px] lg:text-[32px] font-extrabold leading-tight">{selam}, {ad}</h1>
        </div>
        {inf.status === 'pending' && (
          <span className="mk-rozet mk-rozet-bekliyor"><Ikon ad="saat" boyut={16} />Başvurunuz inceleniyor</span>
        )}
      </div>

      {/* Öne çıkan kampanya */}
      {one ? (
        <section className="mk-kart-koyu mk-desen mk-gir grid lg:grid-cols-[1.4fr_1fr]">
          <div className="relative p-6 lg:p-8">
            <p className="mk-ust !text-[var(--mk-kum)]">{one.katildi ? 'Katıldığınız kampanya' : 'Bu haftanın kampanyası'}</p>
            <h2 className="mt-2 text-[26px] lg:text-[34px] font-extrabold leading-[1.1]">{one.brief?.soz || one.kampanya.title}</h2>
            <p className="mt-3 text-[15px] text-white/75 max-w-xl">{one.brief?.anaMesaj || one.kampanya.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/influencer/campaigns/${one.kampanya.slug}`} className="mk-btn mk-btn-kum">
                <Ikon ad="belge" boyut={19} />
                {one.katildi ? 'Brief ve içerikler' : 'Brief’i aç ve katıl'}
              </Link>
              {indirimEtiketi(one.kampanya) && <span className="mk-btn !bg-white/10 !text-white !font-semibold">{indirimEtiketi(one.kampanya)}</span>}
            </div>
          </div>
          {one.brief?.gorseller[0] && (
            <div className="relative hidden lg:flex items-end justify-center pt-6 pr-6">
              <img src={one.brief.gorseller[0].url} alt="" className="max-h-[260px] w-auto shadow-2xl" style={{ borderRadius: '16px 16px 0 0' }} />
            </div>
          )}
        </section>
      ) : (
        <section className="mk-kart p-6 mk-gir"><p className="mk-soluk">Şu an aktif kampanya yok; yeni kampanya açıldığında burada görünecek.</p></section>
      )}

      {/* Sayılar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { ad: 'Bu ay tıklama', deger: stats.ayTik.toLocaleString('tr-TR'), ikon: 'tikla' },
          { ad: 'Bu ay yeni müşteri', deger: stats.ayMusteri.toLocaleString('tr-TR'), ikon: 'davet' },
          { ad: 'Bu ay satış', deger: stats.aySatis.toLocaleString('tr-TR'), ikon: 'onay' },
          { ad: 'Bekleyen kazanç', deger: tl(stats.bekleyen), ikon: 'cuzdan' },
        ].map((k) => (
          <div key={k.ad} className="mk-kart p-4 lg:p-5 mk-gir">
            <Ikon ad={k.ikon} boyut={24} className="text-[var(--mk-altin)]" />
            <p className="mt-2 text-[26px] font-extrabold leading-none">{k.deger}</p>
            <p className="mt-1.5 text-[13px] mk-soluk font-semibold">{k.ad}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
        {/* Link ve kod */}
        <section className="mk-kart p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-extrabold">Kişisel linkiniz ve kodunuz</h3>
            <Link href="/influencer/links" className="text-[13px] font-bold text-[var(--mk-lacivert)]">Tüm linkler</Link>
          </div>
          <p className="mt-1 text-[13.5px] mk-soluk">Linkten gelen ve kodu kullanan her müşteri size yazılır.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 bg-[var(--mk-zemin)] mk-yuvarlak px-4 py-3">
              <Ikon ad="link" boyut={20} className="text-[var(--mk-lacivert)]" />
              <p className="flex-1 min-w-0 truncate text-[14px] font-semibold">{d.link.replace(/^https?:\/\//, '')}</p>
              <KopyalaButon metin={d.link} />
            </div>
            <div className="flex items-center gap-2 bg-[var(--mk-zemin)] mk-yuvarlak px-4 py-3">
              <Ikon ad="fiyat" boyut={20} className="text-[var(--mk-lacivert)]" />
              <p className="flex-1 text-[20px] font-extrabold tracking-[0.12em] text-[var(--mk-lacivert)]">{inf.uniqueCode}</p>
              <KopyalaButon metin={inf.uniqueCode} />
            </div>
          </div>
          <div className="mt-4">
            <PaylasButon metin={`Umreye kendi tarihinizde gitmek isterseniz: Hadi Umreye Gidelim. Kodum: ${inf.uniqueCode}`} url={d.link} sinif="mk-btn mk-btn-ana w-full" />
          </div>
        </section>

        {/* Program ilerlemesi */}
        <section className="mk-kart p-5 lg:p-6">
          <h3 className="text-[17px] font-extrabold">Komisyon programı</h3>
          {program.acik ? (
            <p className="mt-1 text-[13.5px] mk-soluk">Programınız açık. Bu ayki komisyon oranınız <b className="text-[var(--mk-yazi)]">%{program.oran}</b>.</p>
          ) : (
            <p className="mt-1 text-[13.5px] mk-soluk">{kalan > 0 ? <>Program <b className="text-[var(--mk-yazi)]">{kalan} geçerli satıştan</b> sonra açılır; o ana kadarki komisyonlar birlikte yatar.</> : 'Eşiğe ulaştınız; program açılıyor.'}</p>
          )}
          <div className="mt-4 h-3 mk-hap bg-[var(--mk-zemin)] overflow-hidden">
            <div className="h-full mk-hap bg-[var(--mk-lacivert)]" style={{ width: `${program.acik ? 100 : yuzde}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[12.5px] mk-soluk font-semibold">
            <span>{program.gecerli} geçerli satış</span><span>Eşik {program.esik}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-[var(--mk-zemin)] mk-yuvarlak p-3"><p className="text-[12px] mk-soluk font-semibold">Yıldız bakiyesi</p><p className="text-[18px] font-extrabold">{Math.round(program.yildiz).toLocaleString('tr-TR')}</p></div>
            <div className="bg-[var(--mk-zemin)] mk-yuvarlak p-3"><p className="text-[12px] mk-soluk font-semibold">Toplam kazanç</p><p className="text-[18px] font-extrabold">{tl(stats.toplamKazanc)}</p></div>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* İçerik onayları */}
        <section className="mk-kart p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-extrabold">İçeriklerim</h3>
            <Link href="/influencer/shares" className="mk-btn mk-btn-cizgi !py-2 !px-3 text-[13px]"><Ikon ad="arti" boyut={18} />Paylaşım bildir</Link>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="mk-rozet mk-rozet-bekliyor">{paylasim.bekleyen} onay bekliyor</span>
            <span className="mk-rozet mk-rozet-onay">{paylasim.onay} onaylandı</span>
          </div>
          <div className="mt-3 divide-y divide-[var(--mk-cizgi)]">
            {paylasim.son.length === 0 && <p className="py-4 text-[14px] mk-soluk">Henüz paylaşım bildirmediniz. Paylaştığınız story ya da Reels’i buradan bildirin; onaylanınca kampanyaya sayılır.</p>}
            {paylasim.son.map((p) => (
              <div key={p.id} className="py-3 flex items-start gap-3">
                <Ikon ad={p.platform.includes('reel') || p.platform === 'tiktok' ? 'film' : 'kamera'} boyut={20} className="text-[var(--mk-metin)] mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold">{new Date(p.shareDate).toLocaleDateString('tr-TR')} · {p.platform.replace('instagram_', 'Instagram ').replace('_', ' ')}</p>
                  {p.not && <p className="text-[13px] mk-soluk mt-0.5">“{p.not}”</p>}
                </div>
                <span className={`mk-rozet ${p.status === 'approved' ? 'mk-rozet-onay' : p.status === 'rejected' ? 'mk-rozet-red' : 'mk-rozet-bekliyor'}`}>{p.status === 'approved' ? 'Onaylandı' : p.status === 'rejected' ? 'Düzeltme' : 'Bekliyor'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Son müşteriler */}
        <section className="mk-kart p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-extrabold">Son müşterileriniz</h3>
            <Link href="/influencer/customers" className="text-[13px] font-bold text-[var(--mk-lacivert)]">Tümü</Link>
          </div>
          <div className="mt-3 divide-y divide-[var(--mk-cizgi)]">
            {musteriler.length === 0 && <p className="py-4 text-[14px] mk-soluk">Linkinizden ya da kodunuzla gelen ilk müşteri burada görünecek.</p>}
            {musteriler.map((m) => (
              <div key={m.id} className="py-3 flex items-center gap-3">
                <div className="w-9 h-9 mk-hap bg-[var(--mk-zemin)] text-[var(--mk-lacivert)] text-[14px] font-extrabold flex items-center justify-center">{m.ad[0]}</div>
                <div className="flex-1"><p className="text-[14px] font-semibold">{m.ad}</p><p className="text-[12px] mk-soluk">{new Date(m.tarih).toLocaleDateString('tr-TR')}</p></div>
                <span className={`mk-rozet ${m.durum === 'paid' || m.durum === 'completed' ? 'mk-rozet-onay' : m.durum === 'cancelled' ? 'mk-rozet-red' : 'mk-rozet-mavi'}`}>{MUSTERI_DURUM[m.durum]?.ad ?? m.durum}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
