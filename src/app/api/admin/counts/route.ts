import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadCounts } from "@/lib/leads";

export async function GET() {
  try {
    const [unreadLeads, totalPackages, totalPosts, recentUnread, pool] = await Promise.all([
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
      leadCounts().catch(() => ({ total: 0, fresh: 0 })),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        unreadLeads,
        totalPackages,
        totalPosts,
        newPoolLeads: pool.fresh,
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
