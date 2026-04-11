import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { trackConversion } from "@/lib/scoring/conversion-analytics";

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = [
      "UNCONTACTED",
      "CONTACTED",
      "REPLIED",
      "INTERESTED",
      "PAID",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const lead = await db.lead.findUnique({
      where: { id },
      include: { waitlist: { select: { userId: true } } },
    });

    if (!lead || lead.waitlist.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prevStatus = lead.status;

    await db.$transaction([
      db.lead.update({
        where: { id },
        data: { status },
      }),
      db.leadStatusHistory.create({
        data: {
          leadId: id,
          fromStatus: prevStatus,
          toStatus: status,
        },
      }),
    ]);

    // Track conversion if status changed to PAID
    if (status === "PAID" && prevStatus !== "PAID") {
      await trackConversion(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
