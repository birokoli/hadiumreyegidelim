// Medya kiti (27 Ekim): influencer'ın paylaşımlarda kullanacağı logolar, renkler, dil kuralları ve etiketler.
// Dosyalar public/marketing/kit (kaynak: sosyal/marka-kiti/01-logo).
import Ikon from '@/components/influencer/Ikon';
import { GENEL_KURALLAR } from '@/lib/marketing/brief';
import { KopyalaButon } from '@/components/influencer/araclar';

const LOGOLAR = [
  { ad: 'Dikey logo', dosya: 'hadi-umreye-gidelim-dikey', koyu: false },
  { ad: 'Dikey logo · beyaz', dosya: 'hadi-umreye-gidelim-dikey-beyaz', koyu: true },
  { ad: 'Yatay logo', dosya: 'hadi-umreye-gidelim-yatay', koyu: false },
  { ad: 'Yatay logo · beyaz', dosya: 'hadi-umreye-gidelim-yatay-beyaz', koyu: true },
  { ad: 'Sembol h', dosya: 'sembol-h', koyu: false },
  { ad: 'Sembol h · beyaz', dosya: 'sembol-h-beyaz', koyu: true },
];
const RENKLER = [
  { ad: 'Lacivert', hex: '#203C76', acik: false },
  { ad: 'Gece', hex: '#12295A', acik: false },
  { ad: 'Kum', hex: '#F2DDA6', acik: true },
  { ad: 'Altın', hex: '#B8902A', acik: false },
  { ad: 'Zemin', hex: '#EDF1FE', acik: true },
];
const ETIKET = '#hadiumreyegidelim #bireyselumre #umre #işbirliği';

export default function MedyaKitiPage() {
  return (
    <div className="space-y-6">
      <div className="mk-gir">
        <p className="mk-ust">Medya kiti</p>
        <h1 className="mt-1 text-[28px] font-extrabold">Bizi nasıl anlatırsınız</h1>
        <p className="mt-1 mk-soluk text-[15px] max-w-2xl">Adımız bir davet: <b className="text-[var(--mk-yazi)]">“Hadi, umreye gidelim!”</b> Bireysel umreyi kolaylaştırıyoruz: tarihi ve oteli yolcu seçer, kişi başı fiyatı hemen görür; vize, otel ve transfer tek yerden.</p>
      </div>

      <section className="mk-kart p-5 lg:p-6">
        <h2 className="text-[18px] font-extrabold">Logolar</h2>
        <p className="mt-1 text-[13.5px] mk-soluk">Açık zeminde lacivert, koyu zeminde ya da fotoğraf üstünde beyaz logo. Logoyu esnetmeyin, rengini değiştirmeyin.</p>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
          {LOGOLAR.map((l) => (
            <div key={l.dosya} className="border border-[var(--mk-cizgi)] mk-yuvarlak overflow-hidden">
              <div className={`h-36 flex items-center justify-center p-6 ${l.koyu ? 'mk-kart-koyu' : 'bg-white'}`} style={{ borderRadius: 0 }}>
                <img src={`/marketing/kit/${l.dosya}.svg`} alt={l.ad} className="max-h-full max-w-full" />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-[var(--mk-cizgi)]">
                <p className="text-[13px] font-bold">{l.ad}</p>
                <div className="flex gap-1">
                  <a href={`/marketing/kit/${l.dosya}.png`} download className="mk-btn mk-btn-cizgi !py-1 !px-2 text-[12px]">PNG</a>
                  <a href={`/marketing/kit/${l.dosya}.svg`} download className="mk-btn mk-btn-cizgi !py-1 !px-2 text-[12px]">SVG</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <section className="mk-kart p-5 lg:p-6">
          <h2 className="text-[18px] font-extrabold">Renkler</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {RENKLER.map((r) => (
              <div key={r.hex}>
                <div className="h-20 mk-yuvarlak border border-[var(--mk-cizgi)]" style={{ background: r.hex }} />
                <p className="mt-1.5 text-[13px] font-bold">{r.ad}</p>
                <p className="text-[12px] mk-soluk">{r.hex}</p>
              </div>
            ))}
          </div>
          <h2 className="mt-6 text-[18px] font-extrabold">Etiketler</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-[14.5px] font-semibold text-[var(--mk-lacivert)]">{ETIKET}</p>
            <KopyalaButon metin={ETIKET} />
          </div>
          <p className="mt-2 text-[13px] mk-soluk">İş birliği paylaşımlarında #işbirliği etiketi zorunludur.</p>
        </section>

        <section className="mk-kart p-5 lg:p-6">
          <h2 className="text-[18px] font-extrabold">Nasıl konuşuruz</h2>
          <ul className="mt-3 space-y-2.5 text-[14.5px]">
            <li className="flex gap-2.5"><Ikon ad="kalp" boyut={20} className="text-[var(--mk-altin)]" />Sade, açık, sıcak. Gösteriş ve abartı yok.</li>
            <li className="flex gap-2.5"><Ikon ad="fiyat" boyut={20} className="text-[var(--mk-altin)]" />Fiyat ABD doları ve “,99” ile biter (261,99 $); kişi başı mı oda mı söylenir.</li>
            <li className="flex gap-2.5"><Ikon ad="ucak" boyut={20} className="text-[var(--mk-altin)]" />“Uçak bileti dahil değildir” cümlesi paketlerde mutlaka geçer.</li>
            <li className="flex gap-2.5"><Ikon ad="sohbet" boyut={20} className="text-[var(--mk-altin)]" />Takipçiye “siz” diye hitap edilir.</li>
          </ul>
          <h3 className="mt-5 mk-ust !text-[var(--mk-kirmizi)]">Yapmayın</h3>
          <ul className="mt-2 space-y-2">{GENEL_KURALLAR.yapma.map((m) => <li key={m} className="flex gap-2 text-[14px]"><Ikon ad="yasak" boyut={19} className="text-[var(--mk-kirmizi)]" />{m}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
