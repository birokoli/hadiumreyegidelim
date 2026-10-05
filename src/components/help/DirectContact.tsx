import { getSiteSettings } from "@/lib/site-settings";

/** Sağ kolon: telefon, WhatsApp, e-posta, adres (admin → Ayarlar) */
export default async function DirectContact() {
  const s = await getSiteSettings();
  const wa = (s.WHATSAPP_NUMBER || "905404010038").replace("+", "");
  const phone = `+${wa.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5")}`;
  const email = s.CONTACT_EMAIL || "info@hadiumreyegidelim.com";
  const address = (s.CONTACT_ADDRESS || "Bakırköy, İstanbul").replace(/Fatih/i, "Bakırköy");
  const card = "block rounded-2xl border border-outline-variant/20 bg-white p-5 transition-colors hover:border-primary/40";
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary/80">Doğrudan ulaşın</p>
      <p className="font-headline text-2xl font-bold leading-tight text-primary">Bir mesaj uzağınızdayız.</p>
      <p className="text-sm text-on-surface-variant">Hızlı yanıt için WhatsApp; yazılı talepleriniz için formu kullanın.</p>
      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={card}>
        <span className="text-[12px] text-on-surface-variant">WhatsApp</span>
        <span className="mt-1 block font-headline text-xl font-bold text-primary">{phone}</span>
      </a>
      <a href={`tel:+${wa}`} className={card}>
        <span className="text-[12px] text-on-surface-variant">Telefon</span>
        <span className="mt-1 block font-headline text-xl font-bold text-primary">{phone}</span>
      </a>
      <a href={`mailto:${email}`} className={card}>
        <span className="text-[12px] text-on-surface-variant">E-posta</span>
        <span className="mt-1 block font-headline text-lg font-bold text-primary break-all">{email}</span>
      </a>
      <div className="rounded-2xl border border-outline-variant/20 bg-white p-5">
        <span className="text-[12px] text-on-surface-variant">Adres</span>
        <span className="mt-1 block font-semibold text-on-surface">{address}</span>
      </div>
    </div>
  );
}
