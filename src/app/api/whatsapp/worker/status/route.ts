import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WHATSAPP_BOT_STATUS_SETTING_KEY } from "@/lib/whatsapp-ai";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.WHATSAPP_BOT_TOKEN || token !== process.env.WHATSAPP_BOT_TOKEN) {
    return NextResponse.json({ error: "Yetkisiz servis" }, { status: 401 });
  }
  const body = await request.json();
  const status = {
    status: String(body.status || "BİLİNMİYOR"),
    qr: typeof body.qr === "string" && body.qr.startsWith("data:image/") ? body.qr : null,
    phone: body.phone ? String(body.phone) : null,
    error: body.error ? String(body.error).slice(0, 500) : null,
    lastEventAt: new Date().toISOString(),
  };
  await prisma.setting.upsert({
    where: { key: WHATSAPP_BOT_STATUS_SETTING_KEY },
    update: { value: JSON.stringify(status) },
    create: { key: WHATSAPP_BOT_STATUS_SETTING_KEY, value: JSON.stringify(status) },
  });
  return NextResponse.json({ success: true });
}
