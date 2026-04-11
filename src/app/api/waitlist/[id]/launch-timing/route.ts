import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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

    const { db } = await import("@/lib/db");

    const waitlist = await db.waitlist.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        launchReadinessScore: true,
        recommendedLaunchDate: true,
        engagementHeatmap: true,
        seasonalityData: true,
      } as any,
    });

    if (!waitlist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if ((waitlist as any).userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const heatmap = (waitlist as any).engagementHeatmap ? JSON.parse((waitlist as any).engagementHeatmap) : null;
    const seasonality = (waitlist as any).seasonalityData ? JSON.parse((waitlist as any).seasonalityData) : null;

    return NextResponse.json({
      launchReadinessScore: (waitlist as any).launchReadinessScore,
      recommendedLaunchDate: (waitlist as any).recommendedLaunchDate,
      engagementHeatmap: heatmap,
      seasonalityData: seasonality,
    });
  } catch (error) {
    console.error("Error fetching launch timing:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch launch timing data" }, { status: 500 });
  }
}
