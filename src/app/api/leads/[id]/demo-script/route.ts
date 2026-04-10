import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDemoScript } from "@/lib/ai/demo-script";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;

    // Fetch lead data
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        signupNote: true,
        score: true,
        segment: true,
        // useCaseCluster: true, // Add after Prisma migration
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Generate demo script
    const result = await generateDemoScript(
      lead.email,
      lead.name,
      lead.company,
      lead.signupNote,
      lead.score,
      lead.segment,
      null // useCaseCluster - add after Prisma migration
    );

    // TODO: Update lead with demo script data after Prisma migration
    // await db.lead.update({
    //   where: { id: leadId },
    //   data: {
    //     demoScript: result.demoScript,
    //   },
    // });

    return NextResponse.json({
      demoScript: result.demoScript,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error("Failed to generate demo script:", error);
    return NextResponse.json(
      { error: "Failed to generate demo script" },
      { status: 500 }
    );
  }
}
