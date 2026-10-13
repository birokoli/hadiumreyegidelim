export function orderStatus(s: string): { label: string; cls: string } {
  if (s === "PENDING") return { label: "Hazırlanıyor", cls: "bg-[#fbf4e1] text-[#8a6a1c]" };
  if (s === "APPROVED") return { label: "Onaylandı", cls: "bg-[#e8f3ec] text-[#2f7d55]" };
  if (s === "CANCELLED") return { label: "İptal edildi", cls: "bg-red-50 text-red-700" };
  return { label: s, cls: "bg-[var(--h-white)] text-[var(--h-blue)]" };
}
