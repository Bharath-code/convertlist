/**
 * Server action: launch a ConvertList lead batch through Instantly.
 *
 * Persists an `OutreachSend` row keyed by the Instantly `campaign_id` so
 * future reply webhooks (which only carry the Instantly lead email + their
 * campaign id) can be correlated back to a ConvertList lead.
 *
 * Resolves the per-user fromEmail either from the Instantly integration's
 * `config.fromEmail` or from the request payload.
 */

"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/integrations/crypto";
import { launchOutreachCampaign, isInstantlyConfigured } from "@/lib/instantly/client";
import { checkAndRecord } from "@/lib/usage/limits";

const inputSchema = z.object({
  waitlistId: z.string().min(1),
  leadIds: z.array(z.string().min(1)).min(1).max(500),
  fromEmail: z.string().email().optional(),
  campaignName: z.string().max(120).optional(),
});

export interface LaunchResult {
  ok: boolean;
  campaignId?: string;
  leadCount?: number;
  error?: string;
  alreadyConfigured?: boolean;
}

async function getOrCreateDbUser(clerkId: string) {
  const existing = await db.user.findUnique({ where: { clerkId } });
  if (existing) return existing;
  return db.user.create({
    data: { clerkId, email: `${clerkId}@unknown.local` },
  });
}

export async function launchOutreachForWaitlist(rawInput: unknown): Promise<LaunchResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { ok: false, error: "Unauthorized" };

  if (!isInstantlyConfigured()) {
    return { ok: false, error: "Instantly is not configured on this server" };
  }

  const parsed = inputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { waitlistId, leadIds, campaignName } = parsed.data;

  const user = await getOrCreateDbUser(clerkId);
  const waitlist = await db.waitlist.findUnique({
    where: { id: waitlistId },
    include: {
      sequences: { include: { steps: { orderBy: { order: "asc" } } } },
      leads: { where: { id: { in: leadIds } } },
    },
  });

  if (!waitlist || waitlist.userId !== user.id) {
    return { ok: false, error: "Waitlist not found" };
  }

  if (waitlist.leads.length === 0) {
    return { ok: false, error: "No leads found in the requested batch" };
  }

  // Quota gate: each launch counts once against the monthly outreach budget
  const quota = await checkAndRecord(user.id, "outreach_launched", 1);
  if (!quota.allowed) {
    return {
      ok: false,
      error:
        quota.reason === "free_tier_exhausted"
          ? "Outreach sending requires Pro or Launch plan"
          : `Monthly outreach quota reached (${quota.used}/${quota.limit})`,
    };
  }

  // Resolve fromEmail: request > per-user Instantly config > Clerk email
  let fromEmail = parsed.data.fromEmail;
  if (!fromEmail) {
    const instantlyInt = await db.integration.findUnique({
      where: { userId_provider: { userId: user.id, provider: "instantly" } },
    });
    if (instantlyInt?.config) {
      try {
        const cfg = JSON.parse(instantlyInt.config) as { fromEmail?: string };
        if (cfg.fromEmail) fromEmail = cfg.fromEmail;
      } catch {
        /* ignore */
      }
    }
  }
  if (!fromEmail) fromEmail = user.email;

  // Build sequence steps — prefer the waitlist's first sequence; fall back to a single step
  const sequence = waitlist.sequences[0];
  const steps = sequence
    ? sequence.steps.map((s) => ({
        subject: s.subject,
        body: s.body,
        delayDays: s.delayDays,
      }))
    : [
        {
          subject: "Quick question about {{first_name}}",
          body: "Hi {{first_name|default:\"there\"}},\n\nSaw you signed up — wanted to reach out personally. Worth a 5-min chat this week?\n\n— Bharath",
          delayDays: 0,
        },
      ];

  const instantlyLeads = waitlist.leads.map((l) => ({
    email: l.email,
    firstName: l.name?.split(" ")[0] || undefined,
    lastName: l.name?.split(" ").slice(1).join(" ") || undefined,
    companyName: l.company || undefined,
  }));

  const send = await db.outreachSend.create({
    data: {
      userId: user.id,
      waitlistId,
      fromEmail,
      leadCount: instantlyLeads.length,
      status: "pending",
    },
  });

  try {
    const result = await launchOutreachCampaign({
      campaignName: campaignName || `${waitlist.name} — ${new Date().toISOString().slice(0, 10)}`,
      fromEmail,
      leads: instantlyLeads,
      emailSteps: steps,
    });

    await db.$transaction([
      db.outreachSend.update({
        where: { id: send.id },
        data: {
          status: "launched",
          launchedAt: new Date(),
          instantlyCampaignId: result.campaignId,
        },
      }),
      db.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { status: "CONTACTED" },
      }),
      ...waitlist.leads
        .filter((l) => l.status === "UNCONTACTED")
        .map((l) =>
          db.leadStatusHistory.create({
            data: { leadId: l.id, fromStatus: "UNCONTACTED", toStatus: "CONTACTED" },
          })
        ),
    ]);

    return { ok: true, campaignId: result.campaignId, leadCount: result.leadCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.outreachSend.update({
      where: { id: send.id },
      data: { status: "failed", errorMessage: message.slice(0, 500) },
    });
    return { ok: false, error: message };
  }
}

/** Read the user's recent outreach sends (for the connections page). */
export async function listRecentSends(limit = 10) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return [];
  const user = await getOrCreateDbUser(clerkId);
  return db.outreachSend.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
    include: { waitlist: { select: { id: true, name: true } } },
  });
}
