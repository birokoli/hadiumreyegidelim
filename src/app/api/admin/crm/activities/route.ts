import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, type, content, createdBy } = body;

    if (!leadId || !content) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const newActivity = await prisma.crmActivity.create({
      data: {
        leadId,
        type: type || "NOTE",
        content,
        createdBy: createdBy || "Yönetici",
      },
    });

    // Touch lead updatedAt
    await prisma.crmLead.update({
      where: { id: leadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error: any) {
    console.error("CRM Activity POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
