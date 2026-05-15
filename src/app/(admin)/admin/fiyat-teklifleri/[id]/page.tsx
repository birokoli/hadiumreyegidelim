'use client';

import { use } from 'react';
import QuotationForm from '../QuotationForm';

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <QuotationForm editId={id} />;
}
