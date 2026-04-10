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

    const prompt = `You are a sales expert. Analyze this lead's signup note and identify potential objections:

${COMMON_OBJECTIONS.join(", ")}

Lead data:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}
- Lead score: ${score || "N/A"}
- Segment: ${segment || "N/A"}

Rules:
- Identify the most likely objection they might have
- Generate a brief handling script (2-3 sentences) to address it
- Return ONLY JSON: {"objectionHandling": "Objection: [objection]. Response: [handling script]", "confidence": 0.0-1.0}
- Confidence should be higher when the objection is clear`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        objectionHandling: parsed.objectionHandling,
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      };
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
