/**
 * Network Reach Scoring Service
 * 
 * Calculates network reach based on Twitter followers, blog readership, community presence.
 */

import { calculateSocialProof } from "./social-proof";

export interface NetworkReachResult {
  networkReach: number;
  reachScore: number;
  influenceLevel: "micro" | "mid" | "macro" | "mega";
  confidence: number;
}

/**
 * Calculate network reach based on social proof data
 */
export async function calculateNetworkReach(
  email: string,
  twitterFollowers: number | null,
  githubActivity: number | null
): Promise<NetworkReachResult> {
  try {
    // Get social proof data if not provided
    const socialProof = await calculateSocialProof(email);
    
    const followers = twitterFollowers || socialProof?.twitterFollowers || 0;
    const githubRepos = githubActivity || socialProof?.githubActivity || 0;
    
    // Calculate reach score using logarithmic scaling (scientific approach)
    let reachScore = 0;
    
    // Twitter influence (logarithmic scaling for realistic distribution)
    if (followers > 0) {
      const logFollowers = Math.log10(followers + 1); // +1 to avoid log(0)
      const normalizedTwitter = Math.min((logFollowers / 6) * 50, 50); // Scale to 0-50
      reachScore += normalizedTwitter;
    }
    
    // GitHub influence (logarithmic scaling)
    if (githubRepos > 0) {
      const logRepos = Math.log10(githubRepos + 1);
      const normalizedGithub = Math.min((logRepos / 3) * 50, 50); // Scale to 0-50
      reachScore += normalizedGithub;
    }
    
    // Cap at 100
    reachScore = Math.min(reachScore, 100);
    
    // Determine influence level
    let influenceLevel: "micro" | "mid" | "macro" | "mega" = "micro";
    if (reachScore >= 70) influenceLevel = "mega";
    else if (reachScore >= 50) influenceLevel = "macro";
    else if (reachScore >= 25) influenceLevel = "mid";
    
    // Calculate network reach using realistic multipliers
    // Twitter: assume 10% of followers see content (conservative estimate)
    // GitHub: assume each repo has ~50 watchers on average
    const networkReach = Math.round((followers * 0.1) + (githubRepos * 50));
    
    const confidence = (followers > 0 || githubRepos > 0) ? 0.7 : 0.3;
    
    return {
      networkReach,
      reachScore,
      influenceLevel,
      confidence,
    };
  } catch (error) {
    console.error("Failed to calculate network reach:", error);
    return {
      networkReach: 0,
      reachScore: 0,
      influenceLevel: "micro",
      confidence: 0,
    };
  }
}

/**
 * Get network reach category description
 */
export function getNetworkReachDescription(influenceLevel: string): string {
  switch (influenceLevel) {
    case "mega":
      return "Massive reach - can influence thousands";
    case "macro":
      return "Strong reach - can influence hundreds";
    case "mid":
      return "Moderate reach - can influence dozens";
    case "micro":
      return "Limited reach - niche influence";
    default:
      return "Unknown reach";
  }
}
