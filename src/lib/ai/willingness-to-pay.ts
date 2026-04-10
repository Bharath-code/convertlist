/**
 * Willingness-to-Pay Detection Service
 * 
 * Analyzes signup notes for budget mentions, company size, role indicators.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface WillingnessToPayResult {
  willingnessToPayScore: number;
  budgetIndicators: string[];
  priceRange: string;
  confidence: number;
}

const PRICE_RANGES = [
  "Under $10",
  "$10-$29",
  "$29-$49",
  "$49-$99",
  "$99-$199",
  "$199+",
];

/**
 * Detect willingness to pay from lead data
 */
export async function detectWillingnessToPay(
  signupNote: string | null,
  company: string | null,
  companySize: string | null,
  fundingStatus: string | null
): Promise<WillingnessToPayResult | null> {
  if (!signupNote && !company) {
    return null;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set, using fallback for willingness to pay detection");
    return fallbackWillingnessToPay(signupNote, company, companySize, fundingStatus);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a pricing expert. Analyze lead data to determine willingness to pay.

Available price ranges: ${PRICE_RANGES.join(", ")}

EXAMPLES:
Input: "We have budget approved for this quarter"
Output: {"willingnessToPayScore": 0.9, "budgetIndicators": ["budget approved", "quarter"], "priceRange": "$49-$99", "confidence": 0.85}

Input: "Looking for something affordable"
Output: {"willingnessToPayScore": 0.3, "budgetIndicators": ["affordable"], "priceRange": "Under $10", "confidence": 0.7}

Input: "Enterprise solution needed"
Output: {"willingnessToPayScore": 0.95, "budgetIndicators": ["enterprise"], "priceRange": "$199+", "confidence": 0.9}

Input: "Just exploring"
Output: {"willingnessToPayScore": 0.4, "budgetIndicators": [], "priceRange": "$10-$29", "confidence": 0.3}

CONFIDENCE CRITERIA:
- 0.9-1.0: Explicit budget mentions (e.g., "budget approved", "funding secured")
- 0.7-0.8: Strong indicators (e.g., "enterprise", "need solution", "willing to pay")
- 0.5-0.6: Moderate indicators (e.g., "interested", "looking for tool")
- 0.3-0.4: Weak indicators (e.g., "affordable", "exploring", "just looking")
- 0.0-0.2: No clear indicators

Current lead:
- Signup note: "${signupNote || "N/A"}"
- Company: ${company || "N/A"}
- Company size: ${companySize || "N/A"}
- Funding status: ${fundingStatus || "N/A"}

Return ONLY valid JSON matching this schema:
{"willingnessToPayScore": number, "budgetIndicators": string[], "priceRange": string, "confidence": number}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
        const wtpScore = typeof parsed.willingnessToPayScore === 'number' ? parsed.willingnessToPayScore : 0.5;
        
        // Validate price range
        if (PRICE_RANGES.includes(parsed.priceRange)) {
          return {
            willingnessToPayScore: Math.min(Math.max(wtpScore, 0), 1),
            budgetIndicators: Array.isArray(parsed.budgetIndicators) ? parsed.budgetIndicators : [],
            priceRange: parsed.priceRange,
            confidence: Math.min(Math.max(confidence, 0), 1),
          };
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }

    return fallbackWillingnessToPay(signupNote, company, companySize, fundingStatus);
  } catch (error) {
    console.error("Failed to detect willingness to pay:", error);
    return fallbackWillingnessToPay(signupNote, company, companySize, fundingStatus);
  }
}

/**
 * Fallback willingness to pay detection using heuristics
 */
function fallbackWillingnessToPay(
  signupNote: string | null,
  company: string | null,
  companySize: string | null,
  fundingStatus: string | null
): WillingnessToPayResult {
  const text = `${signupNote || ""} ${company || ""} ${companySize || ""} ${fundingStatus || ""}`.toLowerCase();
  
  const budgetIndicators: string[] = [];
  let score = 0.4;

  const highBudgetKeywords = ["enterprise", "budget", "funding", "vc-backed", "series a", "series b", "investment"];
  const mediumBudgetKeywords = ["startup", "company", "business", "team", "organization"];
  const lowBudgetKeywords = ["affordable", "cheap", "free", "budget-friendly", "personal", "hobby"];

  highBudgetKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 0.2;
      budgetIndicators.push(keyword);
    }
  });

  mediumBudgetKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 0.1;
      budgetIndicators.push(keyword);
    }
  });

  lowBudgetKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 0.15;
      budgetIndicators.push(keyword);
    }
  });

  // Company size influence
  if (companySize?.toLowerCase().includes("enterprise") || companySize?.toLowerCase().includes("1000+")) {
    score += 0.2;
  } else if (companySize?.toLowerCase().includes("startup") || companySize?.toLowerCase().includes("small")) {
    score -= 0.1;
  }

  // Funding status influence
  if (fundingStatus?.toLowerCase().includes("vc-backed")) {
    score += 0.15;
  } else if (fundingStatus?.toLowerCase().includes("bootstrapped")) {
    score -= 0.1;
  }

  score = Math.min(Math.max(score, 0), 1);

  // Determine price range based on score
  let priceRange = "$29-$49";
  if (score >= 0.8) priceRange = "$99-$199";
  else if (score >= 0.6) priceRange = "$49-$99";
  else if (score >= 0.4) priceRange = "$29-$49";
  else if (score >= 0.2) priceRange = "$10-$29";
  else priceRange = "Under $10";

  return {
    willingnessToPayScore: score,
    budgetIndicators,
    priceRange,
    confidence: 0.5,
  };
}

/**
 * Calculate aggregate willingness to pay for a group of leads
 */
export async function calculateAggregateWillingnessToPay(
  leads: Array<{
    signupNote: string | null;
    company: string | null;
    companySize: string | null;
    fundingStatus: string | null;
  }>
): Promise<{
  averageScore: number;
  distribution: Record<string, number>;
  recommendedPricePoint: string;
}> {
  const results = await Promise.all(
    leads.map(lead => detectWillingnessToPay(lead.signupNote, lead.company, lead.companySize, lead.fundingStatus))
  );

  const validResults = results.filter((r): r is WillingnessToPayResult => r !== null);
  
  if (validResults.length === 0) {
    return {
      averageScore: 0,
      distribution: {},
      recommendedPricePoint: "$29-$49",
    };
  }

  const averageScore = validResults.reduce((sum, r) => sum + r.willingnessToPayScore, 0) / validResults.length;

  const distribution: Record<string, number> = {};
  PRICE_RANGES.forEach(range => distribution[range] = 0);
  validResults.forEach(r => {
    distribution[r.priceRange] = (distribution[r.priceRange] || 0) + 1;
  });

  // Find most common price range
  const mostCommonRange = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "$29-$49";

  return {
    averageScore,
    distribution,
    recommendedPricePoint: mostCommonRange,
  };
}
