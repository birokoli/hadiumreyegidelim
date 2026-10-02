// Planlayıcı v2'den gelen talep: fiyat sunucuda katalogla yeniden hesaplanır, talep admin → İletişim/CRM'e düşer.
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCatalog, paymentSettingsFrom } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { quotePlan, planToText, type PlanInput } from "@/lib/pricing/plan";
import { notifyNewLead } from "@/lib/lead-notify";
import { detectAiSource } from "@/lib/ai-source";

const int = (v: unknown, min: number, max: number, d: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const { allowed, retryAfterMs } = rateLimit(getClientIp(request), "plan-request", 3, 10 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Çok fazla istek. Lütfen 10 dakika bekleyin." }, { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = str(body?.name, 120);
  const phone = str(body?.phone, 40);
  if (!name || phone.replace(/\D/g, "").length < 10) return NextResponse.json({ error: "Ad ve geçerli bir telefon gerekli." }, { status: 400 });

  const p = (body?.plan ?? {}) as Record<string, unknown>;
  const checkIn = YMD_REGEX.test(String(p.checkIn)) ? String(p.checkIn) : "";
  const checkOut = YMD_REGEX.test(String(p.checkOut)) ? String(p.checkOut) : "";
  if (!checkIn || !checkOut) return NextResponse.json({ error: "Giriş ve çıkış tarihlerini seçin." }, { status: 400 });

  const input: PlanInput = {
    checkIn,
    checkOut,
    mekkeNights: int(p.mekkeNights, 0, 30, 5),
    medineNights: int(p.medineNights, 0, 30, 4),
    adults: int(p.adults, 1, 30, 2),
    children: int(p.children, 0, 20, 0),
    roomType: (["2", "3", "4"].includes(String(p.roomType)) ? String(p.roomType) : "2") as PlanInput["roomType"],
    mekkeHotelId: typeof p.mekkeHotelId === "string" ? p.mekkeHotelId : null,
    medineHotelId: typeof p.medineHotelId === "string" ? p.medineHotelId : null,
    visa: p.visa === "kendim" ? "kendim" : "biz",
    serviceIds: Array.isArray(p.serviceIds) ? p.serviceIds.filter((x): x is string => typeof x === "string").slice(0, 40) : [],
  };

  const catalog = await getCatalog();
  const quote = quotePlan(input, catalog);
  const ai = detectAiSource(str(body?.referrer, 500), str(body?.utmSource, 60));
  const note = str(body?.note, 1000);
  const payment = paymentSettingsFrom(await getSiteSettings().catch(() => ({} as Record<string, string>)));
  const message = [planToText(input, quote, catalog, payment), note && `Not: ${note}`, `Kaynak: ${ai ? `yapay zekâ (${ai})` : str(body?.utmSource, 60) || "site"}`].filter(Boolean).join("\n");

  try {
    const lead = await prisma.contactRequest.create({ data: { name, phone, package: ai ? `Bireysel umre planı · AI: ${ai}` : "Bireysel umre planı", message } });
    after(() => notifyNewLead(lead));
    return NextResponse.json({ success: true, totalUsd: quote.totalUsd, complete: quote.complete });
  } catch (e) {
    console.error("[plan-request]", e);
    return NextResponse.json({ error: "Sunucu hatası. Talebiniz alınamadı." }, { status: 500 });
  }
}
