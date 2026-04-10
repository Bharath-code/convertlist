/**
 * Pain Point Tribe Detection Service
 * 
 * Extracts pain points from signup notes and groups leads into tribes
 * (e.g., "Struggling with X", "Need Y feature")
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface PainPointResult {
  painPointTribe: string;
  confidence: number;
}

const COMMON_PAIN_POINTS = [
  "Need automation",
  "Struggling with manual work",
  "Need better analytics",
  "Cost reduction",
  "Time savings",
  "Scaling issues",
  "Integration problems",
  "User engagement",
  "Revenue growth",
  "Customer support",
  "Data management",
  "Workflow optimization",
  "Other",
];

/**
 * Detect pain point tribe from signup note
 */
export async function detectPainPointTribe(
  signupNote: string | null
): Promise<PainPointResult | null> {
  if (!signupNote) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a customer research expert. Analyze this signup note and identify the PRIMARY pain point:

${COMMON_PAIN_POINTS.join(", ")}

Signup note: "${signupNote}"

Rules:
- Choose the pain point that BEST matches their frustration or need
- If unsure, choose "Other"
- Return ONLY JSON: {"painPointTribe": "...", "confidence": 0.0-1.0}
- Confidence should be higher when the match is clear`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      
      if (COMMON_PAIN_POINTS.includes(parsed.painPointTribe)) {
        return {
          painPointTribe: parsed.painPointTribe,
          confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        };
      }
    }

    return fallbackPainPoint(signupNote);
  } catch (error) {
    console.error("Failed to detect pain point:", error);
    return fallbackPainPoint(signupNote);
  }
}

/**
 * Detect pain points in batch
 */
export async function detectPainPointsBatch(
  leads: Array<{ id: string; signupNote: string | null }>
): Promise<Map<string, PainPointResult>> {
  const results = new Map<string, PainPointResult>();

  for (const lead of leads) {
    const painPoint = await detectPainPointTribe(lead.signupNote);
    if (painPoint) {
      results.set(lead.id, painPoint);
    }
  }

  return results;
}

/**
 * Fallback pain point detection using simple heuristics
 */
function fallbackPainPoint(signupNote: string): PainPointResult {
  const text = signupNote.toLowerCase();
  
  const painPointMap: Record<string, string> = {
    "manual": "Struggling with manual work",
    "automat": "Need automation",
    "analytics": "Need better analytics",
    "data": "Data management",
    "expensive": "Cost reduction",
    "cost": "Cost reduction",
    "save time": "Time savings",
    "scale": "Scaling issues",
    "integrat": "Integration problems",
    "engage": "User engagement",
    "revenue": "Revenue growth",
    "support": "Customer support",
    "workflow": "Workflow optimization",
  };

  for (const [keyword, painPoint] of Object.entries(painPointMap)) {
    if (text.includes(keyword)) {
      return { painPointTribe: painPoint, confidence: 0.6 };
    }
  }

  return { painPointTribe: "Other", confidence: 0.3 };
}

/**
 * Get pain point distribution
 */
export function getPainPointDistribution(painPoints: PainPointResult[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  COMMON_PAIN_POINTS.forEach(painPoint => {
    distribution[painPoint] = 0;
  });

  painPoints.forEach(p => {
    distribution[p.painPointTribe] = (distribution[p.painPointTribe] || 0) + 1;
  });

  return distribution;
}
