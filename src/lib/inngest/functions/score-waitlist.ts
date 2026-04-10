import { inngest } from "@/lib/inngest/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import { generateReplyAddress } from "@/lib/email/reply-address";
import { getLearnedWeights, trackLeadScored } from "@/lib/scoring/conversion-analytics";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const scoreWaitlist = inngest.createFunction(
  {
    id: "score-waitlist",
    retries: 3,
    triggers: { event: "waitlist/created" },
  },
  async ({ event, step }) => {
    const waitlistId = event.data.waitlistId;

    await step.run("update-status-to-processing", async () => {
      await db.waitlist.update({
        where: { id: waitlistId },
        data: { status: "PROCESSING" },
      });
    });

    const totalLeads = await step.run("count-leads", async () => {
      return db.lead.count({ where: { waitlistId, score: null } });
    });

    if (totalLeads === 0) {
      await step.run("complete-empty", async () => {
        await db.waitlist.update({
          where: { id: waitlistId },
          data: { status: "COMPLETED", processedLeads: 0 },
        });
      });
      return { processed: 0 };
    }

    const BATCH_SIZE = 50;
    let processed = 0;

    while (processed < totalLeads) {
      const leads = await step.run(`fetch-batch-${processed / BATCH_SIZE}`, async () => {
        return db.lead.findMany({
          where: { waitlistId, score: null },
          take: BATCH_SIZE,
          skip: processed,
          orderBy: { importedAt: "asc" },
        });
      });

      if (leads.length === 0) break;

      await step.run(`score-batch-${processed / BATCH_SIZE}`, async () => {
        await scoreLeadBatch(leads);
      });

      processed += leads.length;

      await step.run(`update-progress-${processed}`, async () => {
        await db.waitlist.update({
          where: { id: waitlistId },
          data: { processedLeads: processed },
        });
      });
    }

    await step.run("mark-complete", async () => {
      await db.waitlist.update({
        where: { id: waitlistId },
        data: { status: "COMPLETED" },
      });
    });

    // Trigger enrichment after scoring completes
    await step.run("trigger-enrichment", async () => {
      await inngest.send({
        name: "leads/needs-enrichment",
        data: { waitlistId },
      });
    });

    return { processed };
  }
);

interface LeadInput {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  signupNote: string | null;
  source: string | null;
  createdAt: Date | string | null;
  importedAt: Date | string;
}

async function scoreLeadBatch(leads: LeadInput[]) {
  // Get learned weights from conversion analytics
  const learnedWeights = await getLearnedWeights();

  const scored = leads.map((lead) => computeScore(lead, learnedWeights));

  // AI intent classification for signup_notes
  const leadsWithNotes = scored.filter((l) => l.signupNote);
  if (leadsWithNotes.length > 0) {
    try {
      const intentScores = await classifyIntentBatch(leadsWithNotes);
      intentScores.forEach((score, i) => {
        leadsWithNotes[i].intentScore = score;
      });
    } catch (e) {
      // AI classification failed, will use fallback estimation
    }
  }

  // Update all leads with reply addresses and track for analytics
  await Promise.all(
    scored.map(async (lead) => {
      await db.lead.update({
        where: { id: lead.id },
        data: {
          score: lead.totalScore,
          confidence: lead.confidence,
          reason: lead.reason,
          segment: lead.segment,
          replyForwarder: generateReplyAddress(lead.id),
        },
      });

      // Track lead scored for conversion analytics
      await trackLeadScored(lead.id);
    })
  );
}

interface ScoredLead extends LeadInput {
  intentScore?: number;
  totalScore: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  segment: "HOT" | "WARM" | "COLD";
}

