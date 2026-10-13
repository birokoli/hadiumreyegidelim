'use client';

import { use } from 'react';
import QuotationForm from '../QuotationForm';
import UmreDosyasiPanel from '../UmreDosyasiPanel';

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <>
      <QuotationForm editId={id} />
      {/* Kabul edilen teklifin operasyon bilgileri; müşteri profilinde görür (13 Ekim) */}
      <div id="umre-dosyasi" className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <UmreDosyasiPanel quotationId={id} />
      </div>
    </>
  );
}
