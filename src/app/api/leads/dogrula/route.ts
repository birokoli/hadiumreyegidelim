// E-postadaki "Kitapçığı indir" bağlantısı: kodu doğrular ve PDF'e yönlendirir (13 Ekim).
import { NextRequest, NextResponse } from "next/server";
import { getLead, verifyCode, LEAD_FILES } from "@/lib/leads";
import { SITE_URL } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("l") ?? "";
  const code = (req.nextUrl.searchParams.get("k") ?? "").replace(/\D/g, "");
  if (!/^ml_[a-z0-9]+$/.test(leadId) || code.length !== 6) return NextResponse.redirect(SITE_URL);
  const lead = await getLead(leadId);
  const file = lead ? LEAD_FILES[lead.source] : undefined;
  if (!lead || !file) return NextResponse.redirect(SITE_URL);
  const result = await verifyCode(leadId, code);
  if (result === "ok") return NextResponse.redirect(`${SITE_URL}${file.url}`);
  return NextResponse.redirect(`${SITE_URL}${file.page}?kod=${result}#indir`);
}
