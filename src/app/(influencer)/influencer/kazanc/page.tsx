// Kazancım (27 Ekim): komisyon programı, yıldız bakiyesi, satışlar ve ödemeler tek ekranda.
// Kurallar affiliate.ts'ten okunur (eşik, oran); burada yalnızca gösterilir.
import Ikon from '@/components/influencer/Ikon';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { currentPeriod, currentRate, effectiveThreshold, getConfig, starBalance, validSalesCount } from '@/lib/affiliate';
import { kisaAd } from '@/lib/marketing/panel';

export const dynamic = 'force-dynamic';

const tl = (n: number) => `${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL`;
const KOMISYON: Record<string, { ad: string; sinif: string }> = {
  pending: { ad: 'Bekliyor', sinif: 'mk-rozet-bekliyor' },
  earned: { ad: 'Kazanıldı', sinif: 'mk-rozet-onay' },
  paid: { ad: 'Ödendi', sinif: 'mk-rozet-mavi' },
  refunded: { ad: 'İade', sinif: 'mk-rozet-red' },
};
const ODEME: Record<string, { ad: string; sinif: string }> = {
  pending: { ad: 'Hazırlanıyor', sinif: 'mk-rozet-bekliyor' },
  approved: { ad: 'Onaylandı', sinif: 'mk-rozet-mavi' },
  paid: { ad: 'Ödendi', sinif: 'mk-rozet-onay' },
  cancelled: { ad: 'İptal', sinif: 'mk-rozet-red' },
};

