/**
 * Share Propensity Detection Service
 * 
 * Analyzes signup note enthusiasm, language patterns, community mentions.
 */

import { z } from "zod";
import { generateStructuredOutput, cacheAiOperation } from "./client";


const sharePropensitySchema = z.object({
  sharePropensity: z.number().min(0).max(1),
  enthusiasmLevel: z.enum(["high", "medium", "low"]),
  communityMentions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export interface SharePropensityResult {
  sharePropensity: number;
  enthusiasmLevel: "high" | "medium" | "low";
  communityMentions: string[];
  confidence: number;
}

/**
 * Detect share propensity from lead data
 */
export async function detectSharePropensity(
  signupNote: string | null,
  company: string | null
): Promise<SharePropensityResult | null> {
  if (!signupNote) {
    return null;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set, using fallback for share propensity detection");
    return fallbackSharePropensity(signupNote);
  }

  try {
    const prompt = `You are a social media expert. Analyze signup note to determine share propensity.

EXAMPLES:
Input: "This looks amazing! Can't wait to share with my team"
Output: {"sharePropensity": 0.9, "enthusiasmLevel": "high", "communityMentions": ["team"], "confidence": 0.85}

Input: "Interested in learning more"
Output: {"sharePropensity": 0.3, "enthusiasmLevel": "low", "communityMentions": [], "confidence": 0.5}

Input: "My community would love this"
Output: {"sharePropensity": 0.85, "enthusiasmLevel": "high", "communityMentions": ["community"], "confidence": 0.9}

Input: "Looking for a solution for my startup"
Output: {"sharePropensity": 0.4, "enthusiasmLevel": "low", "communityMentions": [], "confidence": 0.4}

CONFIDENCE CRITERIA:
- 0.9-1.0: Explicit sharing intent (e.g., "share", "tell my team", "community")
- 0.7-0.8: Strong enthusiasm (e.g., "amazing", "love this", "can't wait")
- 0.5-0.6: Moderate interest (e.g., "interested", "looking forward")
- 0.3-0.4: Low enthusiasm or no sharing indicators
- 0.0-0.2: Insufficient information

Current lead:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}

Return ONLY valid JSON matching this schema:`;

    const result = await cacheAiOperation(
      `share-propensity:${signupNote.substring(0, 50)}:${company || 'none'}`,
      () => generateStructuredOutput(prompt, sharePropensitySchema),
      3600 // Cache for 1 hour
    );

    if (!result) {
      return fallbackSharePropensity(signupNote);
    }

    return {
      sharePropensity: Math.min(Math.max(result.sharePropensity, 0), 1),
      enthusiasmLevel: result.enthusiasmLevel,
      communityMentions: result.communityMentions,
      confidence: Math.min(Math.max(result.confidence, 0), 1),
    };
  } catch (error) {
    console.error("Failed to detect share propensity:", error);
    return fallbackSharePropensity(signupNote);
  }
}

/**
 * Fallback share propensity detection using heuristics
 */
function fallbackSharePropensity(signupNote: string): SharePropensityResult {
  const text = signupNote.toLowerCase();
  
  const communityMentions: string[] = [];
  let score = 0.4;

  const highShareKeywords = ["share", "tell my", "community", "team", "network", "colleagues", "spread the word"];
  const mediumShareKeywords = ["amazing", "love this", "can't wait", "excited", "awesome", "fantastic"];
  const lowShareKeywords = ["interested", "looking", "explore", "maybe", "consider"];

  highShareKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 0.3;
      communityMentions.push(keyword);
    }
  });

  mediumShareKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 0.15;
    }
  });

  lowShareKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 0.1;
    }
  });

  score = Math.min(Math.max(score, 0), 1);

  let enthusiasmLevel: "high" | "medium" | "low" = "medium";
  if (score >= 0.7) enthusiasmLevel = "high";
  else if (score < 0.4) enthusiasmLevel = "low";

  return {
    sharePropensity: score,
    enthusiasmLevel,
    communityMentions,
    confidence: 0.5,
  };
}
