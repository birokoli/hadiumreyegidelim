import { NextResponse } from "next/server";
import { requireBlogAdmin } from "@/lib/seo/guard";
import { getBlogOpportunities } from "@/lib/geo-blog/opportunities";

export async function GET() {
  const denied = await requireBlogAdmin();
  if (denied) return denied;

  try {
    const opportunities = await getBlogOpportunities();
    return NextResponse.json({ opportunities });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fırsatlar alınamadı." }, { status: 500 });
  }
}
