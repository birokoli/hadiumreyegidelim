import { NextResponse } from "next/server";
import { publishPost } from "@/lib/geo-blog/publish";
import { requireBlogAdmin } from "@/lib/seo/guard";

export async function POST(req: Request) {
  const denied = await requireBlogAdmin();
  if (denied) return denied;

  try {
    const { postId } = (await req.json().catch(() => ({}))) as { postId?: unknown };
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "postId zorunludur." }, { status: 400 });
    }
    const { post, notes } = await publishPost(postId);
    return NextResponse.json({
      success: true,
      post: { id: post.id, slug: post.slug, title: post.title, published: post.published },
      notes,
      addedToTracked: notes.includes("kelime sıra takibine eklendi"),
      addedToAiVis: notes.includes("soru AI Görünürlük'e eklendi"),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Yayınlama hatası.";
    return NextResponse.json({ error: message }, { status: message === "Yazı bulunamadı." ? 404 : 500 });
  }
}
