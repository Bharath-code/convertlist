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

    const prompt = `You are a product expert. Map lead needs to product features.

Available features: ${COMMON_FEATURES.join(", ")}

EXAMPLES:
Input: "Need to track sales data and generate reports"
Output: {"featurePriority": "Dashboard & Analytics, Reporting", "confidence": 0.9}

Input: "Manage my team and collaborate on projects"
Output: {"featurePriority": "User Management, Collaboration", "confidence": 0.85}

Input: "Connect with our existing tools and automate workflows"
Output: {"featurePriority": "Integrations, Automation", "confidence": 0.9}

Input: "Need secure API access for our developers"
Output: {"featurePriority": "API Access, Security", "confidence": 0.9}

Input: "Just looking around"
Output: {"featurePriority": "Dashboard & Analytics", "confidence": 0.3}

CONFIDENCE CRITERIA:
- 0.9-1.0: Explicit feature requests with specific keywords (e.g., "track data", "team", "API")
- 0.7-0.8: Clear problem statements that map to features
- 0.5-0.6: General business needs that could apply to multiple features
- 0.3-0.4: Vague or exploratory
- 0.0-0.2: No clear feature needs

RULES:
- Select 1-3 features (only what's explicitly needed)
- Order by relevance (most important first)
- If no specific needs mentioned, default to "Dashboard & Analytics"

Current lead:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}
- Lead score: ${score || "N/A"}

Return ONLY valid JSON matching this schema:
{"featurePriority": string, "confidence": number}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        // Validate confidence is a number
        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
        return {
          featurePriority: parsed.featurePriority,
          confidence: Math.min(Math.max(confidence, 0), 1),
        };
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
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
  if (!signupNote) {
    return { featurePriority: "Dashboard & Analytics", confidence: 0.3 };
  }
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
