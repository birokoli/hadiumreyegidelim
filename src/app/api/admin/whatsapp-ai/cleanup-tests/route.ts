import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getAdminSession();
  if (!session || !(session.legacy || session.role === "super_admin")) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  const syntheticNames = [
    "Sistem Testi",
    "Hız Testi",
    "Satış Testi",
    "İtiraz Testi",
    "Canlı Kontrol",
    "Ekran Testi",
    "Tek Kişi Testi",
    "Oda Testi",
    "Tek Rakam Testi",
  ];
  const conversations = await prisma.whatsAppConversation.findMany({
    where: {
      name: { in: syntheticNames },
      OR: [{ phone: { startsWith: "900" } }, { phone: { startsWith: "909" } }],
    },
    select: { id: true },
  });
  const ids = conversations.map((conversation) => conversation.id);
  if (!ids.length) return NextResponse.json({ success: true, conversations: 0, messages: 0 });

  const [messages, deletedConversations] = await prisma.$transaction([
    prisma.whatsAppMessage.deleteMany({ where: { conversationId: { in: ids } } }),
    prisma.whatsAppConversation.deleteMany({ where: { id: { in: ids } } }),
  ]);
  return NextResponse.json({
    success: true,
    conversations: deletedConversations.count,
    messages: messages.count,
  });
}
