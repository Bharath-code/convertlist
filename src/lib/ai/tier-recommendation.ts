/**
 * Tier Recommendation Service
 * 
 * Recommends pricing tiers based on lead quality distribution.
 */

import { calculateAggregateWillingnessToPay } from "./willingness-to-pay";

export interface TierRecommendationResult {
  tiers: Array<{
    name: string;
    price: string;
    targetSegment: string;
    estimatedConversionRate: number;
    recommendedFeatures: string[];
  }>;
  confidence: number;
  reasoning: string;
}

/**
 * Recommend pricing tiers based on lead quality distribution
 */
export async function recommendTiers(
  leads: Array<{
    signupNote: string | null;
    company: string | null;
    companySize: string | null;
    fundingStatus: string | null;
    score: number | null;
    segment: string | null;
  }>
): Promise<TierRecommendationResult> {
  if (leads.length === 0) {
    return {
      tiers: [],
      confidence: 0,
      reasoning: "No leads to analyze",
    };
  }

  try {
    // Get willingness to pay data
    const wtpData = await calculateAggregateWillingnessToPay(leads);

    // Analyze segment distribution
    const hotLeads = leads.filter(l => l.segment === "HOT" || (l.score && l.score >= 70)).length;
    const warmLeads = leads.filter(l => l.segment === "WARM" || (l.score && l.score >= 50 && l.score < 70)).length;
    const coldLeads = leads.filter(l => l.segment === "COLD" || (l.score && l.score < 50)).length;
    const totalLeads = leads.length;

    // Generate tier recommendations
    const tiers: TierRecommendationResult['tiers'] = [];

    // Starter tier (for cold leads)
    if (coldLeads > 0) {
      tiers.push({
        name: "Starter",
        price: "$19/mo",
        targetSegment: "Cold leads",
        estimatedConversionRate: 0.15,
        recommendedFeatures: ["Basic features", "Email support", "1 user"],
      });
    }

    // Pro tier (for warm leads)
    if (warmLeads > 0) {
      const warmPrice = wtpData.averageScore > 0.6 ? "$49/mo" : "$29/mo";
      tiers.push({
        name: "Pro",
        price: warmPrice,
        targetSegment: "Warm leads",
        estimatedConversionRate: 0.35,
        recommendedFeatures: ["All Starter features", "Priority support", "5 users", "Advanced analytics"],
      });
    }

    // Enterprise tier (for hot leads)
    if (hotLeads > 0) {
      tiers.push({
        name: "Enterprise",
        price: "$99+/mo",
        targetSegment: "Hot leads",
        estimatedConversionRate: 0.5,
        recommendedFeatures: ["All Pro features", "Dedicated support", "Unlimited users", "Custom integrations", "SLA"],
      });
    }

    const confidence = Math.min(leads.length / 50, 1);
    const reasoning = generateTierReasoning(hotLeads, warmLeads, coldLeads, totalLeads, wtpData.averageScore);

    return {
      tiers,
      confidence,
      reasoning,
    };
  } catch (error) {
    console.error("Failed to recommend tiers:", error);
    return {
      tiers: [],
      confidence: 0,
      reasoning: "Error generating tier recommendations",
    };
  }
}

/**
 * Generate reasoning for tier recommendations
 */
function generateTierReasoning(
  hotLeads: number,
  warmLeads: number,
  coldLeads: number,
  totalLeads: number,
  avgWtpScore: number
): string {
  const hotPercent = ((hotLeads / totalLeads) * 100).toFixed(0);
  const warmPercent = ((warmLeads / totalLeads) * 100).toFixed(0);
  const coldPercent = ((coldLeads / totalLeads) * 100).toFixed(0);

  let reasoning = `Based on lead distribution: ${hotPercent}% hot, ${warmPercent}% warm, ${coldPercent}% cold. `;

  if (avgWtpScore > 0.6) {
    reasoning += "High willingness to pay detected - recommend higher pricing tiers.";
  } else if (avgWtpScore > 0.4) {
    reasoning += "Moderate willingness to pay - standard pricing tiers appropriate.";
  } else {
    reasoning += "Lower willingness to pay - consider competitive pricing or discounts.";
  }

  return reasoning;
}

/**
 * Get revenue projection by tier
 */
export function getRevenueProjection(
  tiers: TierRecommendationResult['tiers'],
  leads: Array<{ score: number | null; segment: string | null }>
): {
  tier: string;
  price: string;
  estimatedRevenue: number;
  estimatedConversions: number;
}[] {
  const projections = tiers.map(tier => {
    const targetLeads = leads.filter(l => {
      if (tier.targetSegment === "Hot leads") return l.segment === "HOT" || (l.score && l.score >= 70);
      if (tier.targetSegment === "Warm leads") return l.segment === "WARM" || (l.score && l.score >= 50 && l.score < 70);
      return l.segment === "COLD" || (l.score && l.score < 50);
    });

    const estimatedConversions = Math.round(targetLeads.length * tier.estimatedConversionRate);
    
    // Extract price number, handle "+" suffix and monthly billing
    const priceMatch = tier.price.match(/(\d+)/);
    const priceNum = priceMatch ? parseInt(priceMatch[1]) : 0;
    const isPlus = tier.price.includes('+');
    
    // If price has "+", use a conservative estimate (price + 20%)
    const effectivePrice = isPlus ? Math.round(priceNum * 1.2) : priceNum;
    
    // Revenue is monthly (all prices are /mo), so this is monthly recurring revenue
    const estimatedRevenue = estimatedConversions * effectivePrice;

    return {
      tier: tier.name,
      price: tier.price,
      estimatedRevenue,
      estimatedConversions,
    };
  });

  return projections;
}
