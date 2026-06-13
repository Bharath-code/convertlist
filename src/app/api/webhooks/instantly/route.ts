/**
 * Instantly.ai reply webhook receiver.
 *
 * Instantly sends webhook events for email replies, opens, clicks, bounces.
 * We only act on reply events. The webhook secret (if configured) is used to
 * verify the HMAC signature in the `X-Instantly-Signature` header.
 *
 * Instantly webhook payloads vary by plan — we accept the common shape:
 *   { event_type: "reply_received", campaign_id, lead_email, reply_body, lead_id }
 *
 * If signature verification fails (or no secret is set), we still accept the
 * event in development; in production the secret must be set.
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { recordReply } from "@/lib/integrations/reply-detector";

export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.INSTANTLY_WEBHOOK_SECRET;
  const sig = req.headers.get("x-instantly-signature");

  if (secret) {
    if (!verifySignature(raw, sig, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Don't accept unsigned webhooks in production.
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = raw.length > 0 ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = String(
    body.event_type || body.event || body.type || ""
  ).toLowerCase();

  // Only act on reply events
  if (!eventType.includes("reply")) {
    return NextResponse.json({ ok: true, skipped: eventType || "no_event" });
  }

  const email = String(
    body.lead_email || body.email || body.from || ""
  ).toLowerCase();
  const replyText = typeof body.reply_body === "string" ? body.reply_body : undefined;
  const campaignId = typeof body.campaign_id === "string" ? body.campaign_id : undefined;

  if (!email) {
    return NextResponse.json({ error: "Missing lead email" }, { status: 400 });
  }

  const result = await recordReply({
    email,
    replyText,
    source: "instantly",
    externalCampaignId: campaignId,
  });

  if (!result.found) {
    return NextResponse.json({ ok: true, matched: false }, { status: 202 });
  }

  return NextResponse.json({
    ok: true,
    updated: result.updated,
    notified: result.notified,
    intent: result.intent,
  });
}
