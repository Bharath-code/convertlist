import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const waitlistId = searchParams.get("waitlistId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100 per page

    const { db } = await import("@/lib/db");

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = {
      waitlist: { userId: user.id },
    };
    if (waitlistId) where.waitlistId = waitlistId;

    const leads = await db.lead.findMany({
      where,
      orderBy: { score: "desc" },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = leads.length > limit;
    const items = hasMore ? leads.slice(0, limit) : leads;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      leads: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
