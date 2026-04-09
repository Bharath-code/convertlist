import { db } from "@/lib/db";

/**
 * Conversion Analytics System
 *
 * Tracks actual conversion outcomes across all users to build a proprietary scoring model.
 * This is the real moat - data, not features.
 *
 * Note: This is a simplified version that works with the existing schema.
 * Full implementation with ConversionAnalytics model will be added after database setup.
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

// In-memory storage for conversion data (will be replaced with database after setup)
let conversionData: Record<string, { total: number; converted: number }> = {
  "domain_company": { total: 0, converted: 0 },
  "domain_personal": { total: 0, converted: 0 },
  "intent_urgent": { total: 0, converted: 0 },
  "intent_specific": { total: 0, converted: 0 },
  "source_referral": { total: 0, converted: 0 },
  "recency_recent": { total: 0, converted: 0 },
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
  const lead = await db.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return;

  const signals = extractSignals(lead);

  for (const signal of signals) {
    if (conversionData[signal]) {
      conversionData[signal].total++;
    }
  }
}

/**
 * Track conversion when a lead is marked as PAID
 */
export async function trackConversion(leadId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return;

  const signals = extractSignals(lead);

  for (const signal of signals) {
    if (conversionData[signal]) {
      conversionData[signal].converted++;
    }
  }
}

/**
 * Get learned weights from conversion analytics
 */
export async function getLearnedWeights(): Promise<SignalWeights> {
  const weights: SignalWeights = {
    domainCompany: 20, // Default weights
    domainPersonal: 10,
    intentUrgent: 27,
    intentSpecific: 20,
    sourceReferral: 15,
    recencyRecent: 20,
  };

  // Calculate multipliers based on conversion rates
  const baselineRate = 5; // Baseline 5% conversion rate

  for (const [key, data] of Object.entries(conversionData)) {
    if (data.total < 10) continue; // Only use signals with sufficient data

    const conversionRate = (data.converted / data.total) * 100;
    const multiplier = Math.max(0.5, Math.min(2, conversionRate / baselineRate));

    if (key === "domain_company") {
      weights.domainCompany = Math.round(20 * multiplier);
    } else if (key === "domain_personal") {
      weights.domainPersonal = Math.round(10 * multiplier);
    } else if (key === "intent_urgent") {
      weights.intentUrgent = Math.round(27 * multiplier);
    } else if (key === "intent_specific") {
      weights.intentSpecific = Math.round(20 * multiplier);
    } else if (key === "source_referral") {
      weights.sourceReferral = Math.round(15 * multiplier);
    } else if (key === "recency_recent") {
      weights.recencyRecent = Math.round(20 * multiplier);
    }
  }

  return weights;
}

/**
 * Get conversion benchmarks for display
 */
export async function getConversionBenchmarks(): Promise<ConversionBenchmark[]> {
  const benchmarks: ConversionBenchmark[] = [];

  for (const [key, data] of Object.entries(conversionData)) {
    if (data.total >= 5) {
      benchmarks.push({
        signal: key,
        value: key,
        conversionRate: (data.converted / data.total) * 100,
        sampleSize: data.total,
      });
    }
  }

  return benchmarks.sort((a, b) => b.conversionRate - a.conversionRate);
}
