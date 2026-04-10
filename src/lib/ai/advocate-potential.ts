/**
 * Advocate Potential Service
 * 
 * Combines share propensity and network reach into advocate score.
 */

import { detectSharePropensity } from "./share-propensity";
import { calculateNetworkReach } from "../enrichment/network-reach";

export interface AdvocatePotentialResult {
  advocatePotential: number;
  advocateLevel: "super-advocate" | "advocate" | "potential-advocate" | "unlikely";
  sharePropensity: number;
  networkReach: number;
  confidence: number;
  reasoning: string;
}

/**
 * Calculate advocate potential by combining share propensity and network reach
 */
export async function calculateAdvocatePotential(
  signupNote: string | null,
  company: string | null,
  email: string,
  twitterFollowers: number | null,
  githubActivity: number | null
): Promise<AdvocatePotentialResult> {
  try {
    // Get share propensity
    const shareResult = await detectSharePropensity(signupNote, company);
    const sharePropensity = shareResult?.sharePropensity || 0.3;
    
    // Get network reach
    const networkResult = await calculateNetworkReach(email, twitterFollowers, githubActivity);
    const networkReach = networkResult.reachScore;
    
    // Calculate advocate potential (weighted combination)
    // Share propensity (60%) + Network reach (40%)
    const advocatePotential = (sharePropensity * 0.6) + (networkReach / 100 * 0.4);
    
    // Determine advocate level
    let advocateLevel: AdvocatePotentialResult['advocateLevel'] = "unlikely";
    if (advocatePotential >= 0.8) {
      advocateLevel = "super-advocate";
    } else if (advocatePotential >= 0.6) {
      advocateLevel = "advocate";
    } else if (advocatePotential >= 0.4) {
      advocateLevel = "potential-advocate";
    }
    
    const confidence = Math.min(((shareResult?.confidence || 0) + networkResult.confidence) / 2, 1);
    const reasoning = generateAdvocateReasoning(advocateLevel, sharePropensity, networkReach);
    
    return {
      advocatePotential: advocatePotential, // Keep as 0-1 range for consistency
      advocateLevel,
      sharePropensity: sharePropensity, // Keep as 0-1 range for consistency
      networkReach,
      confidence,
      reasoning,
    };
  } catch (error) {
    console.error("Failed to calculate advocate potential:", error);
    return {
      advocatePotential: 0,
      advocateLevel: "unlikely",
      sharePropensity: 0,
      networkReach: 0,
      confidence: 0,
      reasoning: "Error calculating advocate potential",
    };
  }
}

/**
 * Generate reasoning for advocate potential
 */
function generateAdvocateReasoning(
  level: string,
  sharePropensity: number,
  networkReach: number
): string {
  const sharePropensityPercent = Math.round(sharePropensity * 100);
  switch (level) {
    case "super-advocate":
      return `High share propensity (${sharePropensityPercent}%) and strong network reach (${networkReach}) - this lead is likely to become a super advocate and drive significant word-of-mouth.`;
    case "advocate":
      return `Good share propensity (${sharePropensityPercent}%) and moderate network reach (${networkReach}) - this lead has strong advocacy potential.`;
    case "potential-advocate":
      return `Moderate share propensity (${sharePropensityPercent}%) and limited network reach (${networkReach}) - this lead could become an advocate with nurturing.`;
    case "unlikely":
      return `Low share propensity (${sharePropensityPercent}%) and limited network reach (${networkReach}) - this lead is unlikely to advocate for the product.`;
    default:
      return "Unable to determine advocate potential";
  }
}

/**
 * Get outreach recommendation based on advocate level
 */
export function getAdvocateOutreachRecommendation(level: AdvocatePotentialResult['advocateLevel']): {
  shouldReachOut: boolean;
  outreachType: string;
  suggestedMessage: string;
} {
  switch (level) {
    case "super-advocate":
      return {
        shouldReachOut: true,
        outreachType: "Personal outreach",
        suggestedMessage: "We'd love to have you as an early advocate. Can we schedule a call to discuss how we can work together?",
      };
    case "advocate":
      return {
        shouldReachOut: true,
        outreachType: "Personalized email",
        suggestedMessage: "We think you'd be a great fit to help spread the word. Would you be interested in being part of our advocate program?",
      };
    case "potential-advocate":
      return {
        shouldReachOut: true,
        outreachType: "Automated nurture sequence",
        suggestedMessage: "We'd love to hear your feedback and share your experience with others.",
      };
    case "unlikely":
      return {
        shouldReachOut: false,
        outreachType: "None",
        suggestedMessage: "",
      };
  }
}
