import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { 
  detectCompanyRelationships, 
  batchAnalyzeCompanyRelationships 
} from "@/lib/network/company-relationships";
import { analyzeCommunityOverlap } from "@/lib/network/community-overlap";
import { calculateInfluenceScore } from "@/lib/network/influence-score";

export const mapNetwork = inngest.createFunction(
  {
    id: "map-network",
    retries: 3,
    triggers: { event: "leads/needs-network-mapping" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get all leads for the waitlist
    const leads = await step.run("get-leads", async () => {
      return db.lead.findMany({
        where: { waitlistId },
        select: {
          id: true,
          email: true,
          signupNote: true,
          twitterFollowers: true,
          githubActivity: true,
          socialProofScore: true,
        },
      });
    });

    if (leads.length === 0) {
      return { analyzed: false, reason: "No leads to analyze" };
    }

    const emails = leads.map(l => l.email);
    const signupNotes = leads.map(l => l.signupNote).filter((n): n is string => n !== null);

    // Step 1: Analyze company relationships
    const companyRelationshipsMap = await step.run("analyze-company-relationships", async () => {
      const resultMap = await batchAnalyzeCompanyRelationships(emails);
      // Convert Map to plain object for Inngest serialization
      const obj: Record<string, any> = {};
      resultMap.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    });

    // Step 2: Analyze community overlap
    const communityOverlap = await step.run("analyze-community-overlap", async () => {
      return await analyzeCommunityOverlap(signupNotes);
    });

    // Step 3: Calculate influence scores and update each lead
    const influenceScoresMap = await step.run("calculate-influence-scores", async () => {
      // Filter leads that have company analysis to avoid undefined promises
      const leadsWithAnalysis = leads.filter(lead => companyRelationshipsMap[lead.email]);

      const scoresMap: Record<string, number> = {};

      const updatePromises = leadsWithAnalysis.map(async (lead) => {
        const companyAnalysis = companyRelationshipsMap[lead.email]!;

        const influenceScore = calculateInfluenceScore(
          companyAnalysis,
          communityOverlap,
          (lead as any).socialProofScore || undefined,
          (lead as any).twitterFollowers || undefined,
          (lead as any).githubActivity || undefined
        );

        scoresMap[lead.id] = influenceScore.score;

        return db.lead.update({
          where: { id: lead.id },
          data: {
            relatedLeads: companyAnalysis.relationshipCount > 0
              ? JSON.stringify(companyAnalysis.relationships.map((r: any) => r.relatedCompany))
              : null,
            companyRelationships: companyAnalysis.relationshipCount > 0
              ? JSON.stringify(companyAnalysis.relationships)
              : null,
            communityOverlap: communityOverlap.communities.length > 0
              ? JSON.stringify(communityOverlap.communities)
              : null,
            influenceScore: influenceScore.score,
          } as any,
        });
      });

      await Promise.all(updatePromises);
      return scoresMap;
    });

    // Calculate network statistics
    const networkStats = await step.run("calculate-stats", async () => {
      const totalLeads = leads.length;
      const leadsWithRelationships = Object.values(companyRelationshipsMap)
        .filter((a: any) => a.relationshipCount > 0).length;
      const leadsWithCommunities = communityOverlap.communities.length;

      // Reuse cached influence scores instead of recalculating
      const influenceScores = Object.values(influenceScoresMap) as number[];

      const topInfluencers = influenceScores
        .filter(s => s >= 70)
        .sort((a, b) => b - a)
        .slice(0, 5);

      return {
        totalLeads,
        leadsWithRelationships,
        leadsWithCommunities,
        topInfluencers,
        averageInfluenceScore: influenceScores.length > 0
          ? Math.round(influenceScores.reduce((sum, s) => sum + s, 0) / influenceScores.length)
          : 0,
      };
    });

    return {
      analyzed: true,
      leadsAnalyzed: leads.length,
      leadsWithRelationships: networkStats.leadsWithRelationships,
      leadsWithCommunities: networkStats.leadsWithCommunities,
      averageInfluenceScore: networkStats.averageInfluenceScore,
      topInfluencerCount: networkStats.topInfluencers.length,
    };
  }
);
