import { NextResponse } from "next/server";
import { keywordResearch } from "@/lib/seo/dataforseo";
import { dfsErrorResponse, requireSeoAdmin } from "@/lib/seo/guard";

export const maxDuration = 60;

export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const { seed, mode } = (await req.json()) as { seed?: string; mode?: "suggestions" | "related" };
  const keyword = seed?.trim().toLocaleLowerCase("tr");
  if (!keyword) return NextResponse.json({ error: "Bir kelime yazın." }, { status: 400 });
  try {
    const { data, cost } = await keywordResearch(keyword, mode === "related" ? "related" : "suggestions");
    return NextResponse.json({ rows: data, cost });
  } catch (e) {
    return dfsErrorResponse(e);
  }
}
