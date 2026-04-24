import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında HadiUmreyeGidelim.com KVKK aydınlatma metni.",
  alternates: {
    canonical: "/kvkk",
  },
  robots: { index: true, follow: false },
};

export default function KvkkPage() {
  return (
    <main className="pt-32 pb-24 bg-surface-container-lowest min-h-screen">
      <div className="max-w-3xl mx-auto px-8">
        <nav className="flex mb-10" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2 text-sm text-on-surface-variant">
            <li><Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link></li>
            <li><span className="mx-2 text-outline">/</span></li>
            <li className="text-primary font-medium">KVKK Aydınlatma Metni</li>
          </ol>
        </nav>

        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-primary font-bold mb-4">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-on-surface-variant text-sm">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında — Son güncelleme: Nisan 2026
          </p>
        </header>

        <article className="space-y-8 text-on-surface leading-relaxed">
          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">Veri Sorumlusu</h2>
            <p>
              İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi uyarınca veri sorumlusu sıfatıyla <strong>Hadi Umreye Gidelim</strong> tarafından hazırlanmıştır.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">İşlenen Kişisel Veriler</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Kimlik verileri:</strong> Ad, soyad, T.C. kimlik numarası (vize işlemleri)</li>
              <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası</li>
              <li><strong>Seyahat verileri:</strong> Pasaport bilgileri, uçuş ve konaklama tercihleri</li>
              <li><strong>İşlem verileri:</strong> Rezervasyon ve ödeme kayıtları</li>
              <li><strong>Teknik veriler:</strong> IP adresi, çerez bilgileri, site kullanım istatistikleri</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">İşleme Amaçları ve Hukuki Dayanaklar</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container">
                    <th className="text-left p-3 border border-outline-variant/20 font-bold text-primary">Amaç</th>
                    <th className="text-left p-3 border border-outline-variant/20 font-bold text-primary">Hukuki Dayanak</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Umre organizasyonu ve rezervasyon", "Sözleşmenin ifası (KVKK m.5/2-c)"],
                    ["Vize başvurusu ve Nusuk kaydı", "Yasal yükümlülük (KVKK m.5/2-ç)"],
                    ["Müşteri desteği ve iletişim", "Meşru menfaat (KVKK m.5/2-f)"],
                    ["Analitik ve site performansı", "Açık rıza (KVKK m.5/1)"],
                    ["Pazarlama bildirimleri", "Açık rıza (KVKK m.5/1)"],
                  ].map(([amac, dayanak]) => (
                    <tr key={amac} className="even:bg-surface-container/30">
                      <td className="p-3 border border-outline-variant/20">{amac}</td>
                      <td className="p-3 border border-outline-variant/20 text-on-surface-variant">{dayanak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">Verilerin Aktarımı</h2>
            <p>
              Kişisel verileriniz; hizmetin yürütülmesi amacıyla konaklama tesisleri, havayolu şirketleri, transfer firmaları ve Suudi Arabistan Hac ve Umre Bakanlığı'nın Nusuk sistemi ile paylaşılabilir. Yurt dışı aktarımlar KVKK'nın 9. maddesi kapsamında gerçekleştirilir.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">Saklama Süresi</h2>
            <p>
              Kişisel verileriniz, ilgili mevzuatta öngörülen süreler ve hizmet ilişkisinin gerektirdiği süre boyunca saklanır. Vergi ve muhasebe kayıtları için bu süre 10 yıldır. Süre dolduğunda veriler silinir veya anonim hale getirilir.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">KVKK Kapsamındaki Haklarınız</h2>
            <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlemenin otomatik sistemler vasıtasıyla gerçekleşmesi durumunda aleyhte sonuçlara itiraz etme</li>
              <li>Zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <p className="mt-4">
              Başvurularınız için <Link href="/iletisim" className="text-primary underline hover:no-underline">iletişim sayfamız</Link> üzerinden yazılı olarak bize ulaşabilirsiniz.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
