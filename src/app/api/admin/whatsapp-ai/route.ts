import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureWhatsAppAITables, getWhatsAppAIConfig, parseWhatsAppAIConfig, WHATSAPP_AI_SETTING_KEY } from "@/lib/whatsapp-ai";

async function authorized() {
  const session = await getAdminSession();
  return Boolean(session && (session.legacy || session.role === "super_admin" || session.permissions.includes("marketing")));
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  await ensureWhatsAppAITables();
  let bot = { status: "SERVİS_EKSİK", qr: null as string | null, phone: null as string | null, error: null as string | null };
  if (process.env.WHATSAPP_BOT_URL && process.env.WHATSAPP_BOT_TOKEN) {
    try {
      const response = await fetch(`${process.env.WHATSAPP_BOT_URL.replace(/\/$/, "")}/status`, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_BOT_TOKEN}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) bot = await response.json();
      else bot = { ...bot, status: "SERVİS_HATASI", error: `HTTP ${response.status}` };
    } catch (error) {
      bot = { ...bot, status: "SERVİSE_ULAŞILAMIYOR", error: error instanceof Error ? error.message : "Bağlantı hatası" };
    }
  }
  const [config, conversations, totalMessages, aiMessages, handoffCount] = await Promise.all([
    getWhatsAppAIConfig(),
    prisma.whatsAppConversation.findMany({ orderBy: { lastMessageAt: "desc" }, take: 50, include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } }),
    prisma.whatsAppMessage.count(),
    prisma.whatsAppMessage.count({ where: { source: "ai" } }),
    prisma.whatsAppConversation.count({ where: { status: "HUMAN_NEEDED" } }),
  ]);
  return NextResponse.json({
    config,
    conversations,
    stats: { conversations: conversations.length, totalMessages, aiMessages, handoffCount },
    connection: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      whatsapp: bot.status === "BAĞLI",
      model: process.env.GEMINI_WHATSAPP_MODEL || "gemini-2.0-flash",
      bot,
    },
  });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  const config = parseWhatsAppAIConfig(JSON.stringify(await request.json()));
  await prisma.setting.upsert({
    where: { key: WHATSAPP_AI_SETTING_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: WHATSAPP_AI_SETTING_KEY, value: JSON.stringify(config) },
  });
  return NextResponse.json({ success: true, config });
}
