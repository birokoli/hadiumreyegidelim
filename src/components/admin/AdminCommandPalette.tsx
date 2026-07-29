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
  shortcut?: string;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = Router();
  const [query, setQuery] = useState("");

  const commands: CommandItem[] = [
    { id: "dash", label: "Dashboard (Genel Bakış)", category: "Sayfalar", href: "/admin", icon: "dashboard" },
    { id: "crm", label: "CRM Komuta Merkezi", category: "Sayfalar", href: "/admin/crm", icon: "view_kanban" },
    { id: "leads", label: "Talepler & WhatsApp İletişim", category: "Sayfalar", href: "/admin/contact", icon: "call" },
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

  // Router hook helper
  function Router() {
    return useRouter();
  }

  // Handle Keyboard Escape / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        {/* Search Input Header */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <span className="material-symbols-outlined text-slate-400 text-[22px] mr-3">search</span>
          <input
            type="text"
            className="w-full py-4 text-base bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
            placeholder="Bir sayfa veya komut arayın... (ör. Paket, CRM, Blog)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Aramanızla eşleşen bir sonuç bulunamadı.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#003781] dark:group-hover:text-sky-400 text-[20px]">
                      {cmd.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#003781] dark:group-hover:text-sky-400">
                        {cmd.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">{cmd.category}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-[16px] group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Seçmek için tıklayın</span>
          <span>Hadi Umreye Gidelim Command Center</span>
        </div>
      </div>
    </div>
  );
}
