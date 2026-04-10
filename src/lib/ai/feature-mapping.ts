/**
 * Feature Mapping Service
 * 
 * Maps lead's mentioned problems to product features and prioritizes demo order.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface FeatureMappingResult {
  featurePriority: string;
  confidence: number;
}

// Common product features - customize based on your product
const COMMON_FEATURES = [
  "Dashboard & Analytics",
  "User Management",
  "Integrations",
  "Automation",
  "Reporting",
  "API Access",
  "Collaboration",
  "Security",
  "Customization",
  "Mobile App",
];

/**
 * Map lead's problems to product features
 */
export async function mapFeatures(
  signupNote: string | null,
  company: string | null,
  score: number | null
): Promise<FeatureMappingResult | null> {
  if (!signupNote) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a product expert. Analyze this lead's signup note and identify which features they would be MOST interested in:

${COMMON_FEATURES.join(", ")}

Lead data:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}
- Lead score: ${score || "N/A"}

Rules:
- Choose 2-3 features that best match their stated needs
- Prioritize features that solve their specific problems
- Return ONLY JSON: {"featurePriority": "Feature 1, Feature 2, Feature 3", "confidence": 0.0-1.0}
- Confidence should be higher when the match is clear`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        featurePriority: parsed.featurePriority,
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      };
    }

    return fallbackFeatureMapping(signupNote);
  } catch (error) {
    console.error("Failed to map features:", error);
    return fallbackFeatureMapping(signupNote);
  }
}

/**
 * Fallback feature mapping using simple heuristics
 */
function fallbackFeatureMapping(signupNote: string): FeatureMappingResult {
  const text = signupNote.toLowerCase();
  
  const featureMap: Record<string, string> = {
    "analytics": "Dashboard & Analytics, Reporting",
    "data": "Dashboard & Analytics, Reporting",
    "track": "Dashboard & Analytics",
    "team": "User Management, Collaboration",
    "users": "User Management",
    "integrat": "Integrations, API Access",
    "connect": "Integrations",
    "automat": "Automation",
    "save time": "Automation",
    "report": "Reporting",
    "api": "API Access",
    "secure": "Security",
    "custom": "Customization",
    "mobile": "Mobile App",
  };

  for (const [keyword, features] of Object.entries(featureMap)) {
    if (text.includes(keyword)) {
      return { featurePriority: features, confidence: 0.6 };
    }
  }

  return { featurePriority: "Dashboard & Analytics", confidence: 0.3 };
}

/**
 * Get recommended demo order based on feature priority
 */
export function getDemoOrder(featurePriority: string): string[] {
  return featurePriority.split(", ").map(f => f.trim());
}
