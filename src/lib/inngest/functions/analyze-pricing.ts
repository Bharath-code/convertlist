import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { detectWillingnessToPay, calculateAggregateWillingnessToPay } from "@/lib/ai/willingness-to-pay";
import { recommendTiers, getRevenueProjection } from "@/lib/ai/tier-recommendation";
import { generateDiscountStrategy } from "@/lib/ai/discount-strategy";
import { safeDate } from "@/lib/utils/date-validation";

export const analyzePricing = inngest.createFunction(
  {
    id: "analyze-pricing",
    retries: 3,
    triggers: { event: "leads/needs-pricing-analysis" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get all leads with enrichment data
    const leads = await step.run("get-leads", async () => {
      return db.lead.findMany({
        where: { waitlistId },
        select: {
          id: true,
          signupNote: true,
          company: true,
          score: true,
          segment: true,
          createdAt: true,
        },
      });
    });

    // Convert dates with validation and add placeholder enrichment fields
    const leadsForAnalysis = leads.map(lead => ({
      ...lead,
      createdAt: safeDate(lead.createdAt),
      companySize: null, // Will be populated after enrichment migration
      fundingStatus: null, // Will be populated after enrichment migration
    }));

    if (leads.length === 0) {
      return { analyzed: false, reason: "No leads to analyze" };
    }

    // Calculate aggregate willingness to pay
    const aggregateWtp = await step.run("calculate-aggregate-wtp", async () => {
      return await calculateAggregateWillingnessToPay(leadsForAnalysis);
    });

    // Recommend pricing tiers
    const tierRecommendation = await step.run("recommend-tiers", async () => {
      return await recommendTiers(leadsForAnalysis);
    });

    // Generate discount strategy
    const discountStrategy = await step.run("generate-discount-strategy", async () => {
      return await generateDiscountStrategy(leadsForAnalysis);
    });

    // Calculate revenue projection
    const revenueProjection = getRevenueProjection(tierRecommendation.tiers, leadsForAnalysis);

    // Update waitlist with pricing data
    // Note: This requires Prisma migration to add new fields to Waitlist model
    await step.run("update-waitlist", async () => {
      try {
        await db.waitlist.update({
          where: { id: waitlistId },
          data: {
            recommendedPricePoint: aggregateWtp.recommendedPricePoint,
            priceConfidence: aggregateWtp.averageScore,
            willingnessToPayScore: aggregateWtp.averageScore,
            discountStrategy: discountStrategy.recommendedDiscount > 0 
              ? `${discountStrategy.recommendedDiscount}% for ${discountStrategy.targetLeads.length} leads`
              : null,
          } as any,
        });
      } catch (error) {
        console.error("Failed to update waitlist with pricing data (migration needed):", error);
      }
    });

    return {
      analyzed: true,
      recommendedPricePoint: aggregateWtp.recommendedPricePoint,
      willingnessToPayScore: aggregateWtp.averageScore,
      tiers: tierRecommendation.tiers,
      discountStrategy: {
        discount: discountStrategy.recommendedDiscount,
        targetLeadsCount: discountStrategy.targetLeads.length,
        urgency: discountStrategy.urgency,
      },
      revenueProjection,
    };
  }
);
