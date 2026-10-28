// Kampanya brief'i (27 Ekim): influencer'ın tek sayfada ihtiyacı olan her şey: fikir, ne söyleyecek, neyi söylemeyecek,
// doğrulanmış bilgiler, hazır görseller, hazır ve yapay zekâyla kişiselleştirilmiş açıklamalar, kişiye özel kod ve link.
import Ikon from '@/components/influencer/Ikon';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { getBrief, GENEL_KURALLAR, kisisellestir } from '@/lib/marketing/brief';
import { kampanyaLinki, indirimEtiketi } from '@/lib/marketing/panel';
import { KopyalaButon } from '@/components/influencer/araclar';
import { Katil, StoryUret, Aciklama, YapayZekaAciklama } from './etkilesim';

export const dynamic = 'force-dynamic';

const FORMAT_AD = { story: 'Story 9:16', gonderi: 'Gönderi 4:5', kare: 'Kare', yatay: 'Yatay 16:9' } as const;

export default async function KampanyaPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await getInfluencerSession();
  if (!s) redirect('/influencer/login');
  const { slug } = await params;
  const kampanya = await prisma.campaign.findUnique({ where: { slug } });
  if (!kampanya || kampanya.status !== 'active') notFound();
  const [brief, katilim, inf] = await Promise.all([
    getBrief(kampanya.id),
    prisma.campaignParticipant.findUnique({ where: { campaignId_influencerId: { campaignId: kampanya.id, influencerId: s.id } } }),
    prisma.influencer.findUnique({ where: { id: s.id }, select: { instagramHandle: true } }),
  ]);
  const kod = katilim?.uniqueCode ?? null;
  const link = kod ? kampanyaLinki(kampanya.slug, kod) : '';
  const indirim = indirimEtiketi(kampanya);
  const yap = [...(brief?.yap ?? []), ...GENEL_KURALLAR.yap];
  const yapma = [...(brief?.yapma ?? []), ...GENEL_KURALLAR.yapma];

  return (
    <div className="space-y-6">
      <Link href="/influencer/campaigns" className="mk-btn mk-btn-sade !px-2 !py-1 text-[13px]"><Ikon ad="geri" boyut={18} />Kampanyalar</Link>

      {/* Başlık */}
      <section className="mk-kart-koyu mk-desen mk-gir grid lg:grid-cols-[1.3fr_1fr]">
        <div className="relative p-6 lg:p-9">
          <p className="mk-ust !text-[var(--mk-kum)]">{kampanya.title}</p>
          <h1 className="mt-2 text-[30px] lg:text-[42px] font-extrabold leading-[1.05]">{brief?.soz || kampanya.title}</h1>
          {brief?.amac && <p className="mt-4 text-[15.5px] text-white/75 max-w-xl leading-relaxed">{brief.amac}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {indirim && <span className="mk-rozet !bg-white/10 !text-white">{indirim}</span>}
            {kampanya.commissionPct ? <span className="mk-rozet !bg-white/10 !text-white">%{kampanya.commissionPct} komisyon</span> : null}
            {brief?.takvim && <span className="mk-rozet !bg-white/10 !text-white">{brief.takvim}</span>}
          </div>
          <div className="mt-6">
            {kod ? (
              <div className="inline-flex flex-wrap items-center gap-3 bg-white/10 mk-yuvarlak px-4 py-3">
                <span className="text-[12px] font-bold text-white/60">Kodunuz</span>
                <span className="text-[22px] font-extrabold tracking-[0.12em] text-[var(--mk-kum)]">{kod}</span>
                <KopyalaButon metin={kod} sinif="mk-btn mk-btn-kum !py-2 !px-3 text-[13px]" />
              </div>
            ) : (
              <Katil campaignId={kampanya.id} />
            )}
          </div>
        </div>
        {brief?.gorseller[0] && (
          <div className="relative hidden lg:flex items-end justify-center pt-8 pr-8">
            <img src={brief.gorseller[0].url} alt="" className="max-h-[340px] w-auto shadow-2xl" style={{ borderRadius: '18px 18px 0 0' }} />
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4 items-start">
        <div className="space-y-4">
          {/* Ana mesaj */}
          {brief?.anaMesaj && (
            <section className="mk-kart p-5 lg:p-6">
              <p className="mk-ust">Takipçinize söyleyeceğiniz tek şey</p>
              <p className="mt-2 text-[20px] font-extrabold leading-snug">{brief.anaMesaj}</p>
            </section>
          )}

          {/* Doğrulanmış bilgiler */}
          {brief?.bilgiler.length ? (
            <section className="mk-kart p-5 lg:p-6">
              <p className="mk-ust">Söyleyebileceğiniz bilgiler</p>
              <p className="mt-1 text-[13px] mk-soluk">Fiyat ve dahil olanlar yalnızca bu haliyle söylenir; değişirse burada güncellenir.</p>
              <ul className="mt-3 space-y-2">
                {brief.bilgiler.map((b) => (
                  <li key={b} className="flex gap-2.5 text-[14.5px]"><Ikon ad="bilgi" boyut={19} className="text-[var(--mk-lacivert)] mt-0.5" />{b}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Hazır açıklamalar */}
          {kod && brief?.aciklamalar.length ? (
            <section className="mk-kart p-5 lg:p-6">
              <p className="mk-ust">Hazır açıklamalar</p>
              <p className="mt-1 text-[13px] mk-soluk">Kodunuz ve linkiniz içine yerleştirildi. Kopyalayıp kendi cümlelerinizle değiştirebilirsiniz.</p>
              <div className="mt-3 space-y-3">
                {brief.aciklamalar.map((a, i) => <Aciklama key={i} metin={kisisellestir(a, kod, link)} link={link} />)}
              </div>
              {brief.hashtagler && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <p className="text-[13.5px] font-semibold text-[var(--mk-lacivert)]">{brief.hashtagler}</p>
                  <KopyalaButon metin={brief.hashtagler} etiket="Etiketleri kopyala" />
                </div>
              )}
            </section>
          ) : null}

          {kod && <YapayZekaAciklama campaignId={kampanya.id} link={link} />}
        </div>

        <div className="space-y-4">
          {/* Görseller */}
          {brief?.gorseller.length ? (
            <section className="mk-kart p-5">
              <p className="mk-ust">Hazır görseller</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {brief.gorseller.map((g) => (
                  <a key={g.url} href={g.url} download className="group block">
                    <div className="bg-[var(--mk-zemin)] mk-yuvarlak overflow-hidden aspect-[4/5] flex items-center justify-center">
                      <img src={g.url} alt={g.ad} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
                    </div>
                    <p className="mt-1.5 text-[12.5px] font-bold flex items-center gap-1"><Ikon ad="indir" boyut={16} />{g.ad || FORMAT_AD[g.format]}</p>
                  </a>
                ))}
              </div>
              {kod && <div className="mt-4"><StoryUret slug={kampanya.slug} baslik={kampanya.storyTitle || kampanya.title} kod={kod} indirim={indirim} komisyon={kampanya.commissionPct} handle={inf?.instagramHandle ?? null} /></div>}
            </section>
          ) : kod ? (
            <section className="mk-kart p-5"><StoryUret slug={kampanya.slug} baslik={kampanya.storyTitle || kampanya.title} kod={kod} indirim={indirim} komisyon={kampanya.commissionPct} handle={inf?.instagramHandle ?? null} /></section>
          ) : null}

          {/* Kampanya linki */}
          {kod && (
            <section className="mk-kart p-5">
              <p className="mk-ust">Kampanya linkiniz</p>
              <p className="mt-2 text-[13.5px] font-semibold break-all">{link.replace(/^https?:\/\//, '')}</p>
              <div className="mt-3 flex gap-2"><KopyalaButon metin={link} /><Link href={`/influencer/shares?kampanya=${kampanya.id}`} className="mk-btn mk-btn-ana !py-2 !px-3 text-[13px]"><Ikon ad="tik-daire" boyut={18} />Paylaştım, bildir</Link></div>
            </section>
          )}

          {/* Yap / yapma */}
          <section className="mk-kart p-5">
            <p className="mk-ust">Yapın</p>
            <ul className="mt-2 space-y-2">{yap.map((m) => <li key={m} className="flex gap-2 text-[14px]"><Ikon ad="tik-daire" boyut={19} className="text-[var(--mk-yesil)]" />{m}</li>)}</ul>
            <p className="mk-ust mt-5 !text-[var(--mk-kirmizi)]">Yapmayın</p>
            <ul className="mt-2 space-y-2">{yapma.map((m) => <li key={m} className="flex gap-2 text-[14px]"><Ikon ad="yasak" boyut={19} className="text-[var(--mk-kirmizi)]" />{m}</li>)}</ul>
          </section>
        </div>
      </div>
    </div>
  );
}
