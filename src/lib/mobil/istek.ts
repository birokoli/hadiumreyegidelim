// Mobil uçlarda oturum: Bearer erişim anahtarı (1 saat) + cihaz hâlâ iptal edilmemiş mi.
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtKey } from "@/lib/jwt-key";
import { normalizePermissions } from "@/lib/admin-auth";
import { cihazGecerli } from "./oturum";

export type MobilOturum = { adminId: string; ad: string; rol: string; yetkiler: string[]; cihazId: string };

export async function mobilOturum(req: Request): Promise<MobilOturum | null> {
  const h = req.headers.get("authorization") || "";
  if (!h.toLowerCase().startsWith("bearer ")) return null;
  try {
    const { payload } = await jwtVerify(h.slice(7).trim(), await getJwtKey());
    const cihazId = typeof payload.cihaz === "string" ? payload.cihaz : "";
    if (!payload.id || !(await cihazGecerli(cihazId))) return null;
    return { adminId: String(payload.id), ad: String(payload.name || "Yönetici"), rol: String(payload.role || ""), yetkiler: normalizePermissions(payload.permissions), cihazId };
  } catch {
    return null;
  }
}

export const yetkili = (o: MobilOturum, yetki: string) => o.rol === "super_admin" || o.yetkiler.includes(yetki);
export const oturumYok = () => NextResponse.json({ hata: "Oturum gerekli." }, { status: 401 });
export const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "bilinmiyor";
