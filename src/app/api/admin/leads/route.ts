// Müşteri havuzu admin API'si: liste, CSV, durum.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listLeads, setLeadStatus, LEAD_SOURCES } from "@/lib/leads";

export const dynamic = "force-dynamic";

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const source = req.nextUrl.searchParams.get("source") || undefined;
  const leads = await listLeads(source);
  if (req.nextUrl.searchParams.get("format") === "csv") {
    const rows = [["Tarih", "Ad", "E-posta", "E-posta doğrulandı", "Telefon", "Kaynak", "Ticari ileti izni", "Reklam kaynağı", "Durum", "Not"]];
    for (const l of leads) rows.push([new Date(l.createdAt).toISOString().slice(0, 16).replace("T", " "), l.name, l.email ?? "", l.email ? (l.emailVerified ? "evet" : "hayır") : "", l.phone ?? "", LEAD_SOURCES[l.source] ?? l.source, l.marketingConsent ? "evet" : "hayır", l.utm ?? "", l.status, l.note ?? ""]);
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="musteri-havuzu.csv"` } });
  }
  return NextResponse.json({ leads, sources: LEAD_SOURCES });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.id || !["new", "contacted", "customer", "not_interested"].includes(b.status)) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  await setLeadStatus(b.id, b.status, b.note);
  return NextResponse.json({ ok: true });
}
