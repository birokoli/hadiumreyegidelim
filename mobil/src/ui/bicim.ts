// Türkçe biçimler: tarih, göreli zaman, para, telefon bağlantıları.
import { Linking } from "react-native";

export const tarih = (d?: string | Date | null, yil = false) =>
  d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", ...(yil ? { year: "numeric" } : {}), timeZone: "Europe/Istanbul" }) : "";
export const tarihSaat = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }) : "";

export function goreli(d?: string | Date | null) {
  if (!d) return "";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "şimdi";
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86_400) return `${Math.floor(s / 3600)} sa önce`;
  if (s < 7 * 86_400) return `${Math.floor(s / 86_400)} gün önce`;
  return tarih(d);
}

export const usd = (n?: number | null) => (n == null ? "—" : `${Math.round(n).toLocaleString("tr-TR")} $`);

export function waNumara(p?: string | null) {
  let d = String(p ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "90" + d.slice(1);
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return d.length >= 11 ? d : "";
}
export const whatsappAc = (p?: string | null, metin = "") => {
  const n = waNumara(p);
  if (n) Linking.openURL(`https://wa.me/${n}${metin ? `?text=${encodeURIComponent(metin)}` : ""}`);
};
export const ara = (p?: string | null) => p && Linking.openURL(`tel:${String(p).replace(/[^\d+]/g, "")}`);
export const epostaAc = (e?: string | null) => e && Linking.openURL(`mailto:${e}`);
export const ilkAd = (ad?: string | null) => String(ad ?? "").trim().split(/\s+/)[0] ?? "";
