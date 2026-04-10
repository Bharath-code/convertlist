import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { detectSharePropensity } from "@/lib/ai/share-propensity";
import { calculateNetworkReach } from "@/lib/enrichment/network-reach";
import { calculateAdvocatePotential, getAdvocateOutreachRecommendation } from "@/lib/ai/advocate-potential";

export const calculateVirality = inngest.createFunction(
  {
    id: "calculate-virality",
    retries: 3,
    triggers: { event: "leads/needs-virality-scoring" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get all leads with enrichment data
    const leads = await step.run("get-leads", async () => {
      return db.lead.findMany({
        where: { waitlistId },
        select: {
          id: true,
          email: true,
          signupNote: true,
          company: true,
        },
      });
    });

    // Add placeholder enrichment fields (will be populated after migration)
    const leadsForVirality = leads.map(lead => ({
      ...lead,
      twitterFollowers: null, // Will be populated after enrichment migration
      githubActivity: null, // Will be populated after enrichment migration
    }));

    if (leads.length === 0) {
      return { analyzed: false, reason: "No leads to analyze" };
    }

    // Process leads in batches
    const BATCH_SIZE = 10;
    let processedCount = 0;

    for (let i = 0; i < leadsForVirality.length; i += BATCH_SIZE) {
      const batch = leadsForVirality.slice(i, i + BATCH_SIZE);

      await step.run(`process-batch-${i / BATCH_SIZE}`, async () => {
        await processViralityBatch(batch);
      });

      processedCount += batch.length;
    }

    // Get aggregate statistics
    // Note: This requires Prisma migration to add virality fields to Lead model
    const viralityStats = await step.run("calculate-stats", async () => {
      try {
        const updatedLeads = await db.lead.findMany({
          where: { waitlistId },
          select: { viralityScore: true, advocatePotential: true } as any,
        });

        const leadsWithVirality = updatedLeads.filter((l: any) => l.viralityScore !== null);

        if (leadsWithVirality.length === 0) {
          return null;
        }

        const avgViralityScore = leadsWithVirality.reduce((sum: number, l: any) => sum + (l.viralityScore || 0), 0) / leadsWithVirality.length;
        const avgAdvocatePotential = leadsWithVirality.reduce((sum: number, l: any) => sum + (l.advocatePotential || 0), 0) / leadsWithVirality.length;
        const superAdvocates = leadsWithVirality.filter((l: any) => (l.advocatePotential || 0) >= 0.8).length;

        return {
          avgViralityScore: Math.round(avgViralityScore * 100), // Convert to 0-100 for display
          avgAdvocatePotential: Math.round(avgAdvocatePotential * 100), // Convert to 0-100 for display
          superAdvocates,
          totalAnalyzed: leadsWithVirality.length,
        };
      } catch (error) {
        console.error("Failed to calculate virality stats (migration needed):", error);
        return null;
      }
    });

    return {
      analyzed: true,
      totalLeads: leadsForVirality.length,
      processedCount,
      stats: viralityStats,
    };
  }
);

async function processViralityBatch(
  leads: Array<{
    id: string;
    email: string;
    signupNote: string | null;
    company: string | null;
    twitterFollowers: number | null;
    githubActivity: number | null;
  }>
) {
  const updatePromises = leads.map(async (lead) => {
    try {
      // Calculate advocate potential (which includes share propensity and network reach)
      const advocateResult = await calculateAdvocatePotential(
        lead.signupNote,
        lead.company,
        lead.email,
        lead.twitterFollowers,
        lead.githubActivity
      );

      // Update lead with virality data
      // Note: This requires Prisma migration to add virality fields to Lead model
      try {
        await db.lead.update({
          where: { id: lead.id },
          data: {
            viralityScore: advocateResult.advocatePotential,
            sharePropensity: advocateResult.sharePropensity,
            networkReach: advocateResult.networkReach,
            advocatePotential: advocateResult.advocatePotential,
          } as any,
        });
      } catch (error) {
        console.error(`Failed to update lead ${lead.id} with virality data (migration needed):`, error);
      }

      console.log(`Virality score calculated for lead ${lead.id}:`, {
        viralityScore: advocateResult.advocatePotential,
        advocateLevel: advocateResult.advocateLevel,
      });
    } catch (error) {
      console.error(`Failed to calculate virality for lead ${lead.id}:`, error);
    }
  });

  await Promise.all(updatePromises);
}
