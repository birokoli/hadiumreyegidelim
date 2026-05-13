'use client';

import { useEffect, useState } from 'react';

const REDEMPTION_TYPES = [
  { key: 'cash',              label: 'Nakit Çek',        icon: 'payments' },
  { key: 'free_umrah',        label: 'Ücretsiz Umre',    icon: 'mosque' },
  { key: 'hybrid_umrah',      label: 'Karma Umre',       icon: 'auto_awesome' },
  { key: 'gift_item',         label: 'Hediye Katalogu',  icon: 'card_giftcard' },
  { key: 'customer_discount', label: 'Müşteri İndirimi', icon: 'local_offer' },
];

const FREE_UMRAH_OPTIONS = [
  { label: '1 Kişilik Ekonomik', points: 150000 },
  { label: '1 Kişilik Standart', points: 200000 },
  { label: '1 Kişilik VIP',      points: 320000 },
  { label: '1 Kişilik Premium',  points: 450000 },
  { label: '2 Kişilik Standart', points: 380000 },
  { label: '2 Kişilik VIP',      points: 600000 },
];

const TARGET_OPTIONS = [
  { value: 'self',    label: 'Kendim' },
  { value: 'es',      label: 'Eş' },
  { value: 'anne',    label: 'Anne' },
  { value: 'baba',    label: 'Baba' },
  { value: 'kardes',  label: 'Kardeş' },
  { value: 'cocuk',   label: 'Çocuk' },
];

const TIER_COLORS: Record<string, string> = {
  baslangic: 'text-gray-500',
  hizli:     'text-emerald-600',
  uretken:   'text-amber-600',
  sampiyon:  'text-red-500',
  yolcu:     'text-gray-400',
  haci_adayi:'text-amber-700',
  haci:      'text-gray-500',
  veli:      'text-yellow-500',
};

const TX_LABELS: Record<string, string> = {
  earn:         'Kazanıldı',
  redeem:       'Harcandı',
  refund:       'İade',
  expire:       'Süresi Doldu',
  adjust:       'Manuel Ayar',
  yearly_bonus: 'Yıl Sonu Bonusu',
};

