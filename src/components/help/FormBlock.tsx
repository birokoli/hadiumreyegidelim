import SupportForm from "@/components/help/SupportForm";
import DirectContact from "@/components/help/DirectContact";
import { getSiteSettings } from "@/lib/site-settings";

/** Form + sağda doğrudan iletişim (destek, grup, işletme sayfalarında ortak) */
export default async function FormBlock({ title, lead, defaultSubject, extraLabel, initialMessage }: { title: string; lead: string; defaultSubject?: string; extraLabel?: string; initialMessage?: string }) {
  const wa = ((await getSiteSettings()).WHATSAPP_NUMBER || "905404010038").replace("+", "");
  return (
    <div id="form" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
        <h2 className="font-headline text-2xl font-bold text-primary">{title}</h2>
        <p className="mt-2 mb-6 max-w-2xl text-sm text-on-surface-variant">{lead}</p>
        <SupportForm defaultSubject={defaultSubject} whatsappNumber={wa} extraLabel={extraLabel} initialMessage={initialMessage} />
      </div>
      <DirectContact />
    </div>
  );
}
