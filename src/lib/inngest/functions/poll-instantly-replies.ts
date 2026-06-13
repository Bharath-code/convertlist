/**
 * Inngest cron: every 10 minutes, poll Instantly for new replies on any
 * campaign the user launched in the last 30 days. This is a safety net for
 * missed webhooks.
 *
 * In production you'd scope this per-tenant, but the Instantly API uses a
 * single workspace key so we process the whole workspace here and rely on
 * `recordReply` to map replies → ConvertList leads.
 */

import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { getCampaignReplies, isInstantlyConfigured } from "@/lib/instantly/client";
import { recordReply } from "@/lib/integrations/reply-detector";

const REPLY_POLL_CRON = "*/10 * * * *"; // every 10 minutes

export const pollInstantlyReplies = inngest.createFunction(
  {
    id: "poll-instantly-replies",
    name: "Poll Instantly for new replies (10 min)",
    retries: 2,
    triggers: [{ cron: REPLY_POLL_CRON }],
  },
  async ({ step }) => {
    if (!isInstantlyConfigured()) {
      return { skipped: "instantly-not-configured" };
    }

    // All OutreachSends with an Instantly campaign id from the last 30 days
    const sends = await step.run("load-sends", async () =>
      db.outreachSend.findMany({
        where: {
          status: "launched",
          instantlyCampaignId: { not: null },
          launchedAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true, instantlyCampaignId: true, launchedAt: true },
      })
    );

    let processed = 0;
    for (const send of sends) {
      if (!send.instantlyCampaignId) continue;
      const since = send.launchedAt ? new Date(send.launchedAt).toISOString() : undefined;
      const replies = await step.run(`fetch-${send.id}`, () =>
        getCampaignReplies(send.instantlyCampaignId as string, since)
      );
      for (const r of replies) {
        await step.run(`record-${send.id}-${r.leadEmail}`, () =>
          recordReply({
            email: r.leadEmail,
            replyText: r.replyTextSnippet,
            source: "instantly",
            externalCampaignId: r.campaignId,
          })
        );
        processed++;
      }
    }

    return { processed, campaigns: sends.length };
  }
);
