import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { generateEngagementHeatmap, getEngagementSummary } from "@/lib/ai/engagement-heatmap";
import { calculateReadinessScore, getLaunchRecommendation } from "@/lib/ai/readiness-score";
import { detectSeasonality, getSeasonalityRecommendation } from "@/lib/ai/seasonality";
import { safeDate } from "@/lib/utils/date-validation";

export const analyzeLaunchTiming = inngest.createFunction(
  {
    id: "analyze-launch-timing",
    retries: 3,
    triggers: { event: "leads/needs-launch-timing-analysis" },
  },
  async ({ event, step }) => {
    const waitlistId = (event.data as { waitlistId: string }).waitlistId;

    // Get all leads for the waitlist
    const leads = await step.run("get-leads", async () => {
      return db.lead.findMany({
        where: { waitlistId },
        select: {
          createdAt: true,
          signupNote: true,
          source: true,
          score: true,
          segment: true,
        },
      });
    });

    // Convert dates from strings to Date objects with validation
    const leadsWithDates = leads.map(lead => ({
      ...lead,
      createdAt: safeDate(lead.createdAt),
    }));

    if (leads.length === 0) {
      return { analyzed: false, reason: "No leads to analyze" };
    }

    // Generate engagement heatmap
    const heatmap = await step.run("generate-heatmap", async () => {
      return await generateEngagementHeatmap(leadsWithDates);
    });

    // Calculate readiness score
    const readinessScore = await step.run("calculate-readiness", async () => {
      return await calculateReadinessScore(leadsWithDates);
    });

    // Detect seasonality
    const seasonality = await step.run("detect-seasonality", async () => {
      return await detectSeasonality(leadsWithDates);
    });

    // Generate recommendations
    const engagementSummary = heatmap ? getEngagementSummary(heatmap) : null;
    const launchRecommendation = getLaunchRecommendation(readinessScore.readinessScore);
    const seasonalityRecommendation = seasonality ? getSeasonalityRecommendation(seasonality) : null;

    // Calculate recommended launch date
    let recommendedLaunchDate: Date | null = null;
    if (seasonalityRecommendation) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(seasonalityRecommendation.recommendedDay);
      const targetHour = seasonalityRecommendation.recommendedHour;
      
      // Find next occurrence of the recommended day at the recommended hour
      const now = new Date();
      const nextOccurrence = new Date(now);
      nextOccurrence.setDate(now.getDate() + ((targetDayIndex + 7 - now.getDay()) % 7));
      nextOccurrence.setHours(targetHour, 0, 0, 0);
      
      if (nextOccurrence <= now) {
        nextOccurrence.setDate(nextOccurrence.getDate() + 7);
      }
      
      recommendedLaunchDate = nextOccurrence;
    }

    // Update waitlist with launch timing data
    // Note: This requires Prisma migration to add new fields to Waitlist model
    await step.run("update-waitlist", async () => {
      try {
        await db.waitlist.update({
          where: { id: waitlistId },
          data: {
            launchReadinessScore: readinessScore.readinessScore,
            recommendedLaunchDate,
            engagementHeatmap: heatmap ? JSON.stringify(heatmap) : null,
            seasonalityData: seasonality ? JSON.stringify(seasonality) : null,
          } as any,
        });
      } catch (error) {
        console.error("Failed to update waitlist with launch timing data (migration needed):", error);
      }
    });

    return {
      analyzed: true,
      readinessScore: readinessScore.readinessScore,
      launchRecommendation: launchRecommendation.action,
      recommendedLaunchDate,
      hotLeadCount: readinessScore.hotLeadCount,
      warmLeadCount: readinessScore.warmLeadCount,
      coldLeadCount: readinessScore.coldLeadCount,
    };
  }
);
