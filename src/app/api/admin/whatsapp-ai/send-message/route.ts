import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureWhatsAppAITables, getWhatsAppAIConfig, WHATSAPP_AI_SETTING_KEY } from "@/lib/whatsapp-ai";

export const runtime = "nodejs";

async function authorized() {
  const session = await getAdminSession();
  return Boolean(session && (session.legacy || session.role === "super_admin" || session.permissions.includes("marketing")));
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const conversationId = String(body.conversationId || "");
  const phone = String(body.phone || "").replace(/\D/g, "");
  const text = String(body.text || "").trim();

  if ((!conversationId && !phone) || !text) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  await ensureWhatsAppAITables();

  let conversation = conversationId
    ? await prisma.whatsAppConversation.findUnique({ where: { id: conversationId } })
    : await prisma.whatsAppConversation.findUnique({ where: { phone } });

  if (!conversation && phone) {
    conversation = await prisma.whatsAppConversation.create({
      data: { phone, status: "HUMAN_NEEDED", handoffReason: "Panelden yönetici mesajı gönderildi" },
    });
  }

  if (!conversation) {
    return NextResponse.json({ error: "Konuşma bulunamadı" }, { status: 404 });
  }

  // 1. WhatsApp Bot Servisine HTTP İsteği Gönder (Müşterinin WhatsApp'ına Mesaj At)
  const botToken = process.env.WHATSAPP_BOT_TOKEN;
  const botUrl = process.env.WHATSAPP_BOT_URL || "http://localhost:3001";

  try {
    const botResponse = await fetch(`${botUrl}/send-message`, {
      method: "POST",
      headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ phone: conversation.phone, message: text }),
    }).catch(() => null);

    if (botResponse && !botResponse.ok) {
      console.warn("[Admin Send Message] Bot servisi yanıt vermedi veya hata döndü:", botResponse.status);
    }
  } catch (err) {
    console.error("[Admin Send Message] Bot çağrısı hatası:", err);
  }

  // 2. Mesajı Veritabanına Yönetici Mesajı Olarak Ekle
  const createdMessage = await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      source: "human",
      content: text,
      intent: "admin_panel_reply",
    },
  });

  // 3. Müşterinin Son Mesajı Varsa Otomatik Eğitime Ekle (Auto-Learning)
  const lastInbound = await prisma.whatsAppMessage.findFirst({
    where: { conversationId: conversation.id, direction: "INBOUND" },
    orderBy: { createdAt: "desc" },
  });

  if (lastInbound && lastInbound.content.trim().length > 3 && text.length > 5) {
    const config = await getWhatsAppAIConfig();
    const isDuplicate = config.trainingExamples.some(
      (ex) => ex.customerMessage === lastInbound.content.trim() && ex.idealReply === text,
    );

    if (!isDuplicate) {
      config.trainingExamples = [
        ...config.trainingExamples,
        {
          id: crypto.randomUUID(),
          customerMessage: lastInbound.content.trim().slice(0, 1000),
          idealReply: text.slice(0, 2000),
          category: "Admin Paneli Canlı Yanıtı",
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

  // 4. Konuşmayı Güncelle (Son Mesaj Zamanı ve Temsilci Modu)
  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      status: "HUMAN_NEEDED",
      handoffReason: "Yönetici panelden canlı müdahale etti",
      lastMessageAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, message: createdMessage });
}
