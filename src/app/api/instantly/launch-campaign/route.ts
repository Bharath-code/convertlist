import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  launchOutreachCampaign,
  isInstantlyConfigured,
} from "@/lib/instantly/integration";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isInstantlyConfigured()) {
      return NextResponse.json(
        { error: "Instantly.ai not configured" },
        { status: 400 }
      );
    }

    const { waitlistId, leadIds, fromEmail } = await req.json();

    if (!waitlistId || !leadIds || !fromEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns the waitlist
    const waitlist = await db.waitlist.findUnique({
      where: { id: waitlistId },
      include: { user: true },
    });

    if (!waitlist || waitlist.user.clerkId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch leads with their generated outreach
    const leads = await db.lead.findMany({
      where: {
        id: { in: leadIds },
        waitlistId,
      },
    });

    if (leads.length === 0) {
      return NextResponse.json({ error: "No leads found" }, { status: 404 });
    }

    // Convert to Instantly format
    const instantlyLeads = leads.map((lead) => ({
      email: lead.email,
      firstName: lead.name || undefined,
      companyName: lead.company || undefined,
    }));

    // Get sequence steps from the waitlist's sequences
    const sequences = await db.sequence.findMany({
      where: { waitlistId },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    // Use first sequence or create default
    const sequence = sequences[0];
    let emailSteps;

    if (sequence) {
      emailSteps = sequence.steps.map((step) => ({
        subject: step.subject,
        body: step.body,
        delayDays: step.delayDays,
      }));
    } else {
      // Default single-step sequence
      emailSteps = [
        {
          subject: "Quick question",
          body: "Hey, thanks for signing up! Check out our product.",
          delayDays: 0,
        },
      ];
    }

    // Launch campaign
    const result = await launchOutreachCampaign(
      `${waitlist.name} - Outreach`,
      fromEmail,
      instantlyLeads,
      emailSteps
    );

    // Update leads to mark as contacted
    await db.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { status: "CONTACTED" },
    });

    return NextResponse.json({
      success: true,
      campaignId: result.campaignId,
      leadsSent: instantlyLeads.length,
    });
  } catch (error) {
    console.error("Instantly campaign launch error:", error);
    return NextResponse.json(
      { error: "Failed to launch campaign" },
      { status: 500 }
    );
  }
}