export default async function KazancPage() {
  const s = await getInfluencerSession();
  if (!s) redirect('/influencer/login');
  const period = currentPeriod();
  await getConfig(); // ayar kaydı yoksa paralel sorgular aynı anda oluşturmaya çalışmasın
  const [inf, cfg, esik, gecerli, oran, yildiz, satislar, odemeler] = await Promise.all([
    prisma.influencer.findUnique({ where: { id: s.id }, select: { programUnlocked: true, totalEarnings: true, pendingEarnings: true, bankIban: true } }),
    getConfig(),
    effectiveThreshold(s.id, period),
    validSalesCount(s.id),
    currentRate(s.id, period),
    starBalance(s.id),
    prisma.sale.findMany({ where: { influencerId: s.id }, orderBy: { saleDate: 'desc' }, take: 20, include: { customer: { select: { fullName: true } } } }),
    prisma.payment.findMany({ where: { influencerId: s.id }, orderBy: { createdAt: 'desc' }, take: 12 }),
  ]);
  if (!inf) redirect('/influencer/login');
  // Tutarlar satışlardan hesaplanır (Influencer.totalEarnings/pendingEarnings özet alanları her zaman güncel değil)
  const toplamlar = await prisma.sale.groupBy({ by: ['commissionStatus'], where: { influencerId: s.id }, _sum: { commissionAmount: true } });
  const tutar = (d: string[]) => toplamlar.filter((t) => d.includes(t.commissionStatus)).reduce((a, t) => a + (t._sum.commissionAmount ?? 0), 0);
  inf.pendingEarnings = tutar(['pending']);
  inf.totalEarnings = tutar(['earned', 'paid']);
  const kalan = Math.max(esik - gecerli, 0);

  return (
    <div className="space-y-6">
      <div className="mk-gir">
        <p className="mk-ust">Kazancım</p>
        <h1 className="mt-1 text-[28px] font-extrabold">Komisyon, yıldız ve ödemeler</h1>
      </div>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="mk-kart-koyu mk-desen p-6 lg:col-span-2">
          <div className="relative">
            <p className="mk-ust !text-[var(--mk-kum)]">Komisyon programı</p>
            <p className="mt-2 text-[34px] font-extrabold leading-none">%{oran} <span className="text-[16px] font-semibold text-white/70">bu ayki oran</span></p>
            <p className="mt-3 text-[14.5px] text-white/75 max-w-lg">
              {inf.programUnlocked
                ? 'Programınız açık; satışlarınızın komisyonu her ay hesaplanır.'
                : kalan > 0
                  ? `Program ${kalan} geçerli satıştan sonra açılır. Açıldığında o ana kadarki bütün satışların komisyonu birlikte yatar.`
                  : 'Eşiğe ulaştınız; programınız açılıyor.'}
            </p>
            <div className="mt-5 h-3 mk-hap bg-white/15 overflow-hidden"><div className="h-full mk-hap bg-[var(--mk-kum)]" style={{ width: `${inf.programUnlocked ? 100 : Math.min(100, (gecerli / Math.max(esik, 1)) * 100)}%` }} /></div>
            <div className="mt-2 flex justify-between text-[12.5px] text-white/70 font-semibold"><span>{gecerli} geçerli satış</span><span>Eşik {esik}</span></div>
            <p className="mt-4 text-[13px] text-white/60">Oran her ay performansa göre %{cfg.startRate} ile %{cfg.maxRate} arasında belirlenir. Davet ettiğiniz bir influencer ilk satışını yapınca eşiğiniz {cfg.referralReduction} düşer (en az {cfg.minThreshold}).</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="mk-kart p-5"><p className="text-[13px] mk-soluk font-semibold">Bekleyen kazanç</p><p className="mt-1 text-[26px] font-extrabold">{tl(inf.pendingEarnings)}</p></div>
          <div className="mk-kart p-5"><p className="text-[13px] mk-soluk font-semibold">Toplam kazanç</p><p className="mt-1 text-[26px] font-extrabold">{tl(inf.totalEarnings)}</p></div>
          <Link href="/influencer/loyalty" className="mk-kart p-5 hover:shadow-md transition-shadow">
            <p className="text-[13px] mk-soluk font-semibold">Yıldız bakiyesi</p>
            <p className="mt-1 text-[26px] font-extrabold">{Math.round(yildiz).toLocaleString('tr-TR')} <span className="text-[14px] mk-soluk">≈ {tl(yildiz * cfg.starToTry)}</span></p>
            <p className="mt-1 text-[13px] font-bold text-[var(--mk-lacivert)]">Yıldızları kullan →</p>
          </Link>
        </div>
      </section>

      {!inf.bankIban && (
        <div className="mk-kart p-4 flex items-center gap-3 border-[var(--mk-kum)]" style={{ background: '#fffaf0' }}>
          <Ikon ad="banka" boyut={20} className="text-[var(--mk-altin)]" />
          <p className="text-[14px] flex-1">Ödeme alabilmeniz için IBAN bilgisi gerekiyor. Destek’ten iletebilirsiniz.</p>
          <Link href="/influencer/support" className="mk-btn mk-btn-cizgi !py-2 !px-3 text-[13px]">Destek</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <section className="mk-kart overflow-hidden">
          <h2 className="px-5 pt-5 text-[17px] font-extrabold">Satışlarınız</h2>
          {satislar.length === 0 ? <p className="p-5 text-[14px] mk-soluk">Henüz satış yok. Kodunuzla ya da linkinizden gelen ilk satış burada görünür.</p> : (
            <div className="mt-2 divide-y divide-[var(--mk-cizgi)]">
              {satislar.map((x) => (
                <div key={x.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate">{kisaAd(x.customer.fullName)}{x.umrePackage ? ` · ${x.umrePackage}` : ''}</p>
                    <p className="text-[12px] mk-soluk">{new Date(x.saleDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <p className="text-[14px] font-extrabold">{tl(x.commissionAmount)}</p>
                  <span className={`mk-rozet ${KOMISYON[x.commissionStatus]?.sinif ?? 'mk-rozet-mavi'}`}>{KOMISYON[x.commissionStatus]?.ad ?? x.commissionStatus}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mk-kart overflow-hidden">
          <h2 className="px-5 pt-5 text-[17px] font-extrabold">Ödemeler</h2>
          {odemeler.length === 0 ? <p className="p-5 text-[14px] mk-soluk">Henüz ödeme yok.</p> : (
            <div className="mt-2 divide-y divide-[var(--mk-cizgi)]">
              {odemeler.map((o) => (
                <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1"><p className="text-[14px] font-semibold">{new Date(`${o.periodMonth}-01`).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</p>{o.paidAt && <p className="text-[12px] mk-soluk">{new Date(o.paidAt).toLocaleDateString('tr-TR')} ödendi</p>}</div>
                  <p className="text-[14px] font-extrabold">{tl(o.netAmount)}</p>
                  <span className={`mk-rozet ${ODEME[o.status]?.sinif ?? 'mk-rozet-mavi'}`}>{ODEME[o.status]?.ad ?? o.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
