import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  getWhatsAppAIConfig,
  WHATSAPP_AI_SETTING_KEY,
  type WhatsAppTrainingExample,
} from "@/lib/whatsapp-ai";

async function authorized() {
  const session = await getAdminSession();
  return Boolean(session && (session.legacy || session.role === "super_admin" || session.permissions.includes("marketing")));
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const customerMessage = String(body.customerMessage || "").trim();
  const idealReply = String(body.idealReply || "").trim();
  const category = String(body.category || "Genel").trim().slice(0, 60);
  if (!customerMessage || !idealReply) {
    return NextResponse.json({ error: "Müşteri mesajı ve ideal cevap gereklidir." }, { status: 400 });
  }

  const config = await getWhatsAppAIConfig();
  const example: WhatsAppTrainingExample = {
    id: crypto.randomUUID(),
    customerMessage: customerMessage.slice(0, 1000),
    idealReply: idealReply.slice(0, 2000),
    category,
    createdAt: new Date().toISOString(),
  };
  config.trainingExamples = [...config.trainingExamples, example].slice(-100);
  await prisma.setting.upsert({
    where: { key: WHATSAPP_AI_SETTING_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: WHATSAPP_AI_SETTING_KEY, value: JSON.stringify(config) },
  });
  return NextResponse.json({ success: true, example, total: config.trainingExamples.length });
}

export async function DELETE(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const config = await getWhatsAppAIConfig();
  config.trainingExamples = config.trainingExamples.filter((item) => item.id !== id);
  await prisma.setting.upsert({
    where: { key: WHATSAPP_AI_SETTING_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: WHATSAPP_AI_SETTING_KEY, value: JSON.stringify(config) },
  });
  return NextResponse.json({ success: true, total: config.trainingExamples.length });
}
