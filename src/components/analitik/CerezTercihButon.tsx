"use client";
// Footer'daki "Çerez tercihleri": çerez seçimini sıfırlar, izin bandı yeniden çıkar (CerezIzni.tsx).
import { CEREZ_TERCIH_OLAYI } from "./CerezIzni";

export default function CerezTercihButon({ className }: { className?: string }) {
  if (!process.env.NEXT_PUBLIC_CLARITY_ID) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(CEREZ_TERCIH_OLAYI))}>
      Çerez Tercihleri
    </button>
  );
}
