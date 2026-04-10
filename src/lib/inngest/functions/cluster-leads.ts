import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { clusterLead, clusterLeadsBatch } from "@/lib/ai/clustering";
import { detectPainPointTribe, detectPainPointsBatch } from "@/lib/ai/pain-points";
import { findLookalikeGroup, findLookalikeGroupsBatch } from "@/lib/ai/lookalike";

export const clusterLeads = inngest.createFunction(
  {
    id: "cluster-leads",
    retries: 3,
    triggers: { event: "leads/needs-clustering" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get leads that need clustering (have enrichment data but no clustering)
    const leadsToCluster = await step.run("find-leads-to-cluster", async () => {
      return db.lead.findMany({
        where: {
          waitlistId,
          score: { not: null },
          // After migration, check: useCaseCluster: null
        },
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          signupNote: true,
        },
      });
    });

    if (leadsToCluster.length === 0) {
      return { clustered: 0 };
    }

    // Process in batches
    const BATCH_SIZE = 50;
    let clusteredCount = 0;

    for (let i = 0; i < leadsToCluster.length; i += BATCH_SIZE) {
      const batch = leadsToCluster.slice(i, i + BATCH_SIZE);

      await step.run(`cluster-batch-${i / BATCH_SIZE}`, async () => {
        await clusterLeadBatchInternal(batch);
      });

      clusteredCount += batch.length;
    }

    return { clustered: clusteredCount };
  }
);

async function clusterLeadBatchInternal(
  leads: Array<{
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    signupNote: string | null;
  }>
) {
  // Run all clustering services in parallel
  const [clusters, painPoints, lookalikes] = await Promise.all([
    clusterLeadsBatch(leads),
    detectPainPointsBatch(leads),
    findLookalikeGroupsBatch(leads),
  ]);

  // Update leads with clustering data
  const updatePromises = leads.map(async (lead) => {
    const cluster = clusters.get(lead.id);
    const painPoint = painPoints.get(lead.id);
    const lookalike = lookalikes.get(lead.id);

    // Calculate overall cluster confidence
    const confidenceScores = [
      cluster?.confidence || 0,
      painPoint?.confidence || 0,
      lookalike?.confidence || 0,
    ];
    const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

    // TODO: Update lead with clustering data after Prisma migration
    // await db.lead.update({
    //   where: { id: lead.id },
    //   data: {
    //     useCaseCluster: cluster?.useCaseCluster || null,
    //     painPointTribe: painPoint?.painPointTribe || null,
    //     lookalikeGroupId: lookalike?.lookalikeGroupId || null,
    //     clusterConfidence: avgConfidence || null,
    //   },
    // });

    console.log(`Clustered lead ${lead.id}:`, {
      cluster: cluster?.useCaseCluster,
      painPoint: painPoint?.painPointTribe,
      lookalike: lookalike?.lookalikeGroupId,
      confidence: avgConfidence,
    });
  });

  await Promise.all(updatePromises);
}
