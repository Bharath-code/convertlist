/**
 * Objection Handling Service
 * 
 * Detects potential objections from lead data (budget, timing, competition)
 * and generates handling scripts.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ObjectionHandlingResult {
  objectionHandling: string;
  confidence: number;
}

const COMMON_OBJECTIONS = [
  "Budget concerns",
  "Timing not right",
  "Already using competitor",
  "Need more info",
  "Not convinced of value",
  "Technical concerns",
  "Team buy-in needed",
  "Other",
];

/**
 * Detect potential objections and generate handling scripts
 */
export async function detectObjections(
  signupNote: string | null,
  company: string | null,
  score: number | null,
  segment: string | null
): Promise<ObjectionHandlingResult | null> {
  if (!signupNote) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a sales expert. Analyze this lead's signup note and identify potential objections.

Available objections: ${COMMON_OBJECTIONS.join(", ")}

EXAMPLES:
Input: "Too expensive for our budget"
Output: {"objectionHandling": "Objection: Budget concerns. Response: Our pricing scales with your needs and we offer flexible plans starting at $29/month.", "confidence": 0.9}

Input: "We'll look at this next quarter"
Output: {"objectionHandling": "Objection: Timing not right. Response: No pressure - we're here when you're ready. Would you like us to follow up in 2 weeks?", "confidence": 0.85}

Input: "Already using HubSpot"
Output: {"objectionHandling": "Objection: Already using competitor. Response: We understand you have a solution. Here's how we're different: simpler setup, faster onboarding, and 50% lower cost.", "confidence": 0.9}

Input: "Not sure if this is worth it"
Output: {"objectionHandling": "Objection: Not convinced of value. Response: Let me show you a quick demo of how this can specifically help with your stated goals. Most customers see ROI within 30 days.", "confidence": 0.8}

Input: "Just exploring"
Output: {"objectionHandling": "Objection: Need more info. Response: I'd love to share more details about how this can help. What specific questions do you have?", "confidence": 0.4}

CONFIDENCE CRITERIA:
- 0.9-1.0: Explicit objection keywords (e.g., "expensive", "next quarter", "already using")
- 0.7-0.8: Strong indicators of hesitation
- 0.5-0.6: Some concern but not specific
- 0.3-0.4: Vague or exploratory
- 0.0-0.2: No clear objection

Current lead:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}
- Lead score: ${score || "N/A"}
- Segment: ${segment || "N/A"}

Return ONLY valid JSON matching this schema:
{"objectionHandling": string, "confidence": number}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
        return {
          objectionHandling: parsed.objectionHandling,
          confidence: Math.min(Math.max(confidence, 0), 1),
        };
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }

    return fallbackObjectionHandling(signupNote, segment);
  } catch (error) {
    console.error("Failed to detect objections:", error);
    return fallbackObjectionHandling(signupNote, segment);
  }
}

/**
 * Fallback objection handling using simple heuristics
 */
function fallbackObjectionHandling(
  signupNote: string,
  segment: string | null
): ObjectionHandlingResult {
  if (!signupNote) {
    return {
      objectionHandling: "Objection: Need more info. Response: I'd love to share more details about how this can help. What specific questions do you have?",
      confidence: 0.3,
    };
  }
  const text = signupNote.toLowerCase();
  
  const objectionMap: Record<string, string> = {
    "expensive": "Objection: Budget concerns. Response: Our pricing scales with your needs and we offer flexible plans to fit your budget.",
    "cost": "Objection: Budget concerns. Response: Our pricing scales with your needs and we offer flexible plans to fit your budget.",
    "price": "Objection: Budget concerns. Response: Our pricing scales with your needs and we offer flexible plans to fit your budget.",
    "later": "Objection: Timing not right. Response: No pressure - we're here when you're ready. Would you like us to follow up in a few weeks?",
    "busy": "Objection: Timing not right. Response: No pressure - we're here when you're ready. Would you like us to follow up in a few weeks?",
    "already": "Objection: Already using competitor. Response: We understand you have a solution. Here's how we're different: [highlight key differentiator].",
    "competitor": "Objection: Already using competitor. Response: We understand you have a solution. Here's how we're different: [highlight key differentiator].",
    "using": "Objection: Already using competitor. Response: We understand you have a solution. Here's how we're different: [highlight key differentiator].",
    "not sure": "Objection: Not convinced of value. Response: Let me show you a quick demo of how this can specifically help with [their specific problem].",
    "maybe": "Objection: Not convinced of value. Response: Let me show you a quick demo of how this can specifically help with [their specific problem].",
  };

  for (const [keyword, handling] of Object.entries(objectionMap)) {
    if (text.includes(keyword)) {
      return { objectionHandling: handling, confidence: 0.6 };
    }
  }

  // Segment-based fallback
  if (segment === "COLD") {
    return {
      objectionHandling: "Objection: Need more info. Response: I'd love to share more details about how this can help. What specific questions do you have?",
      confidence: 0.4,
    };
  }

  return {
    objectionHandling: "Objection: Need more info. Response: I'd love to share more details about how this can help. What specific questions do you have?",
    confidence: 0.3,
  };
}
