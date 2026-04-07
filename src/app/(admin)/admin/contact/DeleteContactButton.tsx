'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteContactButton({ id }: { id: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Bu iletişim talebini kalıcı olarak silmek istediğinize emin misiniz?')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh(); // Refresh the Server Component
      } else {
        alert('Silinemedi.');
        setDeleting(false);
      }
    } catch {
      alert('Hata oluştu.');
      setDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleting}
      className={`inline-flex items-center gap-2 bg-error/10 text-error font-bold text-[11px] uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-error hover:text-white active:scale-95 transition-all shadow-sm ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Talebi Sil"
    >
      <span className="material-symbols-outlined text-[14px]">{deleting ? 'hourglass_empty' : 'delete'}</span>
    </button>
  );
}
