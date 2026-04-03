"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      <span className="font-medium text-sm">Çıkış Yap</span>
    </button>
  );
}
