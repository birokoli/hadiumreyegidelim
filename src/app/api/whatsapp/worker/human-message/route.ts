import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureWhatsAppAITables,
  getWhatsAppAIConfig,
  WHATSAPP_AI_SETTING_KEY,
} from "@/lib/whatsapp-ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.WHATSAPP_BOT_TOKEN || token !== process.env.WHATSAPP_BOT_TOKEN) {
    return NextResponse.json({ error: "Yetkisiz servis" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone || "").replace(/\D/g, "");
  const humanMessage = String(body.text || "").trim();
  if (!phone || !humanMessage) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  await ensureWhatsAppAITables();
  const conversation = await prisma.whatsAppConversation.findUnique({ where: { phone } });
  if (!conversation) return NextResponse.json({ success: true, learned: false });

  // 1. Yönetici mesajını WhatsAppMessage tablosuna kaydet
  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      source: "human",
      content: humanMessage,
      intent: "human_manager_reply",
    },
  });

  // 2. Müşterinin son gelen mesajını bul ve otomatik eğitime ekle
  const lastInbound = await prisma.whatsAppMessage.findFirst({
    where: { conversationId: conversation.id, direction: "INBOUND" },
    orderBy: { createdAt: "desc" },
  });

  if (lastInbound && lastInbound.content.trim().length > 3 && humanMessage.length > 5) {
    const config = await getWhatsAppAIConfig();
    const isDuplicate = config.trainingExamples.some(
      (ex) => ex.customerMessage === lastInbound.content.trim() && ex.idealReply === humanMessage,
    );

    if (!isDuplicate) {
      config.trainingExamples = [
        ...config.trainingExamples,
        {
          id: crypto.randomUUID(),
          customerMessage: lastInbound.content.trim().slice(0, 1000),
          idealReply: humanMessage.slice(0, 2000),
          category: "Yönetici Canlı Cevabı",
          createdAt: new Date().toISOString(),
        },
      ].slice(-100);

      await prisma.setting.upsert({
        where: { key: WHATSAPP_AI_SETTING_KEY },
        update: { value: JSON.stringify(config) },
        create: { key: WHATSAPP_AI_SETTING_KEY, value: JSON.stringify(config) },
      });
    }
  }

  // 3. Konuşma son mesaj zamanını güncelle
  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json({ success: true, learned: true });
}
