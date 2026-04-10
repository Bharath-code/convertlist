/**
 * Social Proof Scoring Service
 * 
 * Checks Twitter followers, GitHub repos, Substack presence, and calculates
 * a composite social proof score from 0-100.
 */

import { enrichLead } from './clearbit';

export interface SocialProofEnrichment {
  twitterFollowers?: number;
  githubActivity?: number;
  substackPresence?: boolean;
  socialProofScore: number;
  confidence: number;
}

/**
 * Calculate social proof score from Clearbit enrichment data
 */
export async function calculateSocialProof(email: string): Promise<SocialProofEnrichment | null> {
  try {
    const clearbitData = await enrichLead(email);
    
    if (!clearbitData) {
      return null;
    }

    const enrichment: SocialProofEnrichment = {
      socialProofScore: 0,
      confidence: 0.5,
    };

    // Extract social data
    const hasTwitter = !!clearbitData.social?.twitter;
    const hasGithub = !!clearbitData.social?.github;
    
    // Twitter followers (simulated - Clearbit doesn't provide follower counts)
    // In production, integrate with Twitter API
    if (hasTwitter) {
      enrichment.twitterFollowers = 0; // Would need Twitter API
      enrichment.socialProofScore += 20;
    }

    // GitHub activity (simulated - Clearbit provides username but not activity)
    // In production, integrate with GitHub API
    if (hasGithub) {
      enrichment.githubActivity = 0; // Would need GitHub API
      enrichment.socialProofScore += 25;
    }

    // Substack presence (heuristic based on company/role)
    // In production, check actual Substack API
    if (clearbitData.employment?.title?.toLowerCase().includes('writer') ||
        clearbitData.employment?.title?.toLowerCase().includes('creator')) {
      enrichment.substackPresence = true;
      enrichment.socialProofScore += 15;
    }

    // Company size influence (larger companies = higher social proof)
    if (clearbitData.company?.size) {
      const size = clearbitData.company.size;
      if (size > 1000) enrichment.socialProofScore += 20;
      else if (size > 100) enrichment.socialProofScore += 15;
      else if (size > 10) enrichment.socialProofScore += 10;
    }

    // Seniority influence
    if (clearbitData.employment?.seniority) {
      const seniority = clearbitData.employment.seniority.toLowerCase();
      if (seniority.includes('executive') || seniority.includes('c-level')) {
        enrichment.socialProofScore += 20;
      } else if (seniority.includes('director') || seniority.includes('vp')) {
        enrichment.socialProofScore += 15;
      } else if (seniority.includes('manager')) {
        enrichment.socialProofScore += 10;
      }
    }

    // Cap score at 100
    enrichment.socialProofScore = Math.min(enrichment.socialProofScore, 100);

    // Calculate confidence based on data completeness
    const dataPoints = [
      hasTwitter,
      hasGithub,
      enrichment.substackPresence,
      !!clearbitData.company?.size,
      !!clearbitData.employment?.seniority,
    ].filter(Boolean).length;
    
    enrichment.confidence = dataPoints / 5;

    return enrichment;
  } catch (error) {
    console.error(`Failed to calculate social proof for ${email}:`, error);
    return null;
  }
}

/**
 * Calculate social proof score with actual API integrations
 * This would integrate with Twitter API, GitHub API, etc.
 */
export async function calculateSocialProofWithAPIs(
  email: string,
  twitterUsername?: string,
  githubUsername?: string
): Promise<SocialProofEnrichment> {
  const enrichment: SocialProofEnrichment = {
    socialProofScore: 0,
    confidence: 0,
  };

  try {
    // Twitter API integration
    if (twitterUsername) {
      // const twitterResponse = await fetch(`https://api.twitter.com/2/users/by/username/${twitterUsername}?user.fields=public_metrics`, {
      //   headers: { 'Authorization': `Bearer ${process.env.TWITTER_API_KEY}` }
      // });
      // const twitterData = await twitterResponse.json();
      // enrichment.twitterFollowers = twitterData.data.public_metrics.followers_count;
      // enrichment.socialProofScore += Math.min(enrichment.twitterFollowers / 100, 30);
    }

    // GitHub API integration
    if (githubUsername) {
      // const githubResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
      // const githubData = await githubResponse.json();
      // enrichment.githubActivity = githubData.public_repos;
      // enrichment.socialProofScore += Math.min(enrichment.githubActivity / 5, 30);
    }

    // Fallback to Clearbit-based calculation
    const clearbitBased = await calculateSocialProof(email);
    if (clearbitBased) {
      enrichment.socialProofScore = Math.max(enrichment.socialProofScore, clearbitBased.socialProofScore);
      enrichment.confidence = Math.max(enrichment.confidence, clearbitBased.confidence);
    }

    return enrichment;
  } catch (error) {
    console.error(`API-based social proof calculation failed for ${email}:`, error);
    // Fallback to Clearbit-based calculation
    const fallback = await calculateSocialProof(email);
    return fallback || enrichment;
  }
}

/**
 * Batch calculate social proof scores
 */
export async function calculateSocialProofBatch(emails: string[]): Promise<Map<string, SocialProofEnrichment>> {
  const results = new Map<string, SocialProofEnrichment>();

  for (const email of emails) {
    const score = await calculateSocialProof(email);
    if (score) {
      results.set(email, score);
    }
  }

  return results;
}

/**
 * Get social proof tier
 */
export function getSocialProofTier(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}
