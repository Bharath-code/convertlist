/**
 * Timeline Prediction Service
 * 
 * Predicts purchase timeline based on lead signals (urgency, budget, role).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface TimelinePredictionResult {
  timelinePrediction: string;
  confidence: number;
}

const TIMELINE_OPTIONS = [
  "Immediate (0-7 days)",
  "Soon (1-2 weeks)",
  "This month (2-4 weeks)",
  "Next month (1-2 months)",
  "This quarter (2-3 months)",
  "Later (3+ months)",
];

/**
 * Predict purchase timeline based on lead signals
 */
export async function predictTimeline(
  signupNote: string | null,
  company: string | null,
  score: number | null,
  segment: string | null
): Promise<TimelinePredictionResult | null> {
  if (!signupNote) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a sales expert. Predict when this lead is likely to purchase based on their signals:

${TIMELINE_OPTIONS.join(", ")}

Lead data:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}
- Lead score: ${score || "N/A"}
- Segment: ${segment || "N/A"}

Rules:
- Look for urgency indicators (asap, urgent, need now, etc.)
- Consider lead score and segment
- Return ONLY JSON: {"timelinePrediction": "...", "confidence": 0.0-1.0}
- Confidence should be higher when urgency is clear`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        timelinePrediction: parsed.timelinePrediction,
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      };
    }

    return fallbackTimelinePrediction(signupNote, score, segment);
  } catch (error) {
    console.error("Failed to predict timeline:", error);
    return fallbackTimelinePrediction(signupNote, score, segment);
  }
}

/**
 * Fallback timeline prediction using simple heuristics
 */
function fallbackTimelinePrediction(
  signupNote: string,
  score: number | null,
  segment: string | null
): TimelinePredictionResult {
  const text = signupNote.toLowerCase();
  
  const urgencyMap: Record<string, string> = {
    "urgent": "Immediate (0-7 days)",
    "asap": "Immediate (0-7 days)",
    "need now": "Immediate (0-7 days)",
    "critical": "Immediate (0-7 days)",
    "desperate": "Immediate (0-7 days)",
    "soon": "Soon (1-2 weeks)",
    "this week": "Soon (1-2 weeks)",
    "looking": "This month (2-4 weeks)",
    "interested": "This month (2-4 weeks)",
    "maybe": "This quarter (2-3 months)",
    "later": "Later (3+ months)",
  };

  for (const [keyword, timeline] of Object.entries(urgencyMap)) {
    if (text.includes(keyword)) {
      return { timelinePrediction: timeline, confidence: 0.6 };
    }
  }

  // Score-based fallback
  if (score && score >= 70) {
    return { timelinePrediction: "Soon (1-2 weeks)", confidence: 0.5 };
  } else if (score && score >= 50) {
    return { timelinePrediction: "This month (2-4 weeks)", confidence: 0.5 };
  } else if (segment === "HOT") {
    return { timelinePrediction: "Soon (1-2 weeks)", confidence: 0.5 };
  } else if (segment === "WARM") {
    return { timelinePrediction: "This month (2-4 weeks)", confidence: 0.5 };
  }

  return { timelinePrediction: "This quarter (2-3 months)", confidence: 0.3 };
}
