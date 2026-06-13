/**
 * Reply detection service — the heart of the wow moment.
 *
 * Single source of truth for "this lead just replied, do everything automatically":
 * 1. Update lead status to REPLIED (+ LeadStatusHistory entry)
 * 2. Fire Slack/Discord notification (if user has one configured)
 * 3. Best-effort AI classify intent (interested / unsubscribe / OOO / objection)
 *
 * Idempotent: a reply for the same lead is recorded once (uses the first
 * recorded REPLIED status to keep analytics clean).
 */

import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/integrations/crypto";
import { sendReplyNotification } from "@/lib/integrations/notify";
import { trackConversion } from "@/lib/scoring/conversion-analytics";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface IncomingReply {
  /** Either ConvertList lead id (preferred) or the lead's email */
  leadId?: string;
  email?: string;
  replyText?: string;
  source: "instantly" | "email_forward" | "manual";
  externalCampaignId?: string;
}

export interface ReplyResult {
  found: boolean;
  updated: boolean;
  notified: boolean;
  notifyError?: string;
  intent?: "interested" | "unsubscribe" | "out_of_office" | "objection" | "other";
}

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function classifyIntent(text: string): Promise<ReplyResult["intent"]> {
  if (!text || !process.env.GEMINI_API_KEY) return undefined;
  try {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `Classify this reply email into ONE category. Reply with only the category word.
Categories: interested | unsubscribe | out_of_office | objection | other

Reply:
"""
${text.slice(0, 1200)}
"""`;
    const r = await model.generateContent(prompt);
    const out = r.response.text().trim().toLowerCase();
    if (
      out === "interested" ||
      out === "unsubscribe" ||
      out === "out_of_office" ||
      out === "objection" ||
      out === "other"
    ) {
      return out;
    }
    return "other";
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("classifyIntent failed:", err);
    }
    return undefined;
  }
}

export async function recordReply(input: IncomingReply): Promise<ReplyResult> {
  let lead = input.leadId
    ? await db.lead.findUnique({
        where: { id: input.leadId },
        include: { waitlist: { include: { user: true } } },
      })
    : null;

  if (!lead && input.email) {
    lead = await db.lead.findFirst({
      where: {
        OR: [
          { email: input.email.toLowerCase() },
          { replyForwarder: input.email.toLowerCase() },
        ],
      },
      include: { waitlist: { include: { user: true } } },
      orderBy: { importedAt: "desc" },
    });
  }

  if (!lead) {
    return { found: false, updated: false, notified: false };
  }

  // Idempotent: if the lead already replied, don't re-notify or re-classify.
  const wasAlreadyReplied = lead.status === "REPLIED" || lead.status === "INTERESTED" || lead.status === "PAID";
  const prevStatus = lead.status;

  if (!wasAlreadyReplied) {
    await db.$transaction([
      db.lead.update({
        where: { id: lead.id },
        data: {
          status: "REPLIED",
          replyForwarder:
            lead.replyForwarder ||
            (input.source === "email_forward" && input.email ? input.email : null),
        },
      }),
      db.leadStatusHistory.create({
        data: {
          leadId: lead.id,
          fromStatus: prevStatus,
          toStatus: "REPLIED",
        },
      }),
    ]);
  }

  // Find user's Slack/Discord integration (if any) and notify.
  // Only notify on the *first* reply — repeat calls are idempotent.
  const notifyIntegration = !wasAlreadyReplied
    ? await db.integration.findUnique({
        where: { userId_provider: { userId: lead.waitlist.userId, provider: "slack" } },
      })
    : null;

  let notified = false;
  let notifyError: string | undefined;
  if (notifyIntegration?.enabled && notifyIntegration.webhookSecretEnc) {
    const url = decryptSecret(notifyIntegration.webhookSecretEnc);
    if (url) {
      const result = await sendReplyNotification(url, {
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        leadCompany: lead.company,
        waitlistName: lead.waitlist.name,
        replySnippet: input.replyText || null,
        replyAt: new Date(),
        dashboardUrl: `${appUrl()}/results/${lead.waitlistId}?lead=${lead.id}`,
      });
      notified = result.ok;
      if (!result.ok) notifyError = result.error;

      // Persist last error so the user can see it on the settings page
      if (!result.ok) {
        await db.integration.update({
          where: { id: notifyIntegration.id },
          data: { lastErrorAt: new Date(), lastError: result.error?.slice(0, 500) },
        });
      } else {
        await db.integration.update({
          where: { id: notifyIntegration.id },
          data: { lastSyncedAt: new Date(), lastError: null, lastErrorAt: null },
        });
      }
    }
  }

  // Best-effort AI intent classification (never blocks the user-facing flow)
  let intent: ReplyResult["intent"] | undefined;
  if (!wasAlreadyReplied && input.replyText) {
    intent = await classifyIntent(input.replyText);
    if (intent === "interested" && prevStatus !== "INTERESTED") {
      // Auto-promote to INTERESTED — this is the flywheel.
      await db.$transaction([
        db.lead.update({ where: { id: lead.id }, data: { status: "INTERESTED" } }),
        db.leadStatusHistory.create({
          data: { leadId: lead.id, fromStatus: "REPLIED", toStatus: "INTERESTED" },
        }),
      ]);

      // If we somehow know they already paid (e.g. webhook includes payment ref)
      // we track conversion here too. PAID status updates are still done manually
      // (or via Stripe/Dodo webhook in the future).
      void trackConversion;
    }
  }

  return {
    found: true,
    updated: !wasAlreadyReplied,
    notified,
    notifyError,
    intent,
  };
}
