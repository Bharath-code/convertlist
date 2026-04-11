import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, sequenceId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { waitlist: { select: { userId: true } } },
    });

    if (!lead || lead.waitlist.userId !== userId) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    let sequence = sequenceId
      ? await db.sequence.findUnique({
          where: { id: sequenceId },
          include: { steps: { orderBy: { order: "asc" } } },
        })
      : null;

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence not found" },
        { status: 404 }
      );
    }

    const step = sequence.steps[0];
    if (!step) {
      return NextResponse.json({ error: "No steps in sequence" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an expert cold email copywriter. Generate a personalized outreach email.

Lead info:
- Name: ${lead.name ?? "there"}
- Email: ${lead.email}
- Company: ${lead.company ?? "N/A"}
- Signup note: ${lead.signupNote ?? "N/A"}
- Source: ${lead.source ?? "N/A"}

Base template:
Subject: ${step.subject}
Body: ${step.body}

Rules:
- Personalize the subject and body using the lead's info
- Keep subject under 50 characters
- Keep body under 150 words
- Include a clear CTA
- Sound natural, not robotic
- If no company, use a generic opener

Return ONLY valid JSON with this exact structure, nothing else:
{"subject": "...", "body": "..."}`;

    let subject = step.subject;
    let body = step.body;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        subject = parsed.subject || subject;
        body = parsed.body || body;
      }
    } catch (e) {
      // AI generation failed, using template fallback
    }

    return NextResponse.json({
      subject,
      body,
      stepIndex: 0,
      sequenceId: sequence.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
