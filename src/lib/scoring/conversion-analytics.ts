/**
 * Conversion Analytics System
 *
 * Tracks actual conversion outcomes across all users to build a proprietary scoring model.
 * This is the real moat - data, not features.
 *
 * Uses the ConversionAnalytics database model for persistent storage.
 */

export interface SignalWeights {
  domainCompany: number;
  domainPersonal: number;
  intentUrgent: number;
  intentSpecific: number;
  sourceReferral: number;
  recencyRecent: number;
}

export interface ConversionBenchmark {
  signal: string;
  value: string;
  conversionRate: number;
  sampleSize: number;
}

type SignalKey = "domain_company" | "domain_personal" | "intent_urgent" | "intent_specific" | "source_referral" | "recency_recent";

const SIGNAL_MAPPING: Record<string, { type: SignalKey; value: string }> = {
  "domain_company": { type: "domain_company", value: "company" },
  "domain_personal": { type: "domain_personal", value: "personal" },
  "intent_urgent": { type: "intent_urgent", value: "urgent" },
  "intent_specific": { type: "intent_specific", value: "specific" },
  "source_referral": { type: "source_referral", value: "referral" },
  "recency_recent": { type: "recency_recent", value: "recent" },
};

/**
 * Extract signals from a lead for analytics tracking
 */
function extractSignals(lead: { email?: string | null; signupNote?: string | null; source?: string | null; createdAt?: Date | string | null }) {
  const signals: string[] = [];

  // Domain signal
  const domain = lead.email?.split("@")[1]?.toLowerCase() || "";
  if (domain.includes(".") && !domain.includes("gmail") && !domain.includes("yahoo")) {
    signals.push("domain_company");
  } else if (domain.includes("gmail") || domain.includes("yahoo") || domain.includes("outlook")) {
    signals.push("domain_personal");
  }

  // Intent signal (from signup note)
  if (lead.signupNote) {
    const note = lead.signupNote.toLowerCase();
    if (note.includes("urgent") || note.includes("asap") || note.includes("critical")) {
      signals.push("intent_urgent");
    } else if (note.includes("for my") || note.includes("use case") || note.includes("looking to")) {
      signals.push("intent_specific");
    }
  }

  // Source signal
  if (lead.source) {
    const source = lead.source.toLowerCase();
    if (source.includes("referral")) {
      signals.push("source_referral");
    }
  }

  // Recency signal
  if (lead.createdAt) {
    const createdAt = new Date(lead.createdAt);
    const diffDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      signals.push("recency_recent");
    }
  }

  return signals;
}

/**
 * Track when a lead is scored
 */
export async function trackLeadScored(leadId: string) {
  const { db } = await import("@/lib/db");
  const lead = await db.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return;

  const signals = extractSignals(lead);

  for (const signal of signals) {
    const mapping = SIGNAL_MAPPING[signal];
    if (!mapping) continue;

    try {
      await db.conversionAnalytics.upsert({
        where: {
          signalType_signalValue: {
            signalType: mapping.type,
            signalValue: mapping.value,
          },
        },
        update: {
          totalLeads: { increment: 1 },
          lastUpdatedAt: new Date(),
        },
        create: {
          signalType: mapping.type,
          signalValue: mapping.value,
          totalLeads: 1,
          convertedLeads: 0,
          conversionRate: 0,
          sampleSize: 1,
        },
      });
    } catch (error) {
      console.error(`Failed to track lead scored for signal ${signal}:`, error);
    }
  }
}

/**
 * Track conversion when a lead is marked as PAID
 */
export async function trackConversion(leadId: string) {
  const { db } = await import("@/lib/db");
  const lead = await db.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return;

  const signals = extractSignals(lead);

  for (const signal of signals) {
    const mapping = SIGNAL_MAPPING[signal];
    if (!mapping) continue;

    try {
      await db.conversionAnalytics.upsert({
        where: {
          signalType_signalValue: {
            signalType: mapping.type,
            signalValue: mapping.value,
          },
        },
        update: {
          convertedLeads: { increment: 1 },
          lastUpdatedAt: new Date(),
        },
        create: {
          signalType: mapping.type,
          signalValue: mapping.value,
          totalLeads: 1,
          convertedLeads: 1,
          conversionRate: 100,
          sampleSize: 1,
        },
      });
    } catch (error) {
      console.error(`Failed to track conversion for signal ${signal}:`, error);
    }
  }
}

/**
 * Get learned weights from conversion analytics
 */
export async function getLearnedWeights(): Promise<SignalWeights> {
  const { db } = await import("@/lib/db");
  
  const weights: SignalWeights = {
    domainCompany: 20, // Default weights
    domainPersonal: 10,
    intentUrgent: 27,
    intentSpecific: 20,
    sourceReferral: 15,
    recencyRecent: 20,
  };

  try {
    // Fetch all conversion analytics from database
    const analytics = await db.conversionAnalytics.findMany({
      where: {
        sampleSize: { gte: 10 }, // Only use signals with sufficient data
      },
    });

    // Calculate multipliers based on conversion rates
    const baselineRate = 5; // Baseline 5% conversion rate

    for (const record of analytics) {
      if (record.totalLeads < 10) continue;

      const multiplier = Math.max(0.5, Math.min(2, record.conversionRate / baselineRate));

      if (record.signalType === "domain_company") {
        weights.domainCompany = Math.round(20 * multiplier);
      } else if (record.signalType === "domain_personal") {
        weights.domainPersonal = Math.round(10 * multiplier);
      } else if (record.signalType === "intent_urgent") {
        weights.intentUrgent = Math.round(27 * multiplier);
      } else if (record.signalType === "intent_specific") {
        weights.intentSpecific = Math.round(20 * multiplier);
      } else if (record.signalType === "source_referral") {
        weights.sourceReferral = Math.round(15 * multiplier);
      } else if (record.signalType === "recency_recent") {
        weights.recencyRecent = Math.round(20 * multiplier);
      }
    }
  } catch (error) {
    console.error("Failed to fetch conversion analytics:", error);
  }

  return weights;
}

/**
 * Get conversion benchmarks for display
 */
export async function getConversionBenchmarks(): Promise<ConversionBenchmark[]> {
  const { db } = await import("@/lib/db");
  const benchmarks: ConversionBenchmark[] = [];

  try {
    const analytics = await db.conversionAnalytics.findMany({
      where: {
        sampleSize: { gte: 5 },
      },
    });

    for (const record of analytics) {
      benchmarks.push({
        signal: record.signalType,
        value: record.signalValue,
        conversionRate: record.conversionRate,
        sampleSize: record.sampleSize,
      });
    }
  } catch (error) {
    console.error("Failed to fetch conversion benchmarks:", error);
  }

  return benchmarks.sort((a, b) => b.conversionRate - a.conversionRate);
}
