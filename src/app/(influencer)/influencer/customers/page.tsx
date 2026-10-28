// Müşterilerim (27 Ekim yenilemesi): linkten ya da koddan gelen müşteriler, aşamalara göre (KVKK: yalnız ilk ad + baş harf).
import Ikon from '@/components/influencer/Ikon';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { kisaAd, MUSTERI_DURUM } from '@/lib/marketing/panel';

export const dynamic = 'force-dynamic';

const KAYNAK: Record<string, string> = { link: 'Link', coupon: 'Kod', manual_phone: 'Telefon', manual_branch: 'Ofis' };
const ASAMALAR = ['clicked', 'contacted', 'in_discussion', 'contracted', 'paid', 'completed'];

export default async function MusterilerimPage() {
  const s = await getInfluencerSession();
  if (!s) redirect('/influencer/login');
  const musteriler = await prisma.customer.findMany({ where: { influencerId: s.id }, orderBy: { createdAt: 'desc' }, include: { sales: { select: { commissionAmount: true, commissionStatus: true } } } });
  const say = (d: string) => musteriler.filter((m) => m.status === d).length;
  const enCok = Math.max(1, ...ASAMALAR.map(say));

  return (
    <div className="space-y-6">
      <div className="mk-gir">
        <p className="mk-ust">Müşterilerim</p>
        <h1 className="mt-1 text-[28px] font-extrabold">Sizden gelen yolcular</h1>
        <p className="mt-1 mk-soluk text-[15px] max-w-2xl">Linkinize tıklayan ya da kodunuzu kullanan herkes burada. Satış ekibimiz görüştükçe aşama güncellenir.</p>
      </div>

      <section className="mk-kart p-5 lg:p-6">
        <h2 className="text-[17px] font-extrabold">Aşamalar</h2>
        <div className="mt-4 grid grid-cols-3 lg:grid-cols-6 gap-3">
          {ASAMALAR.map((d, i) => (
            <div key={d}>
              <div className="h-24 flex items-end bg-[var(--mk-zemin)] mk-yuvarlak overflow-hidden">
                <div className="w-full" style={{ height: `${Math.max(6, (say(d) / enCok) * 100)}%`, background: i >= 4 ? 'var(--mk-yesil)' : 'var(--mk-lacivert)', opacity: 0.55 + i * 0.08 }} />
              </div>
              <p className="mt-2 text-[22px] font-extrabold leading-none">{say(d)}</p>
              <p className="mt-1 text-[12.5px] mk-soluk font-semibold">{MUSTERI_DURUM[d].ad}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mk-kart overflow-hidden">
        {musteriler.length === 0 ? (
          <div className="p-10 text-center">
            <Ikon ad="aile" boyut={44} className="text-[var(--mk-bulut)]" />
            <p className="mt-2 font-bold">Henüz müşteri yok</p>
            <p className="mt-1 text-[14px] mk-soluk">Kampanya linkinizi paylaştığınızda gelen ilk yolcu burada görünecek.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--mk-cizgi)]">
            {musteriler.map((m) => {
              const kom = m.sales.reduce((t, x) => t + (x.commissionStatus === 'refunded' ? 0 : x.commissionAmount), 0);
              return (
                <div key={m.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 mk-hap bg-[var(--mk-zemin)] text-[var(--mk-lacivert)] font-extrabold flex items-center justify-center">{m.fullName.trim()[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-bold">{kisaAd(m.fullName)}</p>
                    <p className="text-[12.5px] mk-soluk">{new Date(m.createdAt).toLocaleDateString('tr-TR')} · {KAYNAK[m.source] ?? m.source}</p>
                  </div>
                  {kom > 0 && <p className="text-[14px] font-extrabold text-[var(--mk-yesil)]">+{kom.toLocaleString('tr-TR')} TL</p>}
                  <span className={`mk-rozet ${m.status === 'paid' || m.status === 'completed' ? 'mk-rozet-onay' : m.status === 'cancelled' ? 'mk-rozet-red' : 'mk-rozet-mavi'}`}>{MUSTERI_DURUM[m.status]?.ad ?? m.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-[12.5px] mk-soluk flex gap-2"><Ikon ad="guven" boyut={18} />KVKK gereği müşterilerin telefon ve e-posta bilgileri gösterilmez; yalnızca ilk ad ve soyadın baş harfi görünür.</p>
    </div>
  );
}
