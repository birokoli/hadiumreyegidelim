'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
  id: string;
  senderType: 'influencer' | 'admin';
  content: string;
  createdAt: string;
}

interface ChatItem {
  id: string;
  status: string;
  lastMessageAt: string;
  unreadByAdmin: number;
  influencer: { id: string; fullName: string; email: string; instagramHandle?: string };
  messages: Message[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminSupportPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadChats = useCallback(async () => {
    const res = await fetch('/api/admin/support');
    if (res.ok) {
      const data = await res.json();
      setChats(data.chats ?? []);
    }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/support/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.chat.messages ?? []);
      setSelectedChat(data.chat);
      // unread sıfırla (lokal)
      setChats(prev => prev.map(c => c.id === id ? { ...c, unreadByAdmin: 0 } : c));
    }
  }, []);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 6000);
    return () => clearInterval(interval);
  }, [loadChats]);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
    const interval = setInterval(() => loadMessages(selectedId), 4000);
    return () => clearInterval(interval);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    await fetch(`/api/admin/support/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    await loadMessages(selectedId);
    setSending(false);
    inputRef.current?.focus();
  }

  async function toggleStatus() {
    if (!selectedId || !selectedChat) return;
    const newStatus = selectedChat.status === 'open' ? 'closed' : 'open';
    await fetch(`/api/admin/support/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setSelectedChat(s => s ? { ...s, status: newStatus } : s);
    setChats(prev => prev.map(c => c.id === selectedId ? { ...c, status: newStatus } : c));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const totalUnread = chats.reduce((s, c) => s + c.unreadByAdmin, 0);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">

      {/* ── SOL: SOHBET LİSTESİ ── */}
      <div className={`${selectedId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[340px] bg-white border-r border-outline-variant/15 shrink-0`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant/15">
          <div className="flex items-center justify-between">
            <h1 className="text-[17px] font-bold text-on-surface">Destek</h1>
            {totalUnread > 0 && (
              <span className="bg-[#003781] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </div>
          <p className="text-[12px] text-outline mt-0.5">{chats.length} aktif sohbet</p>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
              <span className="material-symbols-outlined text-4xl text-gray-200" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
              <p className="text-[13px] text-outline">Henüz sohbet yok</p>
            </div>
          )}
          {chats.map(chat => {
            const lastMsg = chat.messages[0];
            const isSelected = chat.id === selectedId;
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={`w-full px-4 py-3.5 flex items-start gap-3 border-b border-outline-variant/10 text-left transition-colors ${isSelected ? 'bg-[#003781]/5' : 'hover:bg-surface-container-low'}`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003781]/20 to-[#003781]/10 flex items-center justify-center shrink-0 text-[15px] font-black text-[#003781]">
                  {chat.influencer.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[13px] font-semibold text-on-surface truncate">{chat.influencer.fullName}</p>
                    <span className="text-[10px] text-outline shrink-0">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <p className="text-[12px] text-outline truncate mt-0.5">
                    {lastMsg ? (lastMsg.senderType === 'admin' ? 'Siz: ' : '') + lastMsg.content : 'Henüz mesaj yok'}
                  </p>
                </div>
                {chat.unreadByAdmin > 0 && (
                  <span className="w-5 h-5 bg-[#003781] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {chat.unreadByAdmin}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SAĞ: CHAT ALANI ── */}
      <div className={`${selectedId ? 'flex' : 'hidden lg:flex'} flex-col flex-1 min-w-0`}>

        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef5 100%)' }}>
            <div className="w-20 h-20 rounded-3xl bg-[#003781]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-[#003781]" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-on-surface">Bir sohbet seçin</p>
              <p className="text-[13px] text-outline mt-1">Soldan bir influencer seçerek yanıtlamaya başlayın</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-outline-variant/15 px-5 py-3.5 flex items-center gap-3 shrink-0 shadow-sm">
              <button onClick={() => setSelectedId(null)} className="lg:hidden mr-1 text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#003781]/20 to-[#003781]/10 flex items-center justify-center shrink-0 text-[14px] font-black text-[#003781]">
                {selectedChat?.influencer.fullName[0]}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-on-surface">{selectedChat?.influencer.fullName}</p>
                <p className="text-[11px] text-outline">{selectedChat?.influencer.email}</p>
              </div>
              <button
                onClick={toggleStatus}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  selectedChat?.status === 'open'
                    ? 'bg-surface-container text-on-surface-variant hover:bg-error/10 hover:text-error'
                    : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                }`}
              >
                {selectedChat?.status === 'open' ? 'Kapat' : 'Yeniden Aç'}
              </button>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5" style={{ background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef5 100%)' }}>
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-[13px] text-outline">Henüz mesaj yok</div>
              )}
              {messages.map(msg => {
                const isAdmin = msg.senderType === 'admin';
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                        isAdmin
                          ? 'bg-[#003781] text-white rounded-br-md'
                          : 'bg-surface-container-lowest text-on-surface rounded-bl-md shadow-sm shadow-black/5'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] mt-1 text-outline ${isAdmin ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatFull(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-outline-variant/15 px-4 py-3 shrink-0">
              {selectedChat?.status === 'closed' ? (
                <div className="text-center text-[13px] text-outline py-2">
                  Sohbet kapalı. Yeniden açmak için yukarıdaki butonu kullanın.
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Yanıtınızı yazın..."
                    rows={1}
                    className="flex-1 resize-none bg-surface-container-low border border-outline-variant/25 rounded-2xl px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/50 transition-all max-h-32"
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
