import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { ensureWhatsAppAITables, getWhatsAppAIConfig, parseWhatsAppAIConfig, WHATSAPP_AI_SETTING_KEY, WHATSAPP_BOT_STATUS_SETTING_KEY } from "@/lib/whatsapp-ai";

async function authorized() {
  const session = await getAdminSession();
  return Boolean(session && (session.legacy || session.role === "super_admin" || session.permissions.includes("marketing")));
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  await ensureWhatsAppAITables();
  const [config, conversations, totalMessages, aiMessages, handoffCount, botStatusSetting] = await Promise.all([
    getWhatsAppAIConfig(),
    prisma.whatsAppConversation.findMany({ orderBy: { lastMessageAt: "desc" }, take: 50, include: { messages: { orderBy: { createdAt: "asc" }, take: 30 } } }),
    prisma.whatsAppMessage.count(),
    prisma.whatsAppMessage.count({ where: { source: "ai" } }),
    prisma.whatsAppConversation.count({ where: { status: "HUMAN_NEEDED" } }),
    prisma.setting.findUnique({ where: { key: WHATSAPP_BOT_STATUS_SETTING_KEY } }),
  ]);
  let bot = { status: "YEREL_SERVİS_BEKLENİYOR", qr: null as string | null, phone: null as string | null, error: null as string | null, lastEventAt: null as string | null };
  try {
    if (botStatusSetting?.value) bot = { ...bot, ...JSON.parse(botStatusSetting.value) };
    if (bot.lastEventAt && Date.now() - new Date(bot.lastEventAt).getTime() > 90_000) bot.status = "YEREL_SERVİS_ÇEVRİMDIŞI";
  } catch {}
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
