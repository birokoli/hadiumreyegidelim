"use client";

export default function LogoutButton({ className }: { className?: string }) {
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };
  return (
    <button type="button" onClick={logout} className={className}>
      Çıkış yap
    </button>
  );
}
