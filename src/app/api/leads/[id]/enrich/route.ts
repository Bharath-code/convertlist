import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { enrichLead, isClearbitConfigured } from "@/lib/enrichment/clearbit";

export const dynamic = 'force-dynamic';

type EnrichmentAnswers = {
  urgency: "low" | "medium" | "high";
  budget: "none" | "small" | "significant" | "enterprise";
  role: "founder" | "employee" | "manager" | "other";
  timeline: "exploring" | "soon" | "immediate" | "already_paid";
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, answers } = await req.json();

    if (!leadId || !answers) {
      return NextResponse.json({ error: "leadId and answers required" }, { status: 400 });
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { waitlist: { select: { userId: true } } },
    });

    if (!lead || lead.waitlist.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Try Clearbit enrichment first if configured
    let clearbitData = null;
    if (isClearbitConfigured()) {
      clearbitData = await enrichLead(lead.email);
    }

    // Compute enrichment score from manual answers
    const { newScore, newReason, newConfidence } = computeEnrichmentScore(
      lead.score ?? 0,
      answers,
      clearbitData
    );

    // Update lead with enrichment data
    const updateData: any = {
      score: newScore,
      confidence: newConfidence,
      reason: newReason,
    };

    // Add Clearbit data if available
    if (clearbitData?.company?.name && !lead.company) {
      updateData.company = clearbitData.company.name;
    }
    if (clearbitData?.name?.fullName && !lead.name) {
      updateData.name = clearbitData.name.fullName;
    }

    const updated = await db.lead.update({
      where: { id: leadId },
      data: updateData,
    });

    return NextResponse.json({
      score: updated.score,
      confidence: updated.confidence,
      reason: updated.reason,
      clearbitEnriched: !!clearbitData,
    });
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function computeEnrichmentScore(
  baseScore: number,
  answers: EnrichmentAnswers,
  clearbitData?: any
): {
  newScore: number;
  newReason: string;
  newConfidence: "HIGH" | "MEDIUM" | "LOW";
} {
  let boost = 0;
  const reasons: string[] = [];

  if (answers.urgency === "high") {
    boost += 10;
    reasons.push("high urgency");
  } else if (answers.urgency === "medium") {
    boost += 5;
    reasons.push("medium urgency");
  }

  if (answers.budget === "significant" || answers.budget === "enterprise") {
    boost += 8;
    reasons.push("strong budget");
  } else if (answers.budget === "small") {
    boost += 4;
    reasons.push("some budget");
  }

  if (answers.timeline === "already_paid" || answers.timeline === "immediate") {
    boost += 10;
    reasons.push("ready to buy");
  } else if (answers.timeline === "soon") {
    boost += 5;
    reasons.push("near-term buyer");
  }

  if (answers.role === "founder") {
    boost += 5;
    reasons.push("founder");
  }

  // Add Clearbit-based boosts if available
  if (clearbitData) {
    // Company size boost
    if (clearbitData.company?.size && clearbitData.company.size >= 50) {
      boost += 8;
      reasons.push("mid-size company");
    } else if (clearbitData.company?.size && clearbitData.company.size >= 10) {
      boost += 5;
      reasons.push("small company");
    }

    // Role seniority boost
    if (clearbitData.employment?.seniority === "executive" || clearbitData.employment?.seniority === "director") {
      boost += 7;
      reasons.push("executive role");
    } else if (clearbitData.employment?.seniority === "manager") {
      boost += 4;
      reasons.push("manager role");
    }

    // Industry relevance (tech companies are better fit)
    if (clearbitData.company?.tags?.some((tag: string) => 
      tag.toLowerCase().includes("technology") || 
      tag.toLowerCase().includes("software") ||
      tag.toLowerCase().includes("saas")
    )) {
      boost += 5;
      reasons.push("tech company");
    }
  }

  const newScore = Math.min(90, baseScore + boost);
  const newConfidence: "HIGH" | "MEDIUM" | "LOW" = boost >= 15 ? "HIGH" : boost >= 8 ? "MEDIUM" : "LOW";
  const newReason = reasons.length > 0 ? reasons.join(", ") : "Enrichment data";

  return { newScore, newReason, newConfidence };
}
