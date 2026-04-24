import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "HadiUmreyeGidelim.com gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında bilgi edinin.",
  alternates: {
    canonical: "/gizlilik-politikasi",
  },
  robots: { index: true, follow: false },
};

export default function GizlilikPolitikasiPage() {
  return (
    <main className="pt-32 pb-24 bg-surface-container-lowest min-h-screen">
      <div className="max-w-3xl mx-auto px-8">
        <nav className="flex mb-10" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2 text-sm text-on-surface-variant">
            <li><Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link></li>
            <li><span className="mx-2 text-outline">/</span></li>
            <li className="text-primary font-medium">Gizlilik Politikası</li>
          </ol>
        </nav>

        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-primary font-bold mb-4">Gizlilik Politikası</h1>
          <p className="text-on-surface-variant text-sm">Son güncelleme: Nisan 2026</p>
        </header>

        <article className="space-y-8 text-on-surface leading-relaxed">
          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">1. Veri Sorumlusu</h2>
            <p>
              Bu gizlilik politikası, hadiumreyegidelim.com internet sitesi ve sunduğu hizmetler kapsamında kişisel verilerinizin nasıl işlendiğini açıklar. Veri sorumlusu Hadi Umreye Gidelim'dir.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">2. Toplanan Veriler</h2>
            <p>Hizmetlerimizden yararlanırken aşağıdaki veriler toplanabilir:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Ad, soyad, e-posta adresi ve telefon numarası (iletişim formu)</li>
              <li>Seyahat bilgileri (uçuş tarihi, kişi sayısı, otel tercihi)</li>
              <li>IP adresi ve tarayıcı bilgileri (analitik amaçlı)</li>
              <li>Çerez (cookie) verileri</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">3. Verilerin Kullanım Amacı</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Umre organizasyonu hizmeti sunmak</li>
              <li>Rezervasyon ve teklif süreçlerini yönetmek</li>
              <li>Müşteri desteği sağlamak</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
              <li>Site performansını ölçmek (anonim analitik)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">4. Üçüncü Taraflarla Paylaşım</h2>
            <p>
              Kişisel verileriniz; otel, havayolu, transfer sağlayıcıları ve vize işlemleri için gerekli olan Suudi Arabistan yetkili kuruluşları ile yalnızca hizmet kapsamında paylaşılır. Ticari amaçla üçüncü taraflara satılmaz.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">5. Haklarınız</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Verilerinize erişim talep etme</li>
              <li>Hatalı verilerin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>İşlemeye itiraz etme</li>
            </ul>
            <p className="mt-3">
              Bu haklarınızı kullanmak için <Link href="/iletisim" className="text-primary underline hover:no-underline">iletişim sayfamız</Link> üzerinden bize ulaşabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">6. Çerezler</h2>
            <p>
              Sitemiz, kullanıcı deneyimini iyileştirmek ve analitik veriler toplamak amacıyla çerez kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
