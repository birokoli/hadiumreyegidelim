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
  const bulkExamples = Array.isArray(body.examples) ? body.examples : null;
  if (bulkExamples) {
    const config = await getWhatsAppAIConfig();
    const examples: WhatsAppTrainingExample[] = bulkExamples
      .map((item: unknown) => {
        const row = item as { customerMessage?: unknown; idealReply?: unknown; category?: unknown };
        const customerMessage = String(row.customerMessage || "").trim();
        const idealReply = String(row.idealReply || "").trim();
        if (!customerMessage || !idealReply) return null;
        return {
          id: crypto.randomUUID(),
          customerMessage: customerMessage.slice(0, 1000),
          idealReply: idealReply.slice(0, 2000),
          category: String(row.category || "Toplu eğitim").trim().slice(0, 60),
          createdAt: new Date().toISOString(),
        };
      })
      .filter((item: WhatsAppTrainingExample | null): item is WhatsAppTrainingExample => Boolean(item))
      .slice(0, 100);
    if (!examples.length) return NextResponse.json({ error: "Geçerli müşteri-cevap çifti bulunamadı." }, { status: 400 });
    config.trainingExamples = [...config.trainingExamples, ...examples].slice(-100);
    await prisma.setting.upsert({
      where: { key: WHATSAPP_AI_SETTING_KEY },
      update: { value: JSON.stringify(config) },
      create: { key: WHATSAPP_AI_SETTING_KEY, value: JSON.stringify(config) },
    });
    return NextResponse.json({ success: true, added: examples.length, total: config.trainingExamples.length });
  }

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
