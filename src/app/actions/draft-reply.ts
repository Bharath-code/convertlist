/**
 * AI-drafted reply to a hot lead.
 *
 * Given the original outreach + the lead's reply + the waitlist context,
 * generate a 2-3 sentence follow-up that:
 *   - acknowledges their reply
 *   - moves the conversation forward (asks for the meeting, offers a slot, etc.)
 *   - matches the lead's tone
 *
 * The user must ALWAYS approve before sending. The result is just a draft
 * (returned, not persisted) — the user copies it to their email tool.
 */

"use server";

import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { checkAndRecord } from "@/lib/usage/limits";

const inputSchema = z.object({
  leadId: z.string().min(1),
  replyText: z.string().min(1).max(4000),
  tone: z.enum(["casual", "professional", "curious"]).default("professional"),
});

export interface DraftResult {
  ok: boolean;
  draft?: string;
  intent?: "interested" | "unsubscribe" | "out_of_office" | "objection" | "other";
  error?: string;
}

export async function draftReplyToLead(rawInput: unknown): Promise<DraftResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { ok: false, error: "Unauthorized" };

  const parsed = inputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { leadId, replyText, tone } = parsed.data;

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return { ok: false, error: "User not found" };

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { waitlist: { include: { user: true } } },
  });
  if (!lead || lead.waitlist.userId !== user.id) {
    return { ok: false, error: "Lead not found" };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { ok: false, error: "AI not configured" };
  }

  // Budget gate
  const quota = await checkAndRecord(user.id, "ai_tokens_in", 500);
  if (!quota.allowed) {
    return { ok: false, error: "AI token budget reached for this month" };
  }

  // Re-classify intent inline so the caller doesn't have to chain
  const intent = await classifyIntent(replyText);

  const leadName = lead.name?.split(" ")[0] || "there";
  const company = lead.company ? ` (${lead.company})` : "";
  const product = lead.waitlist.name;

  const toneHint =
    tone === "casual"
      ? "Be conversational, short sentences, contractions OK. 2-3 sentences max."
      : tone === "curious"
        ? "Ask a thoughtful follow-up question. Show you're listening. 2-3 sentences max."
        : "Be warm but professional. 2-3 sentences max. End with a clear next step.";

  const prompt = `You are a founder replying to a waitlist sign-up who just responded to your cold outreach email.

Product they're interested in: ${product}
Their name: ${leadName}${company}
Their reply:
"""
${replyText.slice(0, 1500)}
"""

${toneHint}

Constraints:
- Reference something specific from their reply.
- Do NOT introduce yourself again.
- Do NOT sound like a template.
- Do NOT pitch features — just move the conversation forward.
- End with a single, specific next step (e.g. a time slot, a yes/no question, a link to book).

Write the reply body only — no subject line, no greeting signature.`;

  try {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const draft = result.response.text().trim();

    // Rough output-token tracking
    const outTokens = Math.ceil(draft.length / 4);
    await checkAndRecord(user.id, "ai_tokens_out", outTokens);

    return { ok: true, draft, intent };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "AI generation failed",
    };
  }
}

async function classifyIntent(
  text: string
): Promise<NonNullable<DraftResult["intent"]>> {
  try {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
  } catch {
    return "other";
  }
}
