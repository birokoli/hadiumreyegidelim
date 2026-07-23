import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { generateWhatsAppReply } from "@/lib/whatsapp-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !(session.legacy || session.role === "super_admin" || session.permissions.includes("marketing"))) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages)
      ? body.messages.slice(-20).map((message: { role?: string; content?: string }) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: String(message.content || "").slice(0, 5000),
        })).filter((message: { content: string }) => message.content)
      : [];
    if (!messages.length) return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });

    const latest = messages.at(-1);
    if (!latest || latest.role !== "user") return NextResponse.json({ error: "Müşteri mesajı gerekli" }, { status: 400 });
    const result = await generateWhatsAppReply({
      message: latest.content,
      customerName: "Test Müşterisi",
      history: messages.slice(0, -1).map((message: { role: string; content: string }) => ({
        direction: message.role === "assistant" ? "OUTBOUND" : "INBOUND",
        content: message.content,
      })),
    });
    return NextResponse.json({ reply: result.reply, provider: result.provider, warning: result.warning });
  } catch {
    return NextResponse.json({ error: "Bağlantı hatası: Sunucu kapalı olabilir" }, { status: 502 });
  }
}
