import { z } from "zod";
import { generateStructuredOutput } from "./client";


type Lead = {
  email: string;
  name?: string | null;
  company?: string | null;
  signupNote?: string | null;
  source?: string | null;
  score?: number | null;
  reason?: string | null;
};

type SequenceStep = {
  subject: string;
  body: string;
  delayDays?: number;
};

export async function generateOutreach(
  lead: Lead,
  steps: SequenceStep[]
): Promise<Array<{ subject: string; body: string }>> {

  const results = [];

  for (const step of steps) {
    const prompt = `You are an expert cold email copywriter. Personalize this email template for the given lead.

Lead:
- Name: ${lead.name || "there"}
- Email: ${lead.email}
- Company: ${lead.company || "N/A"}
- Signup note: ${lead.signupNote || "N/A"}
- Source: ${lead.source || "N/A"}

Template:
Subject: ${step.subject}
Body: ${step.body}

Rules:
- Personalize using lead info
- Subject under 50 chars
- Body under 150 words
- Clear CTA
- Natural tone

Return ONLY JSON: {"subject": "...", "body": "..."}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          results.push({ 
            subject: parsed.subject || step.subject, 
            body: parsed.body || step.body 
          });
        } catch (parseError) {
          console.warn(`JSON parse failed for ${lead.email}:`, parseError);
          results.push({ subject: step.subject, body: step.body });
        }
      } else {
        console.warn(`No JSON found in AI response for ${lead.email}`);
        results.push({ subject: step.subject, body: step.body });
      }
    } catch (error) {
      console.error(`AI generation failed for ${lead.email}:`, error);
      results.push({ subject: step.subject, body: step.body });
    }
  }

  return results;
}
