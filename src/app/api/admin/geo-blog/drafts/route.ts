import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeoAdmin } from "@/lib/seo/guard";

/** Liste için içerik dahil tüm yazılar değil: son 100 yazı ve önizleme alanları */
export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, title: true, slug: true, description: true, content: true, tldr: true, faq: true,
        keywords: true, focusKeyword: true, seoScore: true, references: true, published: true, createdAt: true, updatedAt: true,
      },
    });
    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Yazılar alınamadı." }, { status: 500 });
  }
}
