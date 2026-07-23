import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST() {
  const session = await getAdminSession();
  if (!session || !(session.legacy || session.role === "super_admin" || session.permissions.includes("marketing"))) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }
  if (!process.env.WHATSAPP_BOT_URL || !process.env.WHATSAPP_BOT_TOKEN) {
    return NextResponse.json({ error: "QR bot servisi tanımlı değil" }, { status: 503 });
  }
  const response = await fetch(`${process.env.WHATSAPP_BOT_URL.replace(/\/$/, "")}/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_BOT_TOKEN}` },
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
