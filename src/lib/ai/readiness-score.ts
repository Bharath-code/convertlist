/**
 * Launch Readiness Scoring Service
 * 
 * Calculates launch readiness based on hot lead count, engagement depth, lead quality.
 */

export interface ReadinessScoreResult {
  readinessScore: number;
  hotLeadCount: number;
  warmLeadCount: number;
  coldLeadCount: number;
  averageScore: number;
  engagementDepth: number;
  confidence: number;
  reasoning: string;
}

/**
 * Calculate launch readiness score
 */
export async function calculateReadinessScore(
  leads: Array<{
    score: number | null;
    segment: string | null;
    signupNote: string | null;
    createdAt: Date | null;
  }>
): Promise<ReadinessScoreResult> {
  if (leads.length === 0) {
    return {
      readinessScore: 0,
      hotLeadCount: 0,
      warmLeadCount: 0,
      coldLeadCount: 0,
      averageScore: 0,
      engagementDepth: 0,
      confidence: 0,
      reasoning: "No leads to analyze",
    };
  }

  try {
    // Count by segment
    const hotLeads = leads.filter(l => l.segment === "HOT" || (l.score && l.score >= 70)).length;
    const warmLeads = leads.filter(l => l.segment === "WARM" || (l.score && l.score >= 50 && l.score < 70)).length;
    const coldLeads = leads.filter(l => l.segment === "COLD" || (l.score && l.score < 50)).length;

    // Calculate average score
    const scores = leads.map(l => l.score || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate engagement depth (average note length)
    const notes = leads.map(l => l.signupNote?.length || 0);
    const engagementDepth = notes.reduce((a, b) => a + b, 0) / notes.length;

    // Base readiness score calculation
    let readinessScore = 0;

    // Hot lead contribution (40% weight)
    const hotLeadRatio = hotLeads / leads.length;
    readinessScore += hotLeadRatio * 40;

    // Average score contribution (30% weight)
    readinessScore += (averageScore / 100) * 30;

    // Engagement depth contribution (20% weight)
    const normalizedDepth = Math.min(engagementDepth / 200, 1);
    readinessScore += normalizedDepth * 20;

    // Lead count bonus (10% weight - more leads = more confidence)
    const leadCountBonus = Math.min(leads.length / 100, 1) * 10;
    readinessScore += leadCountBonus;

    // Cap at 100
    readinessScore = Math.min(Math.round(readinessScore), 100);

    // Generate reasoning
    const reasoning = generateReasoning(readinessScore, hotLeads, warmLeads, coldLeads, averageScore, leads.length);

    const confidence = Math.min(leads.length / 50, 1);

    return {
      readinessScore,
      hotLeadCount: hotLeads,
      warmLeadCount: warmLeads,
      coldLeadCount: coldLeads,
      averageScore: Math.round(averageScore),
      engagementDepth: Math.round(engagementDepth),
      confidence,
      reasoning,
    };
  } catch (error) {
    console.error("Failed to calculate readiness score:", error);
    return {
      readinessScore: 0,
      hotLeadCount: 0,
      warmLeadCount: 0,
      coldLeadCount: 0,
      averageScore: 0,
      engagementDepth: 0,
      confidence: 0,
      reasoning: "Error calculating readiness",
    };
  }
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  score: number,
  hotLeads: number,
  warmLeads: number,
  coldLeads: number,
  avgScore: number,
  totalLeads: number
): string {
  if (score >= 80) {
    return `Excellent readiness: ${hotLeads} hot leads ready to buy. Launch now for maximum impact.`;
  } else if (score >= 60) {
    return `Good readiness: ${hotLeads} hot leads and ${warmLeads} warm leads. Consider launching soon or nurturing warm leads first.`;
  } else if (score >= 40) {
    return `Moderate readiness: ${warmLeads} warm leads need nurturing. Focus on engagement before launch.`;
  } else {
    return `Low readiness: ${coldLeads} cold leads. Build more engagement and gather more signups before launching.`;
  }
}

/**
 * Get launch recommendation based on readiness score
 */
export function getLaunchRecommendation(readinessScore: number): {
  action: "Launch Now" | "Wait" | "Nurture";
  reasoning: string;
  suggestedWaitTime?: string;
} {
  if (readinessScore >= 80) {
    return {
      action: "Launch Now",
      reasoning: "High readiness score with strong hot lead count",
    };
  } else if (readinessScore >= 60) {
    return {
      action: "Launch Now",
      reasoning: "Good readiness with solid warm lead base",
    };
  } else if (readinessScore >= 40) {
    return {
      action: "Nurture",
      reasoning: "Moderate readiness - nurture warm leads first",
      suggestedWaitTime: "2-3 weeks",
    };
  } else {
    return {
      action: "Wait",
      reasoning: "Low readiness - build more engagement",
      suggestedWaitTime: "4-6 weeks",
    };
  }
}
