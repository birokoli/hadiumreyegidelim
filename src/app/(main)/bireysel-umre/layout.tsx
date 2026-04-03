import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bireysel Umre Tasarlayıcı | Hadi Umre'ye Gidelim",
  description: "Mekke ve Medine otellerini seçin, VIP transferinizi ayarlayın. Ailenize özel kendi Umre paketinizi saniyeler içinde oluşturun.",
  alternates: {
    canonical: '/bireysel-umre',
  },
};

export default function BireyselUmreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
