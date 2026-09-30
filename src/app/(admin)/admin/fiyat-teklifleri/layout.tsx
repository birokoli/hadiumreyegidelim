import FloatingDiagButton from "@/components/admin/FloatingDiagButton";

// Fiyat teklifleri ve Excel Fiyat Motoru sayfalarına "Hata raporu" düğmesi (5.3)
export default function FiyatTeklifleriLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingDiagButton />
    </>
  );
}
