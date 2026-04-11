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
        recommendedPricePoint: true,
        priceConfidence: true,
        willingnessToPayScore: true,
        discountStrategy: true,
      } as any,
    });

    if (!waitlist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if ((waitlist as any).userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      recommendedPricePoint: (waitlist as any).recommendedPricePoint,
      priceConfidence: (waitlist as any).priceConfidence,
      willingnessToPayScore: (waitlist as any).willingnessToPayScore,
      discountStrategy: (waitlist as any).discountStrategy,
    });
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch pricing data" }, { status: 500 });
  }
}
