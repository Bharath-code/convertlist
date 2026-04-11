import { inngest } from "@/lib/inngest/client";
import { analyzeCrossProductBehavior } from "@/lib/multi-product/behavior";
import { calculateEarlyAdopterScore } from "@/lib/multi-product/early-adopter";
import { predictLifetimeValue } from "@/lib/ai/lifetime-value";
import { calculateSuperUserScore } from "@/lib/multi-product/super-user";

export const analyzeMultiProduct = inngest.createFunction(
  {
    id: "analyze-multi-product",
    retries: 3,
    triggers: { event: "users/needs-multi-product-analysis" },
  },
  async ({ event, step }) => {
    const userId = (event.data as { userId: string }).userId;

    // Get user's waitlists and leads
    const user = await step.run("get-user", async () => {
      const { db } = await import("@/lib/db");
      return db.user.findUnique({
        where: { id: userId },
        include: {
          waitlists: {
            include: {
              leads: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
    });

    if (!user) {
      return { analyzed: false, reason: "User not found" };
    }

    // Calculate cross-product behavior
    const crossProductBehavior = await step.run("analyze-cross-product-behavior", async () => {
      const productHistory = user.waitlists.map(waitlist => {
        const createdAt = typeof waitlist.createdAt === 'string'
          ? new Date(waitlist.createdAt)
          : waitlist.createdAt;
        const firstLeadCreatedAt = waitlist.leads[0]?.createdAt;
        const firstLeadDate = firstLeadCreatedAt
          ? (typeof firstLeadCreatedAt === 'string' ? new Date(firstLeadCreatedAt) : firstLeadCreatedAt)
          : null;

        // Validate dates
        if (createdAt && isNaN(createdAt.getTime())) {
          return null;
        }
        if (firstLeadDate && isNaN(firstLeadDate.getTime())) {
          return null;
        }

        return {
          productId: waitlist.id,
          productName: waitlist.name,
          signupDate: createdAt as Date,
          timeToConvert: firstLeadDate && createdAt && !isNaN((firstLeadDate as Date).getTime()) && !isNaN((createdAt as Date).getTime())
            ? Math.floor((new Date(firstLeadDate).getTime() - (createdAt as Date).getTime()) / (1000 * 60 * 60))
            : undefined,
          converted: waitlist.leads.some(l => l.status === 'PAID'),
        };
      }).filter(Boolean) as any[];

      const behavior = analyzeCrossProductBehavior(productHistory as any);
      return {
        ...behavior,
        userId,
        productHistory,
      };
    });

    // Calculate early adopter profile
    const earlyAdopterProfile = await step.run("calculate-early-adopter-profile", async () => {
      const signupDelays = user.waitlists.map(waitlist => {
        const firstLead = waitlist.leads[0];
        if (!firstLead || !firstLead.createdAt) return 0;
        
        const waitlistCreatedAt = typeof waitlist.createdAt === 'string'
          ? new Date(waitlist.createdAt)
          : waitlist.createdAt;
        
        const firstLeadCreatedAt = typeof firstLead.createdAt === 'string'
          ? new Date(firstLead.createdAt)
          : firstLead.createdAt;
        
        // Validate dates
        if (!waitlistCreatedAt || isNaN(waitlistCreatedAt.getTime())) return 0;
        if (!firstLeadCreatedAt || isNaN(firstLeadCreatedAt.getTime())) return 0;
        
        return Math.floor((firstLeadCreatedAt.getTime() - waitlistCreatedAt.getTime()) / (1000 * 60 * 60));
      });

      return calculateEarlyAdopterScore(signupDelays, user.waitlists.length);
    });

    // Predict lifetime value
    const lifetimeValuePrediction = await step.run("predict-lifetime-value", async () => {
      return await predictLifetimeValue(
        crossProductBehavior as any,
        earlyAdopterProfile,
        100 // Average revenue per product
      );
    });

    // Calculate super-user score
    const superUserScore = await step.run("calculate-super-user-score", async () => {
      const score = calculateSuperUserScore(
        crossProductBehavior as any,
        earlyAdopterProfile,
        lifetimeValuePrediction
      );
      return {
        ...score,
        userId,
      };
    });

    // Update user with multi-product analysis
    await step.run("update-user", async () => {
      const { db } = await import("@/lib/db");
      return db.user.update({
        where: { id: userId },
        data: {
          productHistory: JSON.stringify(crossProductBehavior.productHistory),
          crossProductBehavior: JSON.stringify(crossProductBehavior),
          superUserScore: superUserScore.superUserScore,
          lifetimeValuePrediction: JSON.stringify(lifetimeValuePrediction),
        } as any,
      });
    });

    return {
      analyzed: true,
      userId,
      superUserScore: superUserScore.superUserScore,
      tier: superUserScore.tier,
      predictedLTV: lifetimeValuePrediction.predictedLTV,
    };
  }
);
