import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-auth";
import { webGecisKodu, webGecisKullan } from "@/lib/mobil/oturum";
import { mobilOturum, oturumYok } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

/** POST (Bearer) → { kod }: 60 saniyelik, tek kullanımlık */
export async function POST(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  return NextResponse.json({ kod: await webGecisKodu(o.adminId, o.cihazId) });
}

/** GET ?kod=&yol=/admin/... → admin çerezi + yönlendirme (uygulamanın WebView'ı açar) */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const yolHam = u.searchParams.get("yol") || "/admin";
  const yol = /^\/admin(\/|\?|$)/.test(yolHam) && !yolHam.includes("//") ? yolHam : "/admin";
  const oturum = await webGecisKullan(u.searchParams.get("kod") || "");
  if (!oturum) return NextResponse.redirect(new URL("/admin/login", u), 302);
  const r = NextResponse.redirect(new URL(yol, u), 302);
  const ortak = { httpOnly: true, path: "/", secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: 24 * 60 * 60 };
  r.cookies.set({ name: "admin_token", value: await createAdminToken(oturum, "1d"), ...ortak });
  r.cookies.set({ name: "admin_session", value: "true", ...ortak });
  return r;
}
