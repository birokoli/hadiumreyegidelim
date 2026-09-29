import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeoAdmin } from "@/lib/seo/guard";

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Yazılar alınamadı." },
      { status: 500 }
    );
  }
}
