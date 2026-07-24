import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureWhatsAppAITables,
  getWhatsAppAIConfig,
  WHATSAPP_AI_SETTING_KEY,
} from "@/lib/whatsapp-ai";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.WHATSAPP_BOT_TOKEN || token !== process.env.WHATSAPP_BOT_TOKEN) {
    return NextResponse.json({ error: "Yetkisiz servis" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone || "").replace(/\D/g, "");
  const customerMessage = String(body.customerMessage || "").trim();
  const answer = String(body.answer || "").trim();
  if (!phone || !customerMessage || !answer) {
    return NextResponse.json({ error: "Eksik yönetici yanıtı" }, { status: 400 });
  }

  await ensureWhatsAppAITables();
  const conversation = await prisma.whatsAppConversation.findUnique({ where: { phone } });
  if (conversation) {
    await prisma.$transaction([
      prisma.whatsAppMessage.create({
        data: { conversationId: conversation.id, direction: "OUTBOUND", source: "human", content: answer, intent: "manager_answer" },
      }),
      prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { status: "AI_ACTIVE", handoffReason: null, lastMessageAt: new Date() },
      }),
    ]);
  }

  const config = await getWhatsAppAIConfig();
  config.trainingExamples = [...config.trainingExamples, {
    id: crypto.randomUUID(),
    customerMessage: customerMessage.slice(0, 1000),
    idealReply: answer.slice(0, 2000),
    category: "Yönetici WhatsApp yanıtı",
    createdAt: new Date().toISOString(),
  }].slice(-100);
  await prisma.setting.upsert({
    where: { key: WHATSAPP_AI_SETTING_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: WHATSAPP_AI_SETTING_KEY, value: JSON.stringify(config) },
  });
  return NextResponse.json({ success: true });
}
