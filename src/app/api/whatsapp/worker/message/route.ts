import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureWhatsAppAITables, generateWhatsAppReply, getWhatsAppAIConfig } from "@/lib/whatsapp-ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.WHATSAPP_BOT_TOKEN || token !== process.env.WHATSAPP_BOT_TOKEN) {
    return NextResponse.json({ error: "Yetkisiz servis" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.messageId || !body.phone || !body.text) return NextResponse.json({ error: "Eksik mesaj" }, { status: 400 });
  await ensureWhatsAppAITables();
  const existing = await prisma.whatsAppMessage.findUnique({ where: { externalId: String(body.messageId) } });
  if (existing) return NextResponse.json({ duplicate: true });
  const config = await getWhatsAppAIConfig();
  const conversation = await prisma.whatsAppConversation.upsert({
    where: { phone: String(body.phone) },
    update: { name: body.name || undefined, lastMessageAt: new Date() },
    create: { phone: String(body.phone), name: body.name || null },
  });
  await prisma.whatsAppMessage.create({
    data: { conversationId: conversation.id, externalId: String(body.messageId), direction: "INBOUND", source: "customer", content: String(body.text) },
  });
  if (!config.enabled || !conversation.botEnabled) return NextResponse.json({ reply: null, reason: "AI_DISABLED" });
  const history = await prisma.whatsAppMessage.findMany({
    where: { conversationId: conversation.id, externalId: { not: String(body.messageId) } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { direction: true, content: true },
  });
  const ai = await generateWhatsAppReply({ message: String(body.text), customerName: body.name, history: history.reverse(), config });
  await prisma.$transaction([
    prisma.whatsAppMessage.create({ data: { conversationId: conversation.id, direction: "OUTBOUND", source: "ai", content: ai.reply, intent: ai.intent } }),
    prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { leadType: ai.leadType, leadScore: ai.leadScore, status: ai.handoff ? "HUMAN_NEEDED" : "AI_ACTIVE", handoffReason: ai.handoffReason || null, lastMessageAt: new Date() },
    }),
  ]);
  return NextResponse.json({ reply: ai.reply, handoff: ai.handoff });
}
