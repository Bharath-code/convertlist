import { inngest } from "@/lib/inngest/client";
import { fingerprintDomain, batchFingerprintLeads } from "@/lib/competitors/fingerprinting";
import { analyzeFeatureGaps } from "@/lib/ai/feature-gap";
import { calculateSwitchingCost, batchCalculateSwitchingCosts } from "@/lib/ai/switching-cost";

export const analyzeCompetitors = inngest.createFunction(
  {
    id: "analyze-competitors",
    retries: 3,
    triggers: { event: "leads/needs-competitor-analysis" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get all leads for the waitlist with enrichment data
    const leads = await step.run("get-leads", async () => {
      const { db } = await import("@/lib/db");
      return db.lead.findMany({
        where: { waitlistId },
        select: {
          id: true,
          email: true,
          signupNote: true,
          company: true,
          companySize: true,
          techStack: true,
        },
      });
    });

    if (leads.length === 0) {
      return { analyzed: false, reason: "No leads to analyze" };
    }

    // Step 1: Domain fingerprinting - detect competitor usage
    const fingerprintResults = await step.run("fingerprint-domains", async () => {
      return await batchFingerprintLeads(
        leads.map(lead => ({
          email: lead.email,
          techStack: (lead as any).techStack ? JSON.parse((lead as any).techStack) : undefined,
        }))
      );
    });

    // Step 2: Analyze feature gaps from signup notes
    const featureGapAnalysis = await step.run("analyze-feature-gaps", async () => {
      const signupNotes = leads
        .map(l => l.signupNote)
        .filter((note): note is string => note !== null && note !== undefined);
      return await analyzeFeatureGaps(signupNotes);
    });

    // Step 3: Calculate switching costs for leads with detected competitors
    const switchingCostAnalyses = await step.run("calculate-switching-costs", async () => {
      const leadsWithCompetitors = leads.filter((_, index) =>
        fingerprintResults[index].competitorIds.length > 0
      );

      return await batchCalculateSwitchingCosts(
        leadsWithCompetitors.map((lead, i) => ({
          competitorId: fingerprintResults[leads.indexOf(lead)].competitorIds[0],
          signupNote: lead.signupNote || undefined,
          companySize: (lead as any).companySize ?? undefined,
        }))
      );
    });

    // Step 4: Update each lead with competitor analysis data
    await step.run("update-leads", async () => {
      // Create a Map for O(1) lookup of switching cost analyses by lead ID
      const leadsWithCompetitors = leads.filter((_, i) => fingerprintResults[i].competitorIds.length > 0);
      const switchingCostMap = new Map(
        leadsWithCompetitors.map((lead, i) => [lead.id, switchingCostAnalyses[i]])
      );

      const updatePromises = leads.map(async (lead, index) => {
        const fingerprint = fingerprintResults[index];

        // Find switching cost analysis for this lead if they have competitors
        let switchingCost = null;
        let switchingCostScore = 0;

        if (fingerprint.competitorIds.length > 0) {
          const analysis = switchingCostMap.get(lead.id);
          if (analysis) {
            switchingCost = JSON.stringify(analysis);
            switchingCostScore = analysis.score;
          }
        }

        const { db } = await import("@/lib/db");
        return db.lead.update({
          where: { id: lead.id },
          data: {
            detectedCompetitors: fingerprint.detectedCompetitors.length > 0 
              ? JSON.stringify(fingerprint.detectedCompetitors) 
              : null,
            competitorFeatures: featureGapAnalysis.gaps.length > 0
              ? JSON.stringify(featureGapAnalysis.gaps.map(g => g.feature))
              : null,
            switchingCost,
            competitorConfidence: fingerprint.confidence > 0 
              ? fingerprint.confidence 
              : null,
          } as any,
        });
      });

      await Promise.all(updatePromises);
    });

    // Calculate competitor penetration statistics
    const competitorStats = await step.run("calculate-stats", async () => {
      const { getCompetitorPenetration } = await import("@/lib/competitors/fingerprinting");
      return getCompetitorPenetration(fingerprintResults);
    });

    return {
      analyzed: true,
      leadsAnalyzed: leads.length,
      leadsWithCompetitors: fingerprintResults.filter(f => f.competitorIds.length > 0).length,
      competitorStats,
      featureGapCount: featureGapAnalysis.gaps.length,
      highPriorityGaps: featureGapAnalysis.topGaps.length,
      averageSwitchingCost: switchingCostAnalyses.length > 0
        ? Math.round(
            switchingCostAnalyses.reduce((sum, a) => sum + a.score, 0) / 
            switchingCostAnalyses.length
          )
        : 0,
    };
  }
);
