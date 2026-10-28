'use client';
// Paylaşım onayı (27 Ekim): onayla ya da düzeltme iste; not influencer'ın "İçeriklerim" ekranında görünür.
// Önceki form, form verisi gönderiyordu ama API JSON bekliyordu; onay hiç kaydedilmiyordu.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaylasimOnay({ influencerId, shareId }: { influencerId: string; shareId: string }) {
  const router = useRouter();
  const [not, setNot] = useState('');
  const [yuk, setYuk] = useState('');
  const gonder = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !not.trim()) { alert('Düzeltme isterken influencer’a ne yapması gerektiğini yazın.'); return; }
    setYuk(action);
    await fetch(`/api/admin/influencers/${influencerId}/shares`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareId, action, note: not, rejectReason: action === 'reject' ? not : undefined }) });
    setYuk('');
    router.refresh();
  };
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <input value={not} onChange={(e) => setNot(e.target.value)} maxLength={500} placeholder="Influencer’a not (isteğe bağlı)"
        className="flex-1 min-w-[180px] px-3 py-1.5 bg-surface-container-low border border-outline-variant/25 rounded-lg text-[12.5px]" />
      <button onClick={() => gonder('approve')} disabled={!!yuk} className="bg-secondary hover:bg-secondary/85 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60">{yuk === 'approve' ? '…' : 'Onayla'}</button>
      <button onClick={() => gonder('reject')} disabled={!!yuk} className="border border-error/30 text-error text-[12px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60">{yuk === 'reject' ? '…' : 'Düzeltme iste'}</button>
    </div>
  );
}
