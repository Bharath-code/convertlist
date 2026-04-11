import { inngest } from "@/lib/inngest/client";
import { calculateLaunchReadiness } from "@/lib/launch/readiness";
import { recommendLaunchDate } from "@/lib/ai/launch-date";
import { generateEngagementHeatmap } from "@/lib/launch/engagement-heatmap";
import { analyzeSeasonality } from "@/lib/launch/seasonality";

export const launchDayCommand = inngest.createFunction(
  {
    id: "launch-day-command",
    retries: 3,
    triggers: { event: "waitlists/needs-launch-analysis" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get waitlist and leads
    const waitlist = await step.run("get-waitlist", async () => {
      const { db } = await import("@/lib/db");
      return db.waitlist.findUnique({
        where: { id: waitlistId },
        include: {
          leads: {
            select: {
              status: true,
              score: true,
              segment: true,
              createdAt: true,
            },
          },
        },
      });
    });

    if (!waitlist) {
      return { analyzed: false, reason: "Waitlist not found" };
    }

    const leads = waitlist.leads.map(lead => ({
      ...lead,
      createdAt: lead.createdAt ? new Date(lead.createdAt) : null,
    }));

    // Calculate launch readiness
    const readinessScore = await step.run("calculate-readiness", async () => {
      const totalLeads = leads.length;
      const engagedLeads = leads.filter(l => l.score !== null).length;
      const hotLeads = leads.filter(l => l.segment === 'HOT').length;
      const warmLeads = leads.filter(l => l.segment === 'WARM').length;
      const coldLeads = leads.filter(l => l.segment === 'COLD').length;

      return calculateLaunchReadiness(
        totalLeads,
        engagedLeads,
        hotLeads,
        warmLeads,
        coldLeads
      );
    });

    // Recommend launch date
    const launchDateRecommendation = await step.run("recommend-launch-date", async () => {
      const currentSeason = new Date().toLocaleString('default', { month: 'long' });
      return await recommendLaunchDate(
        readinessScore,
        currentSeason,
        'B2B SaaS'
      );
    });

    // Generate engagement heatmap
    const engagementHeatmap = await step.run("generate-engagement-heatmap", async () => {
      return generateEngagementHeatmap(leads as Array<{ createdAt: Date | null; status: string }>);
    });

    // Analyze seasonality
    const seasonalityData = await step.run("analyze-seasonality", async () => {
      return analyzeSeasonality(leads as Array<{ createdAt: Date | null; status: string }>);
    });

    // Update waitlist with launch analysis
    await step.run("update-waitlist", async () => {
      const { db } = await import("@/lib/db");
      return db.waitlist.update({
        where: { id: waitlistId },
        data: {
          launchReadinessScore: readinessScore.score,
          recommendedLaunchDate: launchDateRecommendation.recommendedDate,
          engagementHeatmap: JSON.stringify(engagementHeatmap),
          seasonalityData: JSON.stringify(seasonalityData),
        } as any,
      });
    });

    return {
      analyzed: true,
      waitlistId,
      readinessScore: readinessScore.score,
      readiness: readinessScore.readiness,
      recommendedLaunchDate: launchDateRecommendation.recommendedDate,
      peakEngagementDay: engagementHeatmap.peakEngagementDay,
    };
  }
);
