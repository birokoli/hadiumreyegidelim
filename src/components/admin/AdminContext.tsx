"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface AdminContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toast: (message: string, type?: ToastType) => void;
}

// ─── Context ───────────────────────────────────────
const AdminContext = createContext<AdminContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toast: () => {},
});

export function useAdminContext() {
  return useContext(AdminContext);
}

// ─── Toast UI ──────────────────────────────────────
const STYLES: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: "bg-emerald-600", icon: "check_circle" },
  error:   { bg: "bg-red-600",     icon: "error" },
  info:    { bg: "bg-blue-600",    icon: "info" },
  warning: { bg: "bg-amber-500",   icon: "warning" },
};

function ToastList({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {items.map(t => (
        <div
          key={t.id}
          className={`${STYLES[t.type].bg} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto`}
          style={{ animation: "toastIn 0.25s ease" }}
        >
          <span
            className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {STYLES[t.type].icon}
          </span>
          <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => onClose(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}

      {/* Toast keyframe — scoped inline so no build step needed */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

// ─── Provider ──────────────────────────────────────
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  return (
    <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen, toast }}>
      {children}
      <ToastList items={toasts} onClose={removeToast} />
    </AdminContext.Provider>
  );
}
