/**
 * Discount Strategy Service
 * 
 * Suggests targeted discounts for cold leads to convert them.
 */

export interface DiscountStrategyResult {
  recommendedDiscount: number;
  targetLeads: string[];
  reasoning: string;
  confidence: number;
  urgency: "high" | "medium" | "low";
}

/**
 * Generate discount strategy for cold leads
 */
export async function generateDiscountStrategy(
  leads: Array<{
    id: string;
    score: number | null;
    segment: string | null;
    signupNote: string | null;
    company: string | null;
    createdAt: Date | null;
  }>
): Promise<DiscountStrategyResult> {
  if (leads.length === 0) {
    return {
      recommendedDiscount: 0,
      targetLeads: [],
      reasoning: "No leads to analyze",
      confidence: 0,
      urgency: "low",
    };
  }

  try {
    // Identify cold leads
    const coldLeads = leads.filter(l => l.segment === "COLD" || (l.score && l.score < 50));

    if (coldLeads.length === 0) {
      return {
        recommendedDiscount: 0,
        targetLeads: [],
        reasoning: "No cold leads - discount not needed",
        confidence: 1,
        urgency: "low",
      };
    }

    // Analyze cold lead characteristics
    const avgScore = coldLeads.reduce((sum, l) => sum + (l.score || 0), 0) / coldLeads.length;
    const recentSignups = coldLeads.filter(l => {
      if (!l.createdAt) return false;
      const daysSinceSignup = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSignup < 7;
    }).length;

    // Calculate discount based on cold lead quality and recency
    let recommendedDiscount = 0;
    let urgency: "high" | "medium" | "low" = "low";

    if (avgScore < 30 && recentSignups > coldLeads.length * 0.5) {
      // Very cold, recent signups - high urgency discount
      recommendedDiscount = 30;
      urgency = "high";
    } else if (avgScore < 40) {
      // Cold leads - moderate discount
      recommendedDiscount = 20;
      urgency = "medium";
    } else if (avgScore < 50) {
      // Borderline cold - light discount
      recommendedDiscount = 10;
      urgency = "low";
    }

    const targetLeadIds = coldLeads.map(l => l.id);
    const reasoning = generateDiscountReasoning(recommendedDiscount, coldLeads.length, avgScore, recentSignups);
    const confidence = Math.min(leads.length / 30, 1);

    return {
      recommendedDiscount,
      targetLeads: targetLeadIds,
      reasoning,
      confidence,
      urgency,
    };
  } catch (error) {
    console.error("Failed to generate discount strategy:", error);
    return {
      recommendedDiscount: 0,
      targetLeads: [],
      reasoning: "Error generating discount strategy",
      confidence: 0,
      urgency: "low",
    };
  }
}

/**
 * Generate reasoning for discount recommendation
 */
function generateDiscountReasoning(
  discount: number,
  coldLeadCount: number,
  avgScore: number,
  recentSignups: number
): string {
  if (discount === 0) {
    return "Lead quality is sufficient - no discount needed";
  }

  return `${discount}% discount recommended for ${coldLeadCount} cold leads (avg score: ${avgScore.toFixed(0)}). ${recentSignups} recent signups indicate urgency. This should help convert borderline leads without devaluing the product.`;
}

/**
 * Get personalized discount offer for a specific lead
 */
export async function getPersonalizedDiscount(
  lead: {
    score: number | null;
    segment: string | null;
    signupNote: string | null;
    company: string | null;
  }
): Promise<{
  discountPercentage: number;
  expirationDays: number;
  message: string;
}> {
  const score = lead.score || 0;
  const segment = lead.segment || "COLD";

  let discountPercentage = 0;
  let expirationDays = 14;

  if (segment === "HOT" || score >= 70) {
    discountPercentage = 0;
    expirationDays = 7;
  } else if (segment === "WARM" || score >= 50) {
    discountPercentage = 10;
    expirationDays = 14;
  } else if (score >= 30) {
    discountPercentage = 20;
    expirationDays = 21;
  } else {
    discountPercentage = 30;
    expirationDays = 30;
  }

  const message = generateDiscountMessage(discountPercentage, expirationDays, lead.signupNote);

  return {
    discountPercentage,
    expirationDays,
    message,
  };
}

/**
 * Generate personalized discount message
 */
function generateDiscountMessage(discount: number, expirationDays: number, signupNote: string | null): string {
  if (discount === 0) {
    return "We'd love to have you on board! Our standard pricing applies.";
  }

  const urgencyText = expirationDays <= 7 ? "Limited time offer" : "Special offer";
  
  let message = `${urgencyText}: Get ${discount}% off your first month! `;
  
  if (signupNote && signupNote.toLowerCase().includes("budget")) {
    message += "We understand budget constraints - this discount should help you get started.";
  } else {
    message += "Don't miss out on this opportunity to try our product at a reduced price.";
  }

  return message;
}
