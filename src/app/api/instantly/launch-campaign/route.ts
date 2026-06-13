/**
 * POST /api/instantly/launch-campaign
 *
 * Thin REST shim around the `launchOutreachForWaitlist` server action.
 * Kept for backwards compatibility with existing UI callers; new code
 * should call the server action directly.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { launchOutreachForWaitlist } from "@/app/actions/launch-outreach";

export const dynamic = "force-dynamic";

const inputSchema = z.object({
  waitlistId: z.string().min(1),
  leadIds: z.array(z.string().min(1)).min(1).max(500),
  fromEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const result = await launchOutreachForWaitlist(parsed.data);
    if (!result.ok) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      campaignId: result.campaignId,
      leadsSent: result.leadCount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
