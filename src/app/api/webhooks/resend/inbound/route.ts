import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhooks/verify-signature";

export const dynamic = 'force-dynamic';

/**
 * Resend Inbound Webhook Handler
 * 
 * This endpoint receives inbound emails from Resend when someone replies to
 * the unique reply forwarder addresses (lead_{id}@reply.convertlist.ai).
 * 
 * Resend sends a POST request with the email data when an inbound email is received.
 * Configure this in Resend dashboard:
 * - Domain: convertlist.ai (or your domain)
 * - Inbound Route: reply.convertlist.ai
 * - Forward to: https://your-domain.com/api/webhooks/resend/inbound
 * 
 * Security: Webhook signature is verified using RESEND_WEBHOOK_SECRET
 */

interface ResendInboundEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    size: number;
    content_type: string;
    content?: string;
  }>;
  headers: Record<string, string>;
  created_at: string;
}

export async function POST(req: Request) {
  try {
    // Verify webhook signature (required in production)
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction || process.env.RESEND_WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(req, "resend");
      if (!isValid) {
        console.warn("Invalid webhook signature from Resend");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn("⚠️  Webhook signature verification disabled in development");
    }

    const body: ResendInboundEmail = await req.json();
    
    const { from, to, subject, html, text } = body;

    // Extract the reply forwarder address from the 'to' field
    const replyAddress = to.find((addr) => addr.includes("reply.convertlist.ai"));
    
    if (!replyAddress) {
      return NextResponse.json(
        { error: "No matching reply address found" },
        { status: 400 }
      );
    }

    // Extract lead ID from the reply address (format: lead_{id}@reply.convertlist.ai)
    const leadIdMatch = replyAddress.match(/lead_(.+)@reply\.convertlist\.ai/);
    
    if (!leadIdMatch || !leadIdMatch[1]) {
      return NextResponse.json(
        { error: "Invalid reply address format" },
        { status: 400 }
      );
    }

    const leadId = leadIdMatch[1];

    const { db } = await import("@/lib/db");

    // Find the lead by ID
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        waitlist: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const prevStatus = lead.status;

    // Update lead status and reply forwarder if not already set
    await db.$transaction([
      db.lead.update({
        where: { id: leadId },
        data: {
          status: "REPLIED",
          replyForwarder: replyAddress,
        },
      }),
      db.leadStatusHistory.create({
        data: {
          leadId,
          fromStatus: prevStatus,
          toStatus: "REPLIED",
          changedAt: new Date(body.created_at),
        },
      }),
    ]);

    // Optionally: Send notification to the waitlist owner
    // This could be implemented as an Inngest event to trigger a notification email
    // await inngest.send({ name: 'lead.replied', data: { leadId, from, subject } });

    return NextResponse.json({
      success: true,
      leadId,
      from,
      subject,
    });
  } catch (error) {
    console.error("Resend inbound webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
