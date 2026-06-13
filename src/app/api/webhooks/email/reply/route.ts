/**
 * Email-forwarding reply webhook (the original Phase 1 approach).
 *
 * Resend's inbound parse (or any other provider) POSTs to this endpoint when
 * a lead replies to their `lead_<id>@reply.convertlist.ai` forwarder.
 *
 * This route is now a thin shim over `recordReply` so reply detection
 * behaves identically regardless of source.
 */

import { NextResponse } from "next/server";
import { recordReply } from "@/lib/integrations/reply-detector";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lead_id, email, from, text, snippet } = body as {
      lead_id?: string;
      email?: string;
      from?: string;
      text?: string;
      snippet?: string;
    };

    const lookupEmail = (email || from || "").toLowerCase();
    if (!lead_id && !lookupEmail) {
      return NextResponse.json({ error: "Missing lead identifier" }, { status: 400 });
    }

    const result = await recordReply({
      leadId: lead_id,
      email: lookupEmail || undefined,
      replyText: text || snippet,
      source: "email_forward",
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
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
