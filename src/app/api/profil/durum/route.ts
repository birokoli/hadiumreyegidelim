// Önbellekli sayfalardaki istemci bileşenleri için oturum durumu (Profil 2, 14 Ekim): üye mi, adı ne (üye fiyatı mesajı).
import { NextResponse } from "next/server";
import { getMember } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function GET() {
  const m = await getMember().catch(() => null);
  return NextResponse.json(m ? { uye: true, ad: m.name, email: m.email } : { uye: false }, { headers: { "Cache-Control": "private, no-store" } });
}
