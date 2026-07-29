import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Auto-sync ContactRequests to CrmLeads if not already synced
    const contactRequests = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    for (const req of contactRequests) {
      if (!req.phone) continue;
      const existing = await prisma.crmLead.findFirst({
        where: { phone: req.phone },
      });

      if (!existing) {
        await prisma.crmLead.create({
          data: {
            name: req.name || "Bilinmeyen Müşteri",
            phone: req.phone,
            source: "WEB_FORM",
            preferredPackage: req.package || "Genel Umre Talebi",
            notes: req.message || undefined,
            stage: req.status === "READ" ? "IN_DISCUSSION" : "NEW",
            valueUSD: 1250, // Default base package value
          },
        });
      }
    }

    // Auto-sync Quotations to CrmLeads if not already synced
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    for (const q of quotations) {
      if (!q.customerPhone) continue;
      const existing = await prisma.crmLead.findFirst({
        where: { phone: q.customerPhone },
      });

      // Calculate quotation total value
      const items = await prisma.quotationItem.findMany({ where: { quotationId: q.id } });
      const totalVal = items.reduce((sum, item) => sum + (item.saleTotalUsd || 0), 0);

      if (!existing) {
        await prisma.crmLead.create({
          data: {
            name: q.customerName || "Teklif Müşterisi",
            phone: q.customerPhone,
            email: q.customerEmail || undefined,
            source: "QUOTATION",
            preferredPackage: `Teklif: ${q.quotationNo}`,
            stage: q.status === "accepted" ? "WON" : q.status === "sent" ? "QUOTATION_SENT" : "IN_DISCUSSION",
            valueUSD: totalVal > 0 ? totalVal : 1500,
          },
        });
      }
    }

    const leads = await prisma.crmLead.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error("CRM GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newLead = await prisma.crmLead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        source: body.source || "MANUAL",
        preferredPackage: body.preferredPackage || null,
        stage: body.stage || "NEW",
        valueUSD: body.valueUSD ? parseFloat(body.valueUSD) : 1250,
        notes: body.notes || null,
        assignedTo: body.assignedTo || "Yönetici",
      },
    });

    // Create initial activity log
    await prisma.crmActivity.create({
      data: {
        leadId: newLead.id,
        type: "NOTE",
        content: `Müşteri yeni fırsat olarak CRM sistemine eklendi. (Kaynak: ${newLead.source})`,
      },
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error("CRM POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stage, valueUSD, notes, assignedTo, lostReason } = body;

    const existingLead = await prisma.crmLead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const updatedLead = await prisma.crmLead.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(valueUSD !== undefined && { valueUSD: parseFloat(valueUSD) }),
        ...(notes !== undefined && { notes }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(lostReason !== undefined && { lostReason }),
      },
    });

    // Log stage change if stage changed
    if (stage && stage !== existingLead.stage) {
      const stageLabels: Record<string, string> = {
        NEW: "📥 Yeni Talep",
        IN_DISCUSSION: "📞 Görüşmede",
        QUOTATION_SENT: "📄 Teklif Gönderildi",
        WON: "🎉 Satış Kazanıldı (WON)",
        LOST: "❌ Kaybedildi (LOST)",
      };
      await prisma.crmActivity.create({
        data: {
          leadId: id,
          type: "STAGE_CHANGE",
          content: `Aşama değişti: ${stageLabels[existingLead.stage] || existingLead.stage} ➔ ${stageLabels[stage] || stage}`,
        },
      });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error("CRM PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
