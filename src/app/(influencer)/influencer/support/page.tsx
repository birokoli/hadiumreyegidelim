'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
  id: string;
  senderType: 'influencer' | 'admin';
  content: string;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Bugün';
  if (d.toDateString() === yesterday.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('open');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/influencer/support');
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
    setStatus(data.status);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');
    const res = await fetch('/api/influencer/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      await load();
    }
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Mesajları tarihe göre grupla
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const d = formatDate(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) {
      last.msgs.push(m);
    } else {
      grouped.push({ date: d, msgs: [m] });
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-32px)] -m-4 lg:-m-8">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#003781] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-gray-900">Müşteri Temsilcisi</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <p className="text-[12px] text-gray-400">Çevrimiçi · Genellikle birkaç dakika içinde yanıtlar</p>
          </div>
        </div>
        {status === 'closed' && (
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Kapalı</span>
        )}
      </div>

      {/* ── MESAJLAR ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef5 100%)' }}>

        {/* Karşılama */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#003781]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[#003781]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-700">Nasıl yardımcı olabiliriz?</p>
              <p className="text-[13px] text-gray-400 mt-1 max-w-[240px]">Sorularınızı, sorunlarınızı veya önerilerinizi buradan iletebilirsiniz.</p>
            </div>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.date}>
            {/* Tarih ayırıcı */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-black/8" />
              <span className="text-[11px] font-semibold text-gray-400 bg-white/70 px-3 py-1 rounded-full">{group.date}</span>
              <div className="flex-1 h-px bg-black/8" />
            </div>

            <div className="space-y-1.5">
              {group.msgs.map(msg => {
                const isMe = msg.senderType === 'influencer';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                        isMe
                          ? 'bg-[#003781] text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm shadow-black/5'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] mt-1 text-gray-400 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        {status === 'closed' ? (
          <div className="text-center text-[13px] text-gray-400 py-2">
            Bu sohbet kapatılmıştır. Yeni soru için tekrar yazabilirsiniz.
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın..."
              rows={1}
              className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/50 transition-all max-h-32 overflow-y-auto"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-full bg-[#003781] hover:bg-[#002d6a] disabled:opacity-40 transition-all flex items-center justify-center shrink-0 shadow-md shadow-[#003781]/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        )}
        <p className="text-[10px] text-gray-300 text-center mt-2">Enter ile gönder · Shift+Enter yeni satır</p>
      </div>
    </div>
  );
}
