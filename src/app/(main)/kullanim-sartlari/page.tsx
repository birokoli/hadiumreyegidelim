import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "HadiUmreyeGidelim.com kullanım şartları ve koşulları. Sitemizi kullanarak bu koşulları kabul etmiş sayılırsınız.",
  alternates: {
    canonical: "/kullanim-sartlari",
  },
  robots: { index: true, follow: false },
};

export default function KullanimSartlariPage() {
  return (
    <main className="pt-32 pb-24 bg-surface-container-lowest min-h-screen">
      <div className="max-w-3xl mx-auto px-8">
        <nav className="flex mb-10" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2 text-sm text-on-surface-variant">
            <li><Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link></li>
            <li><span className="mx-2 text-outline">/</span></li>
            <li className="text-primary font-medium">Kullanım Şartları</li>
          </ol>
        </nav>

        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl text-primary font-bold mb-4">Kullanım Şartları</h1>
          <p className="text-on-surface-variant text-sm">Son güncelleme: Nisan 2026</p>
        </header>

        <article className="prose max-w-none space-y-8 text-on-surface leading-relaxed">
          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">1. Kabul</h2>
            <p>
              hadiumreyegidelim.com adresini ziyaret ederek veya hizmetlerimizden yararlanarak bu Kullanım Şartları'nı kabul etmiş sayılırsınız. Kabul etmiyorsanız siteyi kullanmayınız.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">2. Hizmet Kapsamı</h2>
            <p>
              Hadi Umreye Gidelim, bireysel umre planlaması konusunda danışmanlık, rezervasyon aracılığı ve bilgi hizmetleri sunar. Platform üzerinden gerçekleştirilen rezervasyonlar, ilgili otel, havayolu ve transfer sağlayıcılarının kendi şart ve koşullarına tabidir.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">3. Kullanıcı Yükümlülükleri</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Gerçek ve doğru bilgi sağlamak</li>
              <li>Hesap güvenliğini korumak</li>
              <li>Siteyi yalnızca yasal amaçlarla kullanmak</li>
              <li>Diğer kullanıcıların deneyimini olumsuz etkileyecek davranışlardan kaçınmak</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">4. Sorumluluk Sınırlaması</h2>
            <p>
              Platformumuz üzerinden gerçekleştirilen rezervasyon ve organizasyonlarda, üçüncü taraf hizmet sağlayıcılarından kaynaklanan gecikmeler, iptaller veya değişiklikler için doğrudan sorumluluk kabul etmiyoruz. Mücbir sebep hallerinde (doğal afet, siyasi gelişme, salgın vb.) iptaller, ilgili sağlayıcının politikasına göre değerlendirilir.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">5. Fikri Mülkiyet</h2>
            <p>
              Sitemizdeki tüm içerik, logo, tasarım ve metinler Hadi Umreye Gidelim'e aittir. İzinsiz kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">6. Değişiklikler</h2>
            <p>
              Bu şartlar herhangi bir bildirim yapılmaksızın güncellenebilir. Güncellemeler sitede yayınlandığı tarihten itibaren geçerlidir.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl text-primary font-bold mb-3">7. İletişim</h2>
            <p>
              Sorularınız için <Link href="/iletisim" className="text-primary underline hover:no-underline">iletişim sayfamızı</Link> ziyaret edebilirsiniz.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
