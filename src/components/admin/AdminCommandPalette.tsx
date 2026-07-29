"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  category: "Sayfalar" | "Hızlı Eylemler" | "Yönetim";
  href?: string;
  action?: () => void;
  icon: string;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const commands: CommandItem[] = [
    { id: "dash", label: "Dashboard (Genel Bakış)", category: "Sayfalar", href: "/admin", icon: "grid_view" },
    { id: "crm", label: "CRM Komuta Merkezi", category: "Sayfalar", href: "/admin/crm", icon: "view_kanban" },
    { id: "leads", label: "Talepler & WhatsApp İletişim", category: "Sayfalar", href: "/admin/contact", icon: "chat" },
    { id: "pkg", label: "Lüks Paket Yönetimi", category: "Sayfalar", href: "/admin/packages", icon: "inventory_2" },
    { id: "calc", label: "Excel Fiyat Motoru", category: "Sayfalar", href: "/admin/fiyat-teklifleri/hesaplayici", icon: "calculate" },
    { id: "blog", label: "Blog İçerik Stüdyosu", category: "Sayfalar", href: "/admin/content", icon: "article" },
    { id: "ai", label: "Yapay Zeka (AI) İzleme", category: "Sayfalar", href: "/admin/ai-logs", icon: "memory" },
    { id: "users", label: "Kullanıcı Yönetimi", category: "Sayfalar", href: "/admin/users", icon: "manage_accounts" },
    { id: "set", label: "Sistem Ayarları", category: "Sayfalar", href: "/admin/settings", icon: "settings" },

    { id: "act-pkg", label: "Yeni Paket Oluştur", category: "Hızlı Eylemler", href: "/admin/packages?action=new", icon: "add_box" },
    { id: "act-blog", label: "Yeni Blog Yazısı Ekle", category: "Hızlı Eylemler", href: "/admin/content?action=new", icon: "post_add" },
    { id: "act-quote", label: "Yeni Fiyat Teklifi Hazırla", category: "Hızlı Eylemler", href: "/admin/fiyat-teklifleri/hesaplayici", icon: "request_quote" },
    { id: "act-site", label: "Canlı Siteyi Aç", category: "Yönetim", action: () => window.open("/", "_blank"), icon: "open_in_new" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    onClose();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded border border-zinc-200 shadow-2xl overflow-hidden z-10">
        <div className="flex items-center px-4 border-b border-zinc-200">
          <span className="material-symbols-outlined text-zinc-400 text-[20px] mr-3">search</span>
          <input
            type="text"
            className="w-full py-3.5 text-sm bg-transparent text-zinc-900 focus:outline-none placeholder:text-zinc-400"
            placeholder="Bir sayfa veya komut arayın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-100 rounded border border-zinc-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              Aramanızla eşleşen sonuç bulunamadı.
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-zinc-100 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-400 group-hover:text-zinc-900 text-[18px]">
                      {cmd.icon}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">{cmd.label}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">{cmd.category}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-zinc-300 text-[16px]">chevron_right</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Seçim yapmak için tıklayın</span>
          <span>Hadi Umreye Gidelim Swiss Command Center</span>
        </div>
      </div>
    </div>
  );
}
