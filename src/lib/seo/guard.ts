import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { DataforseoError } from "./dataforseo";

/** SEO ve AI görünürlük uç noktaları middleware'e güvenmeden oturumu kendisi doğrular. */
export async function requireSeoAdmin(permissions: string[] = ["marketing"]) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const allowed = session.role === "super_admin" || permissions.some((p) => session.permissions.includes(p));
  if (!allowed) return NextResponse.json({ error: "Bu bölüm için yetkiniz yok." }, { status: 403 });
  return null;
}

export const requireAiVisAdmin = () => requireSeoAdmin(["marketing", "dashboard"]);

/** Blog motoru İçerik Stüdyosu'nda: içerik veya pazarlama yetkisi yeterli */
export const requireBlogAdmin = () => requireSeoAdmin(["content", "marketing"]);

export function dfsErrorResponse(e: unknown) {
  if (e instanceof DataforseoError) {
    const status = e.status === 412 ? 412 : 502;
    return NextResponse.json({ error: e.message, needsKey: e.status === 412 }, { status });
  }
  console.error("[seo]", e);
  return NextResponse.json({ error: e instanceof Error ? e.message : "Beklenmeyen hata." }, { status: 500 });
}
