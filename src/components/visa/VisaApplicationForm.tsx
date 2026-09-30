"use client";

import { useState } from "react";
import Link from "next/link";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

type Status = "idle" | "sending" | "done" | "error";

const field = "w-full rounded-xl border border-outline-variant/50 bg-white px-4 py-3 text-[15px] text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const label = "block text-[13px] font-semibold text-on-surface mb-1.5";

/** Umre vizesi ön başvuru formu: talep admin → İletişim'e düşer, pasaport bilgisi sonra güvenli kanaldan alınır */
export default function VisaApplicationForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", people: "1", month: "", nationality: "Türkiye Cumhuriyeti", passport: "evet", note: "", consent: false });
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return setError("Devam etmek için KVKK aydınlatma metnini onaylayın.");
    setStatus("sending");
    setError("");
    const message = [
      `E-posta: ${form.email || "-"}`,
      `Kişi sayısı: ${form.people}`,
      `Planlanan gidiş: ${form.month || "belirtilmedi"}`,
      `Uyruk: ${form.nationality}`,
      `Pasaport en az 6 ay geçerli: ${form.passport}`,
      form.note ? `Not: ${form.note}` : "",
    ].filter(Boolean).join("\n");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), package: "Umre vizesi başvurusu", message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Başvuru gönderilemedi.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  };

  const wa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba, umre vizesi başvurusu yaptım. Ad soyad: ${form.name}. Pasaport bilgilerimi iletmek istiyorum.`)}`;

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 md:p-8" role="status">
        <p className="font-headline text-2xl font-bold text-primary">Başvurunuz alındı</p>
        <p className="mt-2 text-on-surface-variant leading-relaxed">
          Ekibimiz sizi {form.phone} numarasından arayarak ya da WhatsApp&apos;tan yazarak ücret, süre ve gereken belgeleri bildirecek. Pasaport bilgilerinizi yalnızca bu görüşmede güvenli şekilde isteyeceğiz.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:bg-[#1fb857]">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp&apos;tan hemen yaz
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-outline-variant/30 bg-white p-6 md:p-8 shadow-[0_18px_40px_-24px_rgba(0,25,68,0.35)]" noValidate>
      <p className="font-headline text-xl font-bold text-primary">Ön başvuru formu</p>
      <p className="mt-1 text-sm text-on-surface-variant">Pasaport numarası istemiyoruz; belgeleri görüşmede güvenli şekilde alacağız.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="v-name" className={label}>Ad soyad *</label>
          <input id="v-name" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="v-phone" className={label}>Telefon (WhatsApp) *</label>
          <input id="v-phone" required type="tel" autoComplete="tel" inputMode="tel" placeholder="05xx xxx xx xx" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="v-email" className={label}>E-posta</label>
          <input id="v-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="v-people" className={label}>Kaç kişi için?</label>
          <select id="v-people" value={form.people} onChange={(e) => set("people", e.target.value)} className={field}>
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>{n} kişi</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="v-month" className={label}>Planlanan gidiş</label>
          <input id="v-month" placeholder="Ör. Kasım 2026" value={form.month} onChange={(e) => set("month", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="v-nat" className={label}>Uyruk</label>
          <input id="v-nat" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="v-pass" className={label}>Pasaport en az 6 ay geçerli mi?</label>
          <select id="v-pass" value={form.passport} onChange={(e) => set("passport", e.target.value)} className={field}>
            <option value="evet">Evet</option>
            <option value="hayır">Hayır</option>
            <option value="emin değilim">Emin değilim</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="v-note" className={label}>Eklemek istedikleriniz</label>
          <textarea id="v-note" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} className={`${field} resize-y`} />
        </div>
        <label className="sm:col-span-2 flex items-start gap-3 text-[13px] text-on-surface-variant cursor-pointer">
          <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]" />
          <span>
            Bilgilerimin başvurumun değerlendirilmesi ve benimle iletişim kurulması için işlenmesine izin veriyorum. <Link href="/kvkk" className="text-primary underline underline-offset-2">KVKK aydınlatma metni</Link>
          </span>
        </label>
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-error" role="alert">{error}</p>}
      <button type="submit" disabled={status === "sending" || !form.name.trim() || !form.phone.trim()} className="mt-6 w-full rounded-xl bg-primary px-6 py-4 text-[15px] font-bold text-white hover:bg-primary/90 disabled:opacity-50">
        {status === "sending" ? "Gönderiliyor…" : "Başvuruyu gönder"}
      </button>
    </form>
  );
}
