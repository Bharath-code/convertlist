/**
 * Demo Script Generation Service
 * 
 * Combines feature mapping, objection handling, and timeline prediction
 * to generate a cohesive demo script for each lead.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapFeatures, getDemoOrder } from "./feature-mapping";
import { detectObjections } from "./objection-handling";
import { predictTimeline } from "./timeline-prediction";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface DemoScriptResult {
  demoScript: string;
  confidence: number;
}

/**
 * Generate a comprehensive demo script for a lead
 */
export async function generateDemoScript(
  email: string,
  name: string | null,
  company: string | null,
  signupNote: string | null,
  score: number | null,
  segment: string | null,
  useCaseCluster: string | null
): Promise<DemoScriptResult> {
  try {
    // Get component analyses
    const [featureMapping, objectionHandling, timelinePrediction] = await Promise.all([
      mapFeatures(signupNote, company, score),
      detectObjections(signupNote, company, score, segment),
      predictTimeline(signupNote, company, score, segment),
    ]);

    // Generate cohesive script using AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an expert sales trainer. Generate a demo script for this lead.

Lead Information:
- Name: ${name || "there"}
- Email: ${email}
- Company: ${company || "N/A"}
- Signup note: "${signupNote || "N/A"}"
- Lead score: ${score || "N/A"}
- Segment: ${segment || "N/A"}
- Use case cluster: ${useCaseCluster || "N/A"}

Analysis Results:
- Feature priority: ${featureMapping?.featurePriority || "N/A"}
- Objection handling: ${objectionHandling?.objectionHandling || "N/A"}
- Timeline prediction: ${timelinePrediction?.timelinePrediction || "N/A"}

Generate a demo script with these sections:
1. Opening (warm, personalized greeting)
2. Discovery (2-3 questions to understand their needs)
3. Demo Flow (prioritize features in order: ${featureMapping?.featurePriority || "general overview"})
4. Objection Handling (${objectionHandling?.objectionHandling || "focus on value and ROI"})
5. Closing (next steps based on timeline: ${timelinePrediction?.timelinePrediction || "follow up in 1 week"})

Rules:
- Keep it conversational and natural
- Make it specific to their use case
- Include specific talking points for each feature
- Keep under 400 words
- Return ONLY the demo script text, no JSON`;

    const result = await model.generateContent(prompt);
    const script = result.response.text().trim();

    // Calculate confidence based on data quality
    const confidenceScores = [
      featureMapping?.confidence || 0,
      objectionHandling?.confidence || 0,
      timelinePrediction?.confidence || 0,
    ];
    const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

    return {
      demoScript: script,
      confidence: avgConfidence,
    };
  } catch (error) {
    console.error(`Failed to generate demo script for ${email}:`, error);
    return fallbackDemoScript(name, company, signupNote, segment);
  }
}

/**
 * Fallback demo script template
 */
function fallbackDemoScript(
  name: string | null,
  company: string | null,
  signupNote: string | null,
  segment: string | null
): DemoScriptResult {
  const script = `Demo Script for ${name || "Lead"}

Opening:
"Hi ${name || "there"}! Thanks for taking the time to chat. I'm excited to show you how our solution can help ${company || "your business"}."

Discovery:
"Before we dive in, I'd love to understand: What's the biggest challenge you're currently facing with ${signupNote?.substring(0, 50) || "your workflow"}? What would success look like for you?"

Demo Flow:
"Let me walk you through the key features that will help you:
1. Dashboard - See your data at a glance
2. Analytics - Track your performance
3. Automation - Save time on repetitive tasks
4. Integrations - Connect with your existing tools"

Objection Handling:
"I understand you might have concerns about timing/budget. Let me show you the ROI other similar companies have seen."

Closing:
"Based on what we've discussed, I think this could be a great fit. Would you be open to a trial? I can follow up in a week to see how it's going."`;

  return {
    demoScript: script,
    confidence: 0.4,
  };
}

/**
 * Generate demo script for a lead by ID
 */
export async function generateDemoScriptForLead(leadId: string): Promise<DemoScriptResult> {
  // This would fetch lead data from the database
  // For now, return a placeholder
  return {
    demoScript: "Demo script will be generated after fetching lead data.",
    confidence: 0,
  };
}
