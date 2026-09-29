import { NextResponse } from "next/server";
import { requireBlogAdmin } from "@/lib/seo/guard";
import { loadInventory, pickLinkTargets } from "@/lib/geo-blog/inventory";
import { analyzePostLinks, applyPostLinks, bulkFixRehberLinks, bulkStripDisallowedLinks } from "@/lib/geo-blog/links";

export async function GET(req: Request) {
  const denied = await requireBlogAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") ?? "";
    const analyze = searchParams.get("analyze") === "true";
    const postId = searchParams.get("postId") ?? undefined;

    if (analyze) {
      const analyses = await analyzePostLinks(postId);
      return NextResponse.json({ analyses });
    }

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

export async function POST(req: Request) {
  const denied = await requireBlogAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, postId, links } = body;

    if (action === "fix_rehber") {
      if (postId) {
        const result = await applyPostLinks(postId, { fixRehber: true });
        return NextResponse.json(result);
      } else {
        const result = await bulkFixRehberLinks();
        return NextResponse.json({ success: true, ...result });
      }
    }

    if (action === "strip_external") {
      const result = await bulkStripDisallowedLinks();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "apply_suggestions") {
      if (!postId || !Array.isArray(links)) {
        return NextResponse.json({ error: "postId ve links dizisi zorunludur." }, { status: 400 });
      }
      const result = await applyPostLinks(postId, { linksToApply: links });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Geçersiz işlem (action)." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "İşlem başarısız." }, { status: 500 });
  }
}
