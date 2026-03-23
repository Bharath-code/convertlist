import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ plan: "FREE", used: 0 });
    }

    const used = await db.lead.count({
      where: { waitlist: { userId: user.id } },
    });

    return NextResponse.json({ plan: user.plan, used });
  } catch {
    return NextResponse.json({ plan: "FREE", used: 0 });
  }
}
