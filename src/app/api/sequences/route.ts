import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { waitlistId, name, steps } = body;

    if (!waitlistId || !name || !steps?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const waitlist = await db.waitlist.findUnique({
      where: { id: waitlistId, userId: user.id },
    });
    if (!waitlist) {
      return NextResponse.json({ error: "Waitlist not found" }, { status: 404 });
    }

    const sequence = await db.sequence.create({
      data: {
        waitlistId,
        name,
        steps: {
          create: steps.map(
            (step: { subject: string; body: string; delayDays: number; order: number }, i: number) => ({
              subject: step.subject,
              body: step.body,
              delayDays: step.delayDays ?? 0,
              order: i,
            })
          ),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error("Create sequence error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

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

    const where: Record<string, unknown> = { waitlist: { userId: user.id } };
    if (waitlistId) where.waitlistId = waitlistId;

    const sequences = await db.sequence.findMany({
      where,
      include: { steps: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sequences });
  } catch (error) {
    console.error("Fetch sequences error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
