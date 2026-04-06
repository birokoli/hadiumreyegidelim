import React from "react";
import { Metadata } from "next";
import BireyselUmreClient from "@/components/features/BireyselUmreClient";

export const metadata: Metadata = {
  title: "Bireysel Umre Turları ve Tasarlayıcı | Hadi Umreye Gidelim",
  description: "Kendi Bireysel Umre planınızı oluşturun. En ucuz Mekke ve Medine uçak biletleri, Kabe manzaralı lüks oteller ve VIP transfer seçenekleri.",
  alternates: {
    canonical: 'https://hadiumreyegidelim.com/bireysel-umre',
  },
};

export default function PlannerPage() {
  return (
    <BireyselUmreClient>
      <section className="max-w-screen-xl mx-auto px-6 mt-32 relative z-10">
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-outline-variant/15 shadow-sm">
          <header className="mb-10 text-center">
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold tracking-tight mb-4">
              Bireysel Umre Turları ve Fiyatları 2026: Özgürlüğünüzü Keşfedin
            </h2>
            <p className="text-on-surface-variant font-body">
              Kalabalık kafilelere bağlı kalmadan, sadece aileniz ve size özel en konforlu Mekke ve Medine deneyimi rehberi.
            </p>
          </header>

          <article className="prose prose-slate max-w-none text-on-surface-variant">
            <h3 className="font-headline text-2xl text-primary mt-8 mb-4">Bireysel Umre Nedir?</h3>
            <p className="mb-6 leading-relaxed">
              <strong>Bireysel umre</strong>, Diyanet İşleri veya geleneksel tur şirketlerinin belirlediği 40-50 kişilik standart gruplarla değil; vize, uçak, otel ve transfer süreçlerinizi tamamen kendi özel bütçenize ve ihtiyaçlarınıza göre tasarladığınız <strong>kişiselleştirilmiş ibadet</strong> seyahatidir. Özellikle aile grupları, yaşlı ebeveynleri ile seyahat edenler veya bebekli aileler için standart turların getirdiği yorucu programa tabi olmamak büyük bir lükstür.
            </p>

            <h3 className="font-headline text-2xl text-primary mt-8 mb-4">Bireysel Aile Umresi ve VIP Organizasyon</h3>
            <p className="mb-6 leading-relaxed">
              Özel bir havaalanı karşılaması (VIP Transfer), doğrudan Kabe veya Mescid-i Nebevi manzaralı en lüks otellerde (Mekke ve Medine) konaklama imkanı ile ailenize maksimum konfor sunabilirsiniz. Grubun ritmine uymak yerine; ibadetlerinizi, Kabe tavaflarınızı veya Medine ziyaretlerinizi kendi sağlığınıza ve temponuza uygun dilediğiniz vakitlerde, <em>özel manevi rehberler</em> eşliğinde planlama özgürlüğü sadece "VIP Bireysel Umre" modelinde mevcuttur.
            </p>

            <h3 className="font-headline text-2xl text-primary mt-8 mb-4">Sıkça Sorulan Sorular</h3>
            
            <div className="space-y-4 my-8">
              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Bireysel Umre yapabilmek için Suudi Vizesi nasıl alınır? (E-Vize)
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Eskiden umre vizeleri sadece acenteler üzerinden verilirdi. Artık Suudi Arabistan'ın 1 yıllık çok girişli (Multiple Entry) Elektronik Turizm Vizesi (E-Visa) sistemi ile vizeni dakikalar içerisinde alabiliyorsunuz. Başvuru esnasında "Umre yapacağım" seçeneğini işaretlemek, size Suudi hükümeti tarafından tamamen yasal ve bağımsız bir bireysel umre yetkisi verir. Diyanet onayı gerekmez.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  2026 Bireysel Umre fiyatları nasıl hesaplanır? Daha mı pahalıdır?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Sanılanın aksine bireysel umre her zaman daha pahalı değildir. Yukarıdaki tasarım aracımız (Umre Konfigüratörü) sayesinde 2026 uçak bileti, Mekke otelleri, Medine konaklaması, Hızlı Tren (Haramain) veya VİP Karşılama parametrelerini esnekçe seçebilirsiniz. Lüks bir "Özel Aile Umresi" tasarladığınızda kişi başı fiyat standart bir turun üstüne çıkabilir, ancak burada tamamen kendi standartlarınızı ve kalitenizi satın almış olursunuz. Tamamen bütçenize göre şekillenebilir.
                </div>
              </details>

              <details className="group bg-surface border border-outline-variant/30 rounded-2xl open:bg-primary/5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-primary">
                  Mekke ve Medine'de ibadetlerim için rehber desteği alabilir miyim?
                  <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed font-medium">
                  Evet! Acenteden bağımsız gitmek sizi yalnız bırakmaz. Sistemimiz içerisindeki Özel Rehber ataması sayesinde Mekke'de hocamız sizi otelinizden alır, ilk tavafınızı, sa'yınızı ve Mescid-i Haram tanıtımınızı sadece size özel refakat ederek tamamlar. 
                </div>
              </details>
            </div>
            
            <p className="border-l-4 border-primary pl-4 text-sm font-medium text-slate-500 mt-8 italic">
              <strong>Not:</strong> Sayfamızda oluşturduğunuz paketler bir Proforma/Ön Tutar belgesidir. Seçtiğiniz THY, Pegasus gibi hava yolu fiyatları sürekli güncellendiği için çağrı merkezimiz size anında güncel onaylı fiyatı sunacaktır. Kutsal topraklara olan bu eşsiz manevi yolculuğunuzda "Hadi Umreye Gidelim" ekibi olarak size en dürüst hizmeti sunmaktan onur duyarız.
            </p>
          </article>
        </div>
      </section>
    </BireyselUmreClient>
  );
}
