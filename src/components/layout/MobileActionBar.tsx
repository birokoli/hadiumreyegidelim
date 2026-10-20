// Ürün sayfalarının mobil alt çubuğu (20 Ekim): otel ve paket sayfasında fiyat ve ana düğme hep görünür.
// Bu sayfalarda genel alt sekme çubuğu yerine bu gösterilir (MobileTabBar → mobilCubukGizli). Yalnızca telefonda.
import Link from "next/link";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

export default function MobileActionBar({ etiket, fiyat, alt, dugme, href, whatsapp }: { etiket?: string; fiyat?: string | null; alt?: string; dugme: string; href: string; whatsapp: string }) {
  return (
    <>
      <div aria-hidden className="h-[calc(76px+env(safe-area-inset-bottom))] md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/30 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,55,129,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            {fiyat ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/70">{etiket ?? "Başlangıç"}</p>
                <p className="truncate font-headline text-[20px] font-bold leading-tight text-primary">{fiyat}</p>
                {alt && <p className="truncate text-[11px] text-on-surface-variant">{alt}</p>}
              </>
            ) : (
              <p className="text-[13px] leading-snug text-on-surface-variant">Fiyat için bize yazın</p>
            )}
          </div>
          <a href={whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp'tan sor" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#25D366]/40 text-[#1a9e4b] active:scale-95 transition-transform">
            <WhatsAppIcon className="h-6 w-6" />
          </a>
          <Link href={href} className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-[14px] font-bold text-white active:scale-95 transition-transform">
            {dugme}
          </Link>
        </div>
      </div>
    </>
  );
}