export default function LoyaltyPage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cash');
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/influencer/loyalty').then(r => r.json()).then(setData);
  }, []);

  const account = data?.account;
  const transactions = data?.transactions ?? [];
  const pending = data?.pendingRedemptions ?? [];

  async function handleRedeem() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/influencer/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemptionType: activeTab, ...form }),
      });
      const json = await res.json();
      if (json.error) setMsg(json.error);
      else {
        setMsg('Talebiniz alındı! Admin onayından sonra işleme alınacak.');
        setForm({});
        const fresh = await fetch('/api/influencer/loyalty').then(r => r.json());
        setData(fresh);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Yıldızlarım</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Puan bakiyeniz ve harcama seçenekleriniz</p>
      </div>

      {/* Ana bakiye kartı */}
      <div className="bg-gradient-to-br from-[#003781] to-[#001f4d] rounded-2xl p-6 text-white shadow-xl shadow-[#003781]/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/60 text-[13px] font-medium">Toplam Yıldız</p>
            <p className="text-[42px] font-black tracking-tight leading-none mt-1">
              {(account.currentBalance ?? 0).toLocaleString('tr-TR')}
              <span className="text-[20px] font-semibold ml-2 text-white/60">⭐</span>
            </p>
            <p className="text-white/50 text-[13px] mt-1">≈ {(account.cashEquivalent ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-[12px]">Bu Ay</p>
            <p className="text-[22px] font-bold">{account.currentMonthSalesCount} satış</p>
            <p className={`text-[13px] font-semibold ${TIER_COLORS[account.currentMonthlyTier] || 'text-white/80'}`}>
              {account.currentMonthlyTierLabel} · {account.monthlyMultiplier}x
            </p>
          </div>
        </div>

        {/* Aylık tier progress */}
        {account.salesToNextMonthlyTier !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-[12px] text-white/60 mb-1">
              <span>{account.currentMonthlyTierLabel}</span>
              <span>{account.nextMonthlyTierLabel}'a {account.salesToNextMonthlyTier} satış kaldı (+%{Math.round((account.monthlyMultiplier > 1 ? account.monthlyMultiplier : 1.2) * 100 - 100)} bonus)</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all"
                style={{ width: `${Math.min(100, (account.currentMonthSalesCount / (account.currentMonthSalesCount + account.salesToNextMonthlyTier)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Yıllık onur */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <div>
            <p className="text-white/50 text-[12px]">Yıllık Onur</p>
            <p className="text-[15px] font-bold">{account.currentHonorTierLabel} · {account.yearlySalesCount} satış</p>
          </div>
          {account.salesToNextHonorTier && (
            <p className="text-white/50 text-[12px] text-right">{account.nextHonorTierLabel}'a<br/>{account.salesToNextHonorTier} satış kaldı</p>
          )}
        </div>

        {/* Puan süresi uyarısı */}
        {account.daysUntilExpiry < 180 && (
          <div className="mt-3 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-300">warning</span>
            <p className="text-[12px] text-red-200">{account.daysUntilExpiry} gün sonra yıldızların silinecek</p>
          </div>
        )}
      </div>

      {/* Bekleyen talepler */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-[14px] font-semibold text-amber-800 mb-2">Bekleyen Talepler</p>
          {pending.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between py-1">
              <span className="text-[13px] text-amber-700 capitalize">{r.redemptionType.replace('_', ' ')}</span>
              <span className="text-[13px] font-semibold text-amber-800">{r.pointsUsed.toLocaleString('tr-TR')} ⭐</span>
            </div>
          ))}
        </div>
      )}

      {/* Harcama bölümü */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {REDEMPTION_TYPES.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setForm({}); setMsg(''); }}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 text-[12px] font-medium transition-colors ${
                activeTab === t.key ? 'text-[#003781] border-b-2 border-[#003781]' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Nakit Çek */}
          {activeTab === 'cash' && (
            <>
              <p className="text-[13px] text-gray-500">Minimum 2.500 yıldız · 3 iş günü · IBAN'ınıza TL transferi</p>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">Puan Miktarı (min 2.500)</label>
                <input type="number" min={2500} placeholder="2500"
                  value={form.pointsUsed ?? ''}
                  onChange={e => setForm({ ...form, pointsUsed: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
                {form.pointsUsed > 0 && (
                  <p className="mt-1 text-[12px] text-gray-400">= {(form.pointsUsed / 10).toLocaleString('tr-TR')} ₺</p>
                )}
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">IBAN</label>
                <input type="text" placeholder="TR00 0000 0000 0000 0000 0000 00"
                  value={form.bankIban ?? ''}
                  onChange={e => setForm({ ...form, bankIban: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
              </div>
            </>
          )}

          {/* Ücretsiz Umre */}
          {activeTab === 'free_umrah' && (
            <>
              <p className="text-[13px] text-gray-500">Yılda en fazla 2 · Rezervasyon min 45 gün önceden</p>
              <div className="grid grid-cols-2 gap-2">
                {FREE_UMRAH_OPTIONS.map(opt => (
                  <button key={opt.label}
                    onClick={() => setForm({ ...form, pointsUsed: opt.points, umrePackageName: opt.label })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.pointsUsed === opt.points
                        ? 'border-[#003781] bg-[#003781]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <p className="text-[12px] font-semibold text-gray-800">{opt.label}</p>
                    <p className="text-[12px] text-[#003781] font-bold mt-0.5">{opt.points.toLocaleString('tr-TR')} ⭐</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">Hedef Kişi</label>
                <select value={form.targetUser ?? ''} onChange={e => setForm({ ...form, targetUser: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20">
                  <option value="">Seçin</option>
                  {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {form.targetUser && form.targetUser !== 'self' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] text-gray-500 font-medium">Ad Soyad</label>
                    <input placeholder="Ad Soyad" value={form.targetFullName ?? ''}
                      onChange={e => setForm({ ...form, targetFullName: e.target.value })}
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-500 font-medium">TC No</label>
                    <input placeholder="TC Kimlik No" value={form.targetTcNo ?? ''}
                      onChange={e => setForm({ ...form, targetTcNo: e.target.value })}
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Karma Umre */}
          {activeTab === 'hybrid_umrah' && (
            <>
              <p className="text-[13px] text-gray-500">Paket ücretinin max %95'ini puanla ödeyebilirsiniz. Min 10.000 puan.</p>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">Paket Adı</label>
                <input placeholder="Standart Umre Paketi" value={form.umrePackageName ?? ''}
                  onChange={e => setForm({ ...form, umrePackageName: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">Puan Katkısı (min 10.000)</label>
                <input type="number" min={10000} placeholder="10000" value={form.pointsUsed ?? ''}
                  onChange={e => setForm({ ...form, pointsUsed: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
                {form.pointsUsed > 0 && (
                  <p className="mt-1 text-[12px] text-gray-400">= {(form.pointsUsed / 10).toLocaleString('tr-TR')} ₺ indirim</p>
                )}
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">Hedef Kişi</label>
                <select value={form.targetUser ?? ''} onChange={e => setForm({ ...form, targetUser: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20">
                  <option value="">Seçin</option>
                  {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Hediye Katalogu */}
          {activeTab === 'gift_item' && (
            <div className="space-y-3">
              {[
                { sku: 'gc_500',               label: '500 ₺ Yemek/Market Hediye Çeki',       points: 6000 },
                { sku: 'gc_1000',              label: '1.000 ₺ Elektronik Hediye Çeki',        points: 12000 },
                { sku: 'gc_2500',              label: '2.500 ₺ Alışveriş Çeki',               points: 28000 },
                { sku: 'hotel_upgrade_basic',  label: 'Otel Yükseltme (4* → 5*)',              points: 30000 },
                { sku: 'hotel_upgrade_premium',label: "Haram'a En Yakın Otele Yükseltme",      points: 50000 },
                { sku: 'room_upgrade',         label: 'Suit Oda Yükseltme (1 Hafta)',          points: 75000 },
                { sku: 'zemzem_lux',           label: 'Lüks Zemzem Suyu + Hurma Paketi',      points: 8000 },
                { sku: 'hediyelik_set',        label: 'Mekke Hediyelik Takım',                points: 15000 },
                { sku: 'vip_transfer',         label: 'Havaalanı VIP Transfer (Mercedes)',     points: 18000 },
                { sku: 'ozel_rehber',          label: 'Özel Rehber (1 Gün)',                   points: 25000 },
              ].map(item => (
                <div key={item.sku}
                  onClick={() => setForm({ ...form, catalogItemSku: item.sku, pointsUsed: item.points })}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    form.catalogItemSku === item.sku
                      ? 'border-[#003781] bg-[#003781]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <p className="text-[13px] font-medium text-gray-800">{item.label}</p>
                  <p className="text-[13px] font-bold text-[#003781] shrink-0 ml-3">{item.points.toLocaleString('tr-TR')} ⭐</p>
                </div>
              ))}
            </div>
          )}

          {/* Müşteri İndirimi */}
          {activeTab === 'customer_discount' && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-[13px] text-blue-800 font-semibold mb-1">Nasıl çalışır?</p>
                <p className="text-[13px] text-blue-700">Takipçilerinize ekstra indirim sağlamak için puanlarınızı kullanın. Kupon oluşturulur, 30 gün geçerlidir. Kullanılmasa bile puan iade edilmez.</p>
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-medium">Puan Miktarı (5.000 – 100.000)</label>
                <input type="number" min={5000} max={100000} step={1000} placeholder="10000"
                  value={form.pointsUsed ?? ''}
                  onChange={e => setForm({ ...form, pointsUsed: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20" />
                {form.pointsUsed > 0 && (
                  <p className="mt-1 text-[12px] text-gray-400">= {(form.pointsUsed / 10).toLocaleString('tr-TR')} ₺ müşteri indirimi</p>
                )}
              </div>
            </>
          )}

          {msg && (
            <div className={`text-[13px] px-4 py-3 rounded-xl ${msg.includes('alındı') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {msg}
            </div>
          )}

          <button onClick={handleRedeem} disabled={loading}
            className="w-full bg-[#003781] text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-[#002a63] transition-colors disabled:opacity-50">
            {loading ? 'Gönderiliyor...' : 'Talep Oluştur'}
          </button>
        </div>
      </div>

      {/* İşlem geçmişi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-[16px] font-bold text-gray-900 mb-4">Son İşlemler</h2>
        {transactions.length === 0 ? (
          <p className="text-[13px] text-gray-400 text-center py-4">Henüz işlem yok</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{tx.description || TX_LABELS[tx.transactionType]}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('tr-TR')}
                    {tx.multiplierApplied && tx.multiplierApplied !== 1 && ` · ${tx.multiplierApplied}x çarpan`}
                  </p>
                </div>
                <p className={`text-[14px] font-bold ${tx.pointsAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.pointsAmount > 0 ? '+' : ''}{tx.pointsAmount.toLocaleString('tr-TR')} ⭐
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
