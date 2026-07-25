import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getWhatsAppAIConfig } from "@/lib/whatsapp-ai";

async function authorized() {
  const session = await getAdminSession();
  return Boolean(session && (session.legacy || session.role === "super_admin" || session.permissions.includes("marketing")));
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });

  const config = await getWhatsAppAIConfig();
  const dataset = config.trainingExamples.map((ex) => ({
    instruction: `Sen ${config.assistantName} isimli samimi ve yetkin Türkçe satış temsilcisisin. Üslup: ${config.tone}`,
    input: ex.customerMessage,
    output: ex.idealReply,
    category: ex.category,
    createdAt: ex.createdAt,
  }));

  return new NextResponse(JSON.stringify(dataset, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ollama_dataset_${Date.now()}.json"`,
    },
  });
}