function computeScore(lead: LeadInput, weights: import("@/lib/scoring/conversion-analytics").SignalWeights): ScoredLead {
  const reasons: string[] = [];
  let score = 0;
  let confidence: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";

  // Minimum signal logic
  const hasOnlyEmail =
    !lead.name && !lead.company && !lead.signupNote && !lead.source;

  if (hasOnlyEmail) {
    return {
      ...lead,
      totalScore: Math.min(55, 0),
      confidence: "LOW",
      reason: "Only email available",
      segment: "COLD",
    };
  }

  // Domain quality (use learned weights)
  const domainScore = computeDomainScore(lead.email);
  if (domainScore === 20) {
    score += weights.domainCompany;
    reasons.push("company domain");
  } else if (domainScore === 10) {
    score += weights.domainPersonal;
    reasons.push("personal email");
  }

  // Source (use learned weights)
  const sourceScore = computeSourceScore(lead.source);
  if (sourceScore === 15) {
    score += weights.sourceReferral;
    reasons.push("referral");
  } else if (sourceScore === 10) {
    score += 10; // Default for niche community
    reasons.push("niche community");
  }

  // Recency (use learned weights)
  const recencyScore = computeRecencyScore(lead.createdAt || lead.importedAt);
  if (recencyScore === 20) {
    score += weights.recencyRecent;
    reasons.push("recent signup");
  } else if (recencyScore === 15) {
    score += 15; // Default for recent import
    reasons.push("recent import");
  }

  // Intent (use learned weights)
  if (lead.signupNote) {
    const intentScore = (lead as ScoredLead).intentScore ?? estimateIntentScore(lead.signupNote);
    if (intentScore >= 25) {
      score += weights.intentUrgent;
      reasons.push("strong problem description");
    } else if (intentScore >= 15) {
      score += weights.intentSpecific;
      reasons.push("specific use case");
    } else {
      score += intentScore;
    }
  }

  // Confidence based on data completeness
  const dataPoints = [lead.name, lead.company, lead.signupNote, lead.source, lead.createdAt].filter(Boolean).length;
  if (dataPoints >= 4) confidence = "HIGH";
  else if (dataPoints <= 1) confidence = "LOW";

  // Cap at 90
  score = Math.min(score, 90);

  // Segment
  let segment: "HOT" | "WARM" | "COLD";
  if (score >= 60) segment = "HOT";
  else if (score >= 35) segment = "WARM";
  else segment = "COLD";

  // Reason
  const reason = reasons.length > 0 ? reasons.join(" + ") : "Basic profile data";

  return {
    ...lead,
    totalScore: score,
    confidence,
    reason,
    segment,
  };
}

function computeDomainScore(email: string): number {
  const domain = email.split("@")[1]?.toLowerCase() || "";

  const disposableDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
  if (disposableDomains.includes(domain)) return 10;

  const freeDomains = ["gmail.", "yahoo.", "hotmail.", "outlook.", "mail.", "protonmail."];
  if (freeDomains.some((d) => domain.includes(d))) return 10;

  // Company domain (has at least one dot, not a free email)
  if (domain.includes(".") && !domain.includes("gmail") && !domain.includes("yahoo")) return 20;

  return 2; // Unknown/disposable
}

function computeSourceScore(source: string | null): number {
  if (!source) return 5;
  const s = source.toLowerCase();
  if (s.includes("referral")) return 15;
  if (s.includes("community") || s.includes("discord") || s.includes("slack")) return 10;
  if (s.includes("launch") || s.includes("product hunt") || s.includes("indie hacker")) return 7;
  return 5;
}

function computeRecencyScore(date: Date | string | null): number {
  if (!date) return 5;
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 20;
  if (diffDays < 30) return 15;
  if (diffDays < 90) return 10;
  return 5;
}

function estimateIntentScore(note: string): number {
  const lower = note.toLowerCase();
  const urgentKeywords = ["urgent", "asap", "critical", "desperate", "need now", "must have"];
  const specificKeywords = ["for my", "use case", "we want to", "looking to", "building"];
  const vagueKeywords = ["interesting", "cool", "nice", "would be cool", "maybe"];

  if (urgentKeywords.some((k) => lower.includes(k))) return 27;
  if (specificKeywords.some((k) => lower.includes(k))) return 20;
  if (vagueKeywords.some((k) => lower.includes(k))) return 7;
  return 10;
}

async function classifyIntentBatch(leads: ScoredLead[]): Promise<number[]> {
  const prompt = `Analyze these waitlist signup notes and classify intent level:

${leads.map((l, i) => `${i + 1}. "${l.signupNote}"`).join("\n")}

For each signup note, return a number 0-30:
- 25-30: urgent pain (explicit about needing solution now, critical for their work/business)
- 15-24: specific use case (clearly describes what they want to use it for)
- 5-14: vague interest (generic enthusiasm, "interested", "looks cool")
- 0: missing or useless (empty, "subscribed", gibberish)

Return ONLY a JSON array with ${leads.length} numbers, nothing else.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    // Try to extract JSON array
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return parsed.map((v: unknown) => Math.max(0, Math.min(30, Number(v) || 0)));
    }
  } catch (e) {
    // Failed to parse AI response, will use fallback
  }

  // Fallback
  return leads.map((l) => estimateIntentScore(l.signupNote || ""));
}
