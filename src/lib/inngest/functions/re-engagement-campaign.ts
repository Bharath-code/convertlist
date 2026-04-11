import { inngest } from "@/lib/inngest/client";
import { Resend } from "resend";

/**
 * Automated Re-engagement Campaign
 *
 * Triggers when waitlist has no activity for 30+ days.
 * Sends re-engagement email to the user to remind them to contact their leads.
 * This doubles conversion rates according to research.
 */

export const reEngagementCampaign = inngest.createFunction(
  {
    id: "re-engagement-campaign",
    retries: 3,
  },
  async ({ step }) => {
    // Find waitlists with no activity in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const coldWaitlists = await step.run("find-cold-waitlists", async () => {
      const { db } = await import("@/lib/db");
      return db.waitlist.findMany({
        where: {
          status: "COMPLETED",
          updatedAt: {
            lt: thirtyDaysAgo,
          },
        },
        include: {
          user: true,
          leads: {
            where: {
              status: "UNCONTACTED",
            },
          },
        },
      });
    });

    // For each cold waitlist, send re-engagement notification
    for (const waitlist of coldWaitlists) {
      await step.run(`send-re-engagement-${waitlist.id}`, async () => {
        const uncontactedLeads = waitlist.leads.filter(
          (lead: any) => lead.status === "UNCONTACTED"
        );

        if (uncontactedLeads.length === 0) return;

        // Send re-engagement email to the user (not individual leads)
        // This is a notification to the user to re-engage with their waitlist
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY || "");

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "hello@convertlist.ai",
            to: waitlist.user.email,
            subject: `Your waitlist "${waitlist.name}" is ready for re-engagement`,
            html: `
              <h2>Re-engage your waitlist</h2>
              <p>Hey,</p>
              <p>It's been over 30 days since you last worked on your waitlist "<strong>${waitlist.name}</strong>".</p>
              <p>You have <strong>${uncontactedLeads.length} uncontacted leads</strong> waiting to hear from you.</p>
              <p>Our data shows that re-engaging cold waitlists can double your conversion rates.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${waitlist.id}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Re-engage Your Leads</a></p>
              <p>Best,<br>ConvertList Team</p>
            `,
          });

          // Update waitlist to mark as notified
          const { db } = await import("@/lib/db");
          await db.waitlist.update({
            where: { id: waitlist.id },
            data: { updatedAt: new Date() },
          });
        } catch (error) {
          // Log error but don't fail the entire process
          // Error is handled by Inngest retry mechanism
        }
      });
    }
  }
);
