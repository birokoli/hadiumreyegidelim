import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { generateWhatsAppReply } from "@/lib/whatsapp-ai";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !(session.legacy || session.role === "super_admin" || session.permissions.includes("marketing"))) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const history = Array.isArray(body.history)
      ? body.history.slice(-10).map((item: { direction?: string; content?: string }) => ({
          direction: item.direction === "OUTBOUND" ? "OUTBOUND" : "INBOUND",
          content: String(item.content || "").slice(0, 3500),
        }))
      : [];
    const result = await generateWhatsAppReply({ message: String(body.message || ""), customerName: "Test Müşterisi", history });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Test başarısız" }, { status: 500 });
  }
}
