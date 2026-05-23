'use client';

import { useEffect, useState } from 'react';

export default function InfluencerDavetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referralInput, setReferralInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () => {
    fetch('/api/influencer/affiliate')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    const res = await fetch('/api/influencer/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: referralInput.trim().toUpperCase() }),
    });
    const json = await res.json();
    if (res.ok) {
      setMsg(`✓ ${json.referrerName} sizi davet eden kişi olarak kaydedildi.`);
      setReferralInput('');
      load();
    } else {
      setMsg(json.error || 'Bir hata oluştu.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
      </div>
    );
  }

  const referralCode = data?.referralCode ?? '';
  const referralsMade: any[] = data?.referralsMade ?? [];
  const referralReceived = data?.referralReceived ?? null;

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/influencer/apply?ref=${referralCode}`
    : `https://marketing.hadiumreyegidelim.com/influencer/apply?ref=${referralCode}`;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Davet & Referral</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Arkadaşlarınızı davet edin, eşiğinizi düşürün</p>
      </div>

      {/* Nasıl çalışır */}
      <div className="bg-gradient-to-br from-[#003781] to-[#001f4d] rounded-2xl p-6 text-white shadow-lg shadow-[#003781]/20">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px] text-yellow-300" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
          </div>
          <div>
            <p className="text-[17px] font-bold">Davet Nasıl Çalışır?</p>
            <p className="text-[13px] text-white/60 mt-1 leading-relaxed">
              Davet ettiğiniz kişi sistemden bir satış yaptığında, o ay için program eşiğiniz <strong className="text-yellow-300">3 satış</strong> düşer.
              Her ay yenilenir, minimum eşik <strong className="text-yellow-300">2 satış</strong>'tır.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: '1', text: 'Davet kodunuzu paylaşın' },
            { step: '2', text: 'Arkadaşınız başvurur & aktif olur' },
            { step: '3', text: 'İlk satışında eşiğiniz düşer' },
          ].map(s => (
            <div key={s.step} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="w-7 h-7 bg-yellow-300 rounded-full flex items-center justify-center text-[#003781] font-black text-[13px] mx-auto mb-2">{s.step}</div>
              <p className="text-[11px] text-white/70 leading-tight">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Davet Kodun */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[16px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#003781]">share</span>
          Davet Kodunuz
        </h2>

        {/* Kod */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#003781]/5 to-[#003781]/10 rounded-2xl px-5 py-4 mb-4">
          <p className="text-[28px] font-black text-[#003781] tracking-widest flex-1">{referralCode}</p>
          <button
            onClick={() => copy(referralCode)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>

        {/* Davet linki */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <span className="material-symbols-outlined text-[18px] text-gray-400">link</span>
          <p className="flex-1 text-[12px] text-gray-600 truncate font-medium">{inviteLink}</p>
          <button
            onClick={() => copy(inviteLink)}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            Link
          </button>
        </div>

        <p className="text-[12px] text-gray-400">
          Bu linki veya kodu başvuru sayfasında giren kişiler sizin davetinizle kayıt olmuş sayılır.
        </p>
      </div>

      {/* Sizi davet eden */}
      {referralReceived && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#236B40]">person_add</span>
            Sizi Davet Eden
          </h2>
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-[14px] font-black text-[#236B40]">{referralReceived.referrer?.fullName?.[0] ?? '?'}</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900">{referralReceived.referrer?.fullName}</p>
              <p className="text-[12px] text-gray-400">
                Kod: <span className="font-bold text-[#236B40]">{referralReceived.referrer?.uniqueCode}</span>
                {referralReceived.qualified && (
                  <span className="ml-2 text-green-600 font-semibold">· Referral aktif</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Davet kodu kaydet (henüz kimseyi davetle kayıtlı değilse) */}
      {!referralReceived && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-gray-400">qr_code</span>
            Davet Koduyla Kayıt Ol
          </h2>
          <p className="text-[13px] text-gray-400 mb-4">Sizi davet eden influencer'ın kodunu girin</p>
          <form onSubmit={handleRegister} className="flex gap-3">
            <input
              type="text"
              placeholder="Örn: AHMETHOCA100"
              value={referralInput}
              onChange={e => setReferralInput(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#003781]/20 placeholder:normal-case placeholder:tracking-normal"
            />
            <button
              type="submit"
              disabled={submitting || !referralInput.trim()}
              className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a63] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] transition-all"
            >
              {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Kaydet'}
            </button>
          </form>
          {msg && (
            <p className={`mt-3 text-[13px] font-medium ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
          )}
        </div>
      )}

      {/* Davet ettiklerim */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#003781]">group</span>
            Davet Ettiklerim
            <span className="bg-[#003781]/10 text-[#003781] text-[12px] font-bold px-2.5 py-0.5 rounded-full">{referralsMade.length}</span>
          </h2>
        </div>

        {referralsMade.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
            <p className="text-[14px] font-semibold text-gray-400">Henüz kimseyi davet etmediniz</p>
            <p className="text-[12px] text-gray-300 mt-1">Yukarıdaki kodunuzu paylaşarak başlayın</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralsMade.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#003781]/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-black text-[#003781]">{r.invited?.fullName?.[0] ?? '?'}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{r.invited?.fullName}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{r.invited?.uniqueCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  {r.qualified ? (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-green-200">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-yellow-200">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Bekliyor
                    </span>
                  )}
                  {r.qualifiedPeriod && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{r.qualifiedPeriod}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
