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

    const leads = await db.lead.findMany({
      where: { waitlistId: id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        viralityScore: true,
        sharePropensity: true,
        networkReach: true,
        advocatePotential: true,
      } as any,
    });

    const leadsWithVirality = leads.filter((l: any) => l.viralityScore !== null);

    if (leadsWithVirality.length === 0) {
      return NextResponse.json({
        hasViralityData: false,
        leads: [],
        stats: null,
      });
    }

    const avgViralityScore = leadsWithVirality.reduce((sum: number, l: any) => sum + (l.viralityScore || 0), 0) / leadsWithVirality.length;
    const avgAdvocatePotential = leadsWithVirality.reduce((sum: number, l: any) => sum + (l.advocatePotential || 0), 0) / leadsWithVirality.length;
    const superAdvocates = leadsWithVirality.filter((l: any) => (l.advocatePotential || 0) >= 0.8).length;
    const advocates = leadsWithVirality.filter((l: any) => (l.advocatePotential || 0) >= 0.6).length;

    const stats = {
      avgViralityScore: Math.round(avgViralityScore),
      avgAdvocatePotential: Math.round(avgAdvocatePotential * 100),
      superAdvocates,
      advocates,
      totalAnalyzed: leadsWithVirality.length,
    };

    return NextResponse.json({
      hasViralityData: true,
      leads: leadsWithVirality,
      stats,
    });
  } catch (error) {
    console.error("Error fetching virality data:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch virality data" }, { status: 500 });
  }
}
