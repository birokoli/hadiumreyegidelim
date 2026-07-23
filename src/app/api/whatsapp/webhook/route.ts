import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWhatsAppReply, getWhatsAppAIConfig, sendWhatsAppText } from "@/lib/whatsapp-ai";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) return new Response(challenge || "", { status: 200 });
  return new Response("Doğrulama başarısız", { status: 403 });
}

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(raw).digest("hex")}`;
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) return new Response("Geçersiz imza", { status: 401 });
  const payload = JSON.parse(raw);
  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const contact = payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
  if (!message?.id || message.type !== "text") return NextResponse.json({ received: true });

  try {
    const config = await getWhatsAppAIConfig();
    const phone = String(message.from);
    const conversation = await prisma.whatsAppConversation.upsert({
      where: { phone },
      update: { name: contact?.profile?.name || undefined, lastMessageAt: new Date() },
      create: { phone, name: contact?.profile?.name || null },
    });
    const duplicate = await prisma.whatsAppMessage.findUnique({ where: { externalId: message.id } });
    if (duplicate) return NextResponse.json({ received: true });
    await prisma.whatsAppMessage.create({ data: { conversationId: conversation.id, externalId: message.id, direction: "INBOUND", source: "customer", content: message.text.body } });
    if (!config.enabled || !conversation.botEnabled) return NextResponse.json({ received: true });
    const history = await prisma.whatsAppMessage.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "desc" }, take: 10, select: { direction: true, content: true } });
    const ai = await generateWhatsAppReply({ message: message.text.body, customerName: contact?.profile?.name, history: history.reverse(), config });
    await sendWhatsAppText(phone, ai.reply);
    await prisma.$transaction([
      prisma.whatsAppMessage.create({ data: { conversationId: conversation.id, direction: "OUTBOUND", source: "ai", content: ai.reply, intent: ai.intent } }),
      prisma.whatsAppConversation.update({ where: { id: conversation.id }, data: { leadType: ai.leadType, leadScore: ai.leadScore, status: ai.handoff ? "HUMAN_NEEDED" : "AI_ACTIVE", handoffReason: ai.handoffReason || null, lastMessageAt: new Date() } }),
    ]);
  } catch (error) {
    console.error("[whatsapp-webhook]", error);
  }
  return NextResponse.json({ received: true });
}
