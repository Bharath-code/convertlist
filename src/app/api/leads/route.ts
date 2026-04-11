import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const waitlistId = searchParams.get("waitlistId");

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
      take: 100,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
