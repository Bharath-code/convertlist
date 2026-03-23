import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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
    const body = await req.json();

    const sequence = await db.sequence.findUnique({
      where: { id },
      include: { waitlist: { select: { userId: true } } },
    });

    if (!sequence || sequence.waitlist.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.sequence.update({
      where: { id },
      data: {
        name: body.name ?? sequence.name,
        steps: body.steps
          ? {
              deleteMany: {},
              create: body.steps.map(
                (step: { subject: string; body: string; delayDays: number; order: number }, i: number) => ({
                  subject: step.subject,
                  body: step.body,
                  delayDays: step.delayDays ?? 0,
                  order: i,
                })
              ),
            }
          : undefined,
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ sequence: updated });
  } catch (error) {
    console.error("Update sequence error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sequence = await db.sequence.findUnique({
      where: { id },
      include: { waitlist: { select: { userId: true } } },
    });

    if (!sequence || sequence.waitlist.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.sequence.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete sequence error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
