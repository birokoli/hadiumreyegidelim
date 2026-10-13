// Umre dosyaları listesi (admin).
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listDosyalar } from "@/lib/umre";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  return NextResponse.json({ dosyalar: await listDosyalar() });
}
