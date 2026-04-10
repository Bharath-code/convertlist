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
- Company: ${company || "N/A"}
- Signup note: "${signupNote || "N/A"}"
- Feature priority: ${featureMapping?.featurePriority || "Dashboard & Analytics"}
- Objection handling: ${objectionHandling?.objectionHandling || "Focus on ROI"}
- Timeline: ${timelinePrediction?.timelinePrediction || "1 week"}

EXAMPLE OF GOOD SCRIPT:
Opening: "Hi Alex! Thanks for joining. I'm excited to show you how our dashboard can help MarketingPro track campaign performance."

Discovery: "Before we dive in, what's your biggest challenge with tracking marketing metrics right now?"

Demo Flow: "Let me show you three key features:
1. Dashboard - See all your campaigns at a glance
2. Analytics - Deep dive into performance data
3. Reports - Export monthly reports for stakeholders"

Objection Handling: "I understand budget is a concern. Our customers typically see 3x ROI within 3 months through improved campaign optimization."

Closing: "Based on your needs, I'd recommend starting with our Starter plan. Would you like me to send over a trial link?"

EXAMPLE OF BAD SCRIPT:
❌ "Hey there! Welcome to our product. It's great and has many features. You should buy it."
❌ Too generic, not personalized, no specific talking points

REQUIREMENTS:
- Personalize the opening with their name/company
- Include 1-2 discovery questions relevant to their stated needs
- Show exactly 2-3 features in priority order
- Address 1 likely objection based on their segment
- Specific next step with timeline
- Keep between 200-500 words
- Use professional but conversational tone

Return ONLY the demo script text (no JSON).`;

    const result = await model.generateContent(prompt);
    const script = result.response.text().trim();

    // Calculate confidence based on data quality
    const confidenceScores = [
      featureMapping?.confidence || 0,
      objectionHandling?.confidence || 0,
      timelinePrediction?.confidence || 0,
    ].filter(c => c > 0); // Filter out zeros
    const avgConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0.5;

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
