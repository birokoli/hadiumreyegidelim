// Kampanyalar (27 Ekim yenilemesi): her kampanya bir brief kartı; katılınca kişiye özel kod ve hazır içerikler açılır.
import Ikon from '@/components/influencer/Ikon';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { kampanyalar } from '@/lib/marketing/panel';

export const dynamic = 'force-dynamic';

export default async function KampanyalarPage() {
  const s = await getInfluencerSession();
  if (!s) redirect('/influencer/login');
  const liste = await kampanyalar(s.id);
  const katildiklarim = liste.filter((k) => k.katildi);
  const yeniler = liste.filter((k) => !k.katildi);

  const kart = (k: (typeof liste)[number]) => (
    <Link key={k.id} href={`/influencer/campaigns/${k.slug}`} className="mk-kart mk-gir group overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* Hazır görseller 4:5 tasarım; kırpılmasın diye kart da 4:5 (yazı görselin içinde) */}
      <div className="relative aspect-[4/5] bg-[var(--mk-gece)] overflow-hidden">
        {k.gorsel ? (
          <img src={k.gorsel} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 mk-kart-koyu mk-desen flex items-end p-5" style={{ borderRadius: 0 }}>
            <p className="relative text-white text-[22px] font-extrabold leading-tight">{k.brief?.soz || k.baslik}</p>
          </div>
        )}
        {k.katildi && <span className="absolute top-3 left-3 mk-rozet !bg-[var(--mk-kum)] !text-[var(--mk-gece)]"><Ikon ad="tik" boyut={15} />Katıldınız</span>}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[16px] font-extrabold">{k.baslik}</p>
        <p className="mt-1 text-[13.5px] mk-soluk line-clamp-2">{k.brief?.anaMesaj || k.aciklama}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {k.indirim && <span className="mk-rozet mk-rozet-mavi">{k.indirim}</span>}
          {k.komisyon ? <span className="mk-rozet mk-rozet-onay">%{k.komisyon} komisyon</span> : null}
          {k.bitis && <span className="mk-rozet mk-rozet-bekliyor">{new Date(k.bitis).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}’e kadar</span>}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between text-[13px] font-bold">
          {k.katildi ? <span className="text-[var(--mk-lacivert)] tracking-[0.08em]">{k.kod}</span> : <span className="mk-soluk">{k.katilimci} kişi katıldı</span>}
          <span className="text-[var(--mk-lacivert)] inline-flex items-center gap-1">{k.katildi ? 'İçerikler' : 'Brief’i aç'}<Ikon ad="ok" boyut={18} /></span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8">
      <div className="mk-gir">
        <p className="mk-ust">Kampanyalar</p>
        <h1 className="mt-1 text-[28px] font-extrabold">Ne paylaşacağınız hazır</h1>
        <p className="mt-1 mk-soluk text-[15px] max-w-2xl">Her kampanyada ne anlatacağınız, hazır görseller ve açıklamalar var. Katılınca size özel kod oluşur; paylaştıklarınız kodla takip edilir.</p>
      </div>

      {katildiklarim.length > 0 && (
        <section>
          <h2 className="text-[18px] font-extrabold mb-3">Katıldıklarınız</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{katildiklarim.map(kart)}</div>
        </section>
      )}
      <section>
        <h2 className="text-[18px] font-extrabold mb-3">{katildiklarim.length ? 'Katılabilecekleriniz' : 'Aktif kampanyalar'}</h2>
        {yeniler.length === 0 ? (
          <div className="mk-kart p-8 text-center mk-soluk">{liste.length ? 'Bütün aktif kampanyalara katıldınız.' : 'Şu an aktif kampanya yok.'}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{yeniler.map(kart)}</div>
        )}
      </section>
    </div>
  );
}
