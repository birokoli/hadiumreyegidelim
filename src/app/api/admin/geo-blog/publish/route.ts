import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSeoAdmin } from "@/lib/seo/guard";

export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  try {
    const { postId } = await req.json();
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "postId zorunludur." }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { published: true },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);

    return NextResponse.json({ success: true, post: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Yayınlama hatası." }, { status: 500 });
  }
}
