import { NextResponse } from "next/server";
import { requireSeoAdmin } from "@/lib/seo/guard";
import { loadInventory, pickLinkTargets } from "@/lib/geo-blog/inventory";

export async function GET(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") ?? "";
    const inventory = await loadInventory();

    if (topic) {
      const candidates = pickLinkTargets(topic, inventory, 12);
      return NextResponse.json({ candidates, inventory });
    }

    return NextResponse.json({ inventory });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "İç linkler alınamadı." }, { status: 500 });
  }
}
