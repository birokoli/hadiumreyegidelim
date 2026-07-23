import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function isAuthorized() {
  const session = await getAdminSession();
  return Boolean(session && (session.legacy || session.role === "super_admin"));
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  const { conversationId, all } = await request.json().catch(() => ({}));
  if (!all && typeof conversationId !== "string") {
    return NextResponse.json({ error: "Silinecek konuşma belirtilmedi." }, { status: 400 });
  }

  const where = all ? {} : { id: conversationId };
  const conversations = await prisma.whatsAppConversation.findMany({
    where,
    select: { id: true },
  });
  const ids = conversations.map((conversation) => conversation.id);
  if (!ids.length) {
    return NextResponse.json({ success: true, conversations: 0, messages: 0 });
  }

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
