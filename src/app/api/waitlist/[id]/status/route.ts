import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const waitlist = await db.waitlist.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        totalLeads: true,
        processedLeads: true,
        user: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    if (!waitlist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (waitlist.user.clerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      status: waitlist.status,
      totalLeads: waitlist.totalLeads,
      processedLeads: waitlist.processedLeads,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
