import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  conversationMemoryAsHistory,
  createConversationMemory,
  ensureWhatsAppAITables,
  generateWhatsAppReply,
  getWhatsAppAIConfig,
} from "@/lib/whatsapp-ai";

export const runtime = "nodejs";
export const maxDuration = 180;

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
    take: 30,
    select: { direction: true, content: true },
  });
  const storedContext = await prisma.$queryRawUnsafe<Array<{ contextJson: string | null }>>(
    `SELECT "contextJson" FROM "WhatsAppConversation" WHERE "id" = $1 LIMIT 1`,
    conversation.id,
  );
  const chronologicalHistory = history.reverse();
  const memoryHistory = conversationMemoryAsHistory(storedContext[0]?.contextJson);
  const effectiveHistory = [...memoryHistory, ...chronologicalHistory];
  const ai = await generateWhatsAppReply({ message: String(body.text), customerName: body.name, history: effectiveHistory, config });
  const contextJson = createConversationMemory(String(body.text), effectiveHistory);
  const approvalRequired = Boolean(config.managerApprovalMode && config.managerEscalationEnabled && config.managerPhone);
  const askManager = Boolean(config.managerEscalationEnabled && config.managerPhone && (approvalRequired || ai.handoff));
  const customerReply = approvalRequired
    ? null
    : askManager
    ? "Sorunuzu doğru yanıtlayabilmek için uzman temsilcimize iletiyorum efendim. Kısa süre içinde net bilgi vereceğiz."
    : ai.reply;
  await prisma.$transaction([
    ...(customerReply ? [prisma.whatsAppMessage.create({ data: { conversationId: conversation.id, direction: "OUTBOUND", source: "ai", content: customerReply, intent: ai.intent } })] : []),
    prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        leadType: ai.leadType,
        leadScore: ai.leadScore,
        status: askManager ? "HUMAN_NEEDED" : "AI_ACTIVE",
        handoffReason: approvalRequired ? "Yönetici onayı bekleniyor" : ai.handoffReason || null,
        lastMessageAt: new Date(),
      },
    }),
  ]);
  await prisma.$executeRawUnsafe(
    `UPDATE "WhatsAppConversation" SET "contextJson" = $1 WHERE "id" = $2`,
    contextJson,
    conversation.id,
  );
  return NextResponse.json({
    reply: customerReply,
    handoff: ai.handoff,
    askManager,
    managerPhone: askManager ? config.managerPhone : null,
    managerQuestion: askManager
      ? `Müşteri +${body.phone} şunu sordu:\n“${String(body.text).trim()}”\n\nAI taslağı:\n“${ai.reply}”\n\nBu müşteriye ne cevap vereyim?`
      : null,
  });
}
