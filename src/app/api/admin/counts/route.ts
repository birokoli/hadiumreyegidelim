import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [unreadLeads, totalPackages, totalPosts, recentUnread] = await Promise.all([
      prisma.contactRequest.count({ where: { status: "UNREAD" } }),
      prisma.package.count({ where: { published: true } }),
      prisma.post.count({ where: { published: true } }),
      prisma.contactRequest.findMany({
        where: { status: "UNREAD" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          package: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        unreadLeads,
        totalPackages,
        totalPosts,
      },
      recentUnread,
    });
  } catch (error) {
    console.error("Failed to fetch admin counts", error);
    return NextResponse.json(
      { success: false, counts: { unreadLeads: 0, totalPackages: 0, totalPosts: 0 }, recentUnread: [] },
      { status: 500 }
    );
  }
}
