/**
 * Influence Scoring Service
 * 
 * Calculates influence based on network position, connections to other leads.
 * Combines company relationships, community overlap, and social proof.
 */

import type { CompanyRelationshipAnalysis } from './company-relationships';
import type { CommunityOverlap } from './community-overlap';

export interface InfluenceFactors {
  networkPosition: number; // 0-100
  connectionCount: number; // Number of connections to other leads
  communityPresence: number; // 0-100
  socialProof: number; // 0-100
  companyInfluence: number; // 0-100
}

export interface InfluenceScore {
  score: number; // 0-100
  factors: InfluenceFactors;
  tier: 'low' | 'medium' | 'high' | 'influencer';
  summary: string;
}

/**
 * Calculate influence score for a lead
 */
export function calculateInfluenceScore(
  companyRelationships: CompanyRelationshipAnalysis,
  communityOverlap: CommunityOverlap,
  socialProofScore?: number,
  twitterFollowers?: number,
  githubActivity?: number
): InfluenceScore {
  // Network position based on relationship strength
  const networkPosition = companyRelationships.relationshipCount > 0
    ? Math.min(companyRelationships.relationshipCount * 20, 100)
    : 0;

  // Connection count
  const connectionCount = companyRelationships.relationshipCount;

  // Community presence
  const communityPresence = communityOverlap.overlapCount > 0
    ? Math.min(communityOverlap.overlapCount * 25, 100)
    : 0;

  // Social proof (from enrichment or social media)
  let socialProof = socialProofScore || 0;
  if (twitterFollowers) {
    socialProof = Math.max(socialProof, Math.min(twitterFollowers / 100, 100));
  }
  if (githubActivity) {
    socialProof = Math.max(socialProof, Math.min(githubActivity / 10, 100));
  }

  // Company influence based on relationship types
  const companyInfluence = companyRelationships.strongestRelationship
    ? companyRelationships.strongestRelationship.confidence
    : 0;

  const factors: InfluenceFactors = {
    networkPosition,
    connectionCount,
    communityPresence,
    socialProof,
    companyInfluence,
  };

  // Calculate overall score (weighted average)
  const score = Math.round(
    (networkPosition * 0.25) +
    (communityPresence * 0.25) +
    (socialProof * 0.3) +
    (companyInfluence * 0.2)
  );

  const tier = determineInfluenceTier(score);
  const summary = generateInfluenceSummary(score, tier, factors);

  return {
    score,
    factors,
    tier,
    summary,
  };
}

/**
 * Determine influence tier based on score
 */
function determineInfluenceTier(score: number): 'low' | 'medium' | 'high' | 'influencer' {
  if (score >= 80) return 'influencer';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Generate influence summary
 */
function generateInfluenceSummary(
  score: number,
  tier: string,
  factors: InfluenceFactors
): string {
  const tierDescriptions = {
    influencer: 'Key influencer with strong network presence',
    high: 'Highly connected lead with significant influence',
    medium: 'Moderately connected with some influence',
    low: 'Limited network connections and influence',
  };

  let summary = tierDescriptions[tier as keyof typeof tierDescriptions];

  const strongPoints: string[] = [];
  if (factors.networkPosition > 60) strongPoints.push('strong network position');
  if (factors.communityPresence > 60) strongPoints.push('active in communities');
  if (factors.socialProof > 60) strongPoints.push('high social proof');
  if (factors.companyInfluence > 60) strongPoints.push('company influence');

  if (strongPoints.length > 0) {
    summary += `. Notable for: ${strongPoints.join(', ')}.`;
  }

  return summary;
}

/**
 * Batch calculate influence scores for multiple leads
 */
export function batchCalculateInfluenceScores(
  analyses: Array<{
    companyRelationships: CompanyRelationshipAnalysis;
    communityOverlap: CommunityOverlap;
    socialProofScore?: number;
    twitterFollowers?: number;
    githubActivity?: number;
  }>
): InfluenceScore[] {
  return analyses.map(analysis =>
    calculateInfluenceScore(
      analysis.companyRelationships,
      analysis.communityOverlap,
      analysis.socialProofScore,
      analysis.twitterFollowers,
      analysis.githubActivity
    )
  );
}

/**
 * Identify top influencers
 */
export function identifyTopInfluencers(
  scores: InfluenceScore[],
  threshold: number = 70
): InfluenceScore[] {
  return scores.filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/**
 * Get influence tier distribution
 */
export function getInfluenceTierDistribution(
  scores: InfluenceScore[]
): Record<string, number> {
  const distribution = {
    influencer: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  scores.forEach(score => {
    distribution[score.tier]++;
  });

  return distribution;
}

/**
 * Compare two influence scores
 */
export function compareInfluenceScores(
  score1: InfluenceScore,
  score2: InfluenceScore
): {
  moreInfluential: InfluenceScore;
  difference: number;
  reason: string;
} {
  const difference = Math.abs(score1.score - score2.score);
  const moreInfluential = score1.score > score2.score ? score1 : score2;

  let reason = '';
  if (difference < 10) {
    reason = 'Similar influence levels';
  } else if (difference < 30) {
    reason = 'Moderate difference in influence';
  } else {
    reason = 'Significant difference in influence';
  }

  // Add specific reason based on factors
  const score1Factors = score1.factors;
  const score2Factors = score2.factors;

  if (Math.abs(score1Factors.networkPosition - score2Factors.networkPosition) > 20) {
    reason += `. Network position is a key differentiator`;
  } else if (Math.abs(score1Factors.socialProof - score2Factors.socialProof) > 20) {
    reason += `. Social proof is a key differentiator`;
  } else if (Math.abs(score1Factors.communityPresence - score2Factors.communityPresence) > 20) {
    reason += `. Community presence is a key differentiator`;
  }

  return {
    moreInfluential,
    difference,
    reason,
  };
}
