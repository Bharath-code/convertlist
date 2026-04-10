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

    const prompt = `You are a customer research expert. Analyze this signup note and identify the PRIMARY pain point.

Available pain points: ${COMMON_PAIN_POINTS.join(", ")}

EXAMPLES:
Input: "We spend too much time on manual data entry"
Output: {"painPointTribe": "Struggling with manual work", "confidence": 0.9}

Input: "Need to automate our email campaigns"
Output: {"painPointTribe": "Need automation", "confidence": 0.9}

Input: "Can't see what's working in our marketing"
Output: {"painPointTribe": "Need better analytics", "confidence": 0.85}

Input: "Our current solution is too expensive"
Output: {"painPointTribe": "Cost reduction", "confidence": 0.9}

Input: "Trying to scale but hitting limits"
Output: {"painPointTribe": "Scaling issues", "confidence": 0.85}

Input: "Just checking this out"
Output: {"painPointTribe": "Other", "confidence": 0.3}

CONFIDENCE CRITERIA:
- 0.9-1.0: Explicit pain point keywords (e.g., "manual", "automate", "expensive", "scale")
- 0.7-0.8: Clear frustration or problem statement
- 0.5-0.6: Indirect indication of pain
- 0.3-0.4: Vague or exploratory
- 0.0-0.2: Insufficient information

Current signup note: "${signupNote}"

Return ONLY valid JSON matching this schema:
{"painPointTribe": string, "confidence": number}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        
        if (COMMON_PAIN_POINTS.includes(parsed.painPointTribe)) {
          const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
          return {
            painPointTribe: parsed.painPointTribe,
            confidence: Math.min(Math.max(confidence, 0), 1),
          };
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
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
  if (!signupNote) {
    return { painPointTribe: "Other", confidence: 0.3 };
  }
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
