import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lead_id, event, timestamp, email, from } = body;

    let leadId = lead_id;

    const { db } = await import("@/lib/db");

    if (!leadId && email) {
      const lead = await db.lead.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { replyForwarder: email.toLowerCase() },
          ],
        },
        orderBy: { importedAt: "desc" },
      });
      if (lead) leadId = lead.id;
    }

    if (!leadId) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (event === "reply" || event === "click" || from) {
      const prevStatus = lead.status;

      await db.$transaction([
        db.lead.update({
          where: { id: leadId },
          data: {
            status: "REPLIED",
            replyForwarder: lead.replyForwarder || email || null,
          },
        }),
        db.leadStatusHistory.create({
          data: {
            leadId,
            fromStatus: prevStatus,
            toStatus: "REPLIED",
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
