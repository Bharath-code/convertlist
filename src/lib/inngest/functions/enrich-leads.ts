import { inngest } from "@/lib/inngest/client";
import { enrichLinkedIn } from "@/lib/enrichment/linkedin";
import { detectTechStackFromDomain } from "@/lib/enrichment/tech-stack";
import { detectFundingStatus } from "@/lib/enrichment/funding";
import { calculateSocialProof } from "@/lib/enrichment/social-proof";

export const enrichLeads = inngest.createFunction(
  {
    id: "enrich-leads",
    retries: 3,
    triggers: { event: "leads/needs-enrichment" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get leads that need enrichment (have score but no enrichment data)
    // Note: After migration, we can check for enrichment fields
    const leadsToEnrich = await step.run("find-leads-to-enrich", async () => {
      const { db } = await import("@/lib/db");
      return db.lead.findMany({
        where: {
          waitlistId,
          score: { not: null },
          // After migration, check: enrichedAt: null
        },
        select: {
          id: true,
          email: true,
          company: true,
        },
      });
    });

    if (leadsToEnrich.length === 0) {
      return { enriched: 0 };
    }

    // Process in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    let enrichedCount = 0;

    for (let i = 0; i < leadsToEnrich.length; i += BATCH_SIZE) {
      const batch = leadsToEnrich.slice(i, i + BATCH_SIZE);

      await step.run(`enrich-batch-${i / BATCH_SIZE}`, async () => {
        await enrichLeadBatch(batch);
      });

      enrichedCount += batch.length;

      // Update progress
      await step.run(`update-progress-${enrichedCount}`, async () => {
        // Could update waitlist with enrichment progress if needed
      });
    }

    // Trigger clustering after enrichment completes
    await step.run("trigger-clustering", async () => {
      await inngest.send({
        name: "leads/needs-clustering",
        data: { waitlistId },
      });
    });

    return { enriched: enrichedCount };
  }
);

async function enrichLeadBatch(leads: Array<{ id: string; email: string; company: string | null }>) {
  const enrichmentPromises = leads.map(async (lead) => {
    try {
      // Run all enrichment services in parallel with retry logic
      const domain = extractDomain(lead.company);
      const [linkedin, techStack, funding, socialProof] = await Promise.all([
        enrichWithRetry(() => enrichLinkedIn(lead.email)),
        domain ? enrichWithRetry(() => detectTechStackFromDomain(domain)) : Promise.resolve(null),
        lead.company ? enrichWithRetry(() => detectFundingStatus(lead.company || undefined)) : Promise.resolve(null),
        enrichWithRetry(() => calculateSocialProof(lead.email)),
      ]);

      // Calculate overall enrichment confidence
      const confidenceScores = [
        linkedin?.confidence || 0,
        techStack?.confidence || 0,
        funding?.confidence || 0,
        socialProof?.confidence || 0,
      ];
      const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

      // Update lead with enrichment data
      const { db } = await import("@/lib/db");
      await db.lead.update({
        where: { id: lead.id },
        data: {
          linkedinUrl: linkedin?.linkedinUrl || null,
          companySize: linkedin?.companySize || null,
          techStack: techStack ? formatTechStack(techStack) : null,
          fundingStatus: funding?.fundingStatus || null,
          twitterFollowers: socialProof?.twitterFollowers || null,
          githubActivity: socialProof?.githubActivity || null,
          socialProofScore: socialProof?.socialProofScore || null,
          enrichedAt: new Date(),
          enrichmentConfidence: avgConfidence || null,
        } as any,
      });

      console.log(`Enriched lead ${lead.id}:`, {
        linkedin: linkedin?.linkedinUrl,
        techStack: techStack?.detectedStack,
        funding: funding?.fundingStatus,
        socialProof: socialProof?.socialProofScore,
      });
    } catch (error) {
      console.error(`Failed to enrich lead ${lead.id}:`, error);
      // Continue with other leads even if one fails
    }
  });

  await Promise.all(enrichmentPromises);
}

// Retry logic with exponential backoff (E10)
async function enrichWithRetry<T>(
  fn: () => Promise<T | null>,
  maxRetries = 3
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`Enrichment failed after ${maxRetries} retries:`, lastError);
  return null;
}

function extractDomain(company: string | null | undefined): string | null {
  if (!company) return null;
  
  // If it's already a domain
  if (company.includes('.')) {
    return company.replace(/^https?:\/\//, '').split('/')[0];
  }
  
  // If it's a company name, try to guess domain
  // This is a simple heuristic - in production you'd use a more sophisticated approach
  const normalized = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `${normalized}.com`;
}

function formatTechStack(stack: { detectedStack: string[] }): string {
  return stack.detectedStack.join(', ');
}
