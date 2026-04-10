/**
 * Super-User Scoring Service
 * 
 * Calculates super-user scores based on multi-product engagement and lifetime value.
 * Identifies the most valuable users across all products.
 */

import type { CrossProductBehavior } from './behavior';
import type { EarlyAdopterProfile } from './early-adopter';
import type { LifetimeValuePrediction } from '../ai/lifetime-value';

export interface SuperUserScore {
  userId: string;
  superUserScore: number; // 0-100
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  factors: {
    productEngagement: number;
    earlyAdoption: number;
    lifetimeValue: number;
    consistency: number;
  };
  summary: string;
}

/**
 * Calculate super-user score
 */
export function calculateSuperUserScore(
  crossProductBehavior: CrossProductBehavior,
  earlyAdopterProfile: EarlyAdopterProfile,
  lifetimeValuePrediction: LifetimeValuePrediction
): SuperUserScore {
  // Factor 1: Product engagement (0-100)
  const productEngagement = Math.min(crossProductBehavior.totalProducts * 25, 100);
  
  // Factor 2: Early adoption (0-100)
  const earlyAdoption = earlyAdopterProfile.earlyAdopterScore;
  
  // Factor 3: Lifetime value (normalized to 0-100)
  const lifetimeValue = Math.min(lifetimeValuePrediction.predictedLTV / 10, 100);
  
  // Factor 4: Consistency (based on conversion rate)
  const consistency = crossProductBehavior.conversionRate;

  // Calculate weighted average
  const superUserScore = Math.round(
    (productEngagement * 0.3) +
    (earlyAdoption * 0.25) +
    (lifetimeValue * 0.3) +
    (consistency * 0.15)
  );

  const tier = determineSuperUserTier(superUserScore);
  const factors = {
    productEngagement,
    earlyAdoption,
    lifetimeValue,
    consistency,
  };

  const summary = generateSuperUserSummary(tier, factors);

  return {
    userId: '', // Will be set by caller
    superUserScore,
    tier,
    factors,
    summary,
  };
}

/**
 * Determine super-user tier
 */
function determineSuperUserTier(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
  if (score >= 95) return 'diamond';
  if (score >= 80) return 'platinum';
  if (score >= 60) return 'gold';
  if (score >= 40) return 'silver';
  return 'bronze';
}

/**
 * Generate super-user summary
 */
function generateSuperUserSummary(
  tier: string,
  factors: { productEngagement: number; earlyAdoption: number; lifetimeValue: number; consistency: number }
): string {
  const tierDescriptions = {
    diamond: 'Elite super-user with exceptional engagement and value',
    platinum: 'High-value super-user with strong multi-product engagement',
    gold: 'Valuable power user with consistent engagement',
    silver: 'Active user with growing engagement',
    bronze: 'Early-stage user with potential',
  };

  let summary = tierDescriptions[tier as keyof typeof tierDescriptions];

  const strongFactors: string[] = [];
  if (factors.productEngagement > 70) strongFactors.push('high product engagement');
  if (factors.earlyAdoption > 70) strongFactors.push('early adopter behavior');
  if (factors.lifetimeValue > 70) strongFactors.push('high lifetime value');
  if (factors.consistency > 70) strongFactors.push('consistent conversion');

  if (strongFactors.length > 0) {
    summary += `. Notable for: ${strongFactors.join(', ')}.`;
  }

  return summary;
}

/**
 * Batch calculate super-user scores
 */
export function batchCalculateSuperUserScores(
  userData: Array<{
    userId: string;
    crossProductBehavior: CrossProductBehavior;
    earlyAdopterProfile: EarlyAdopterProfile;
    lifetimeValuePrediction: LifetimeValuePrediction;
  }>
): SuperUserScore[] {
  return userData.map(data => ({
    ...calculateSuperUserScore(
      data.crossProductBehavior,
      data.earlyAdopterProfile,
      data.lifetimeValuePrediction
    ),
    userId: data.userId,
  }));
}

/**
 * Identify super-users by tier
 */
export function identifySuperUsersByTier(
  scores: SuperUserScore[],
  minTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'gold'
): SuperUserScore[] {
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const minTierIndex = tierOrder.indexOf(minTier);
  
  return scores
    .filter(s => tierOrder.indexOf(s.tier) >= minTierIndex)
    .sort((a, b) => b.superUserScore - a.superUserScore);
}

/**
 * Get tier distribution
 */
export function getSuperUserTierDistribution(
  scores: SuperUserScore[]
): Record<string, number> {
  const distribution = {
    diamond: 0,
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  };

  scores.forEach(score => {
    distribution[score.tier]++;
  });

  return distribution;
}

/**
 * Compare super-user scores
 */
export function compareSuperUserScores(
  score1: SuperUserScore,
  score2: SuperUserScore
): {
  higherScoring: SuperUserScore;
  difference: number;
  keyDifference: string;
} {
  const higherScoring = score1.superUserScore > score2.superUserScore ? score1 : score2;
  const difference = Math.abs(score1.superUserScore - score2.superUserScore);

  // Find the key factor driving the difference
  const factorDifferences = {
    productEngagement: Math.abs(score1.factors.productEngagement - score2.factors.productEngagement),
    earlyAdoption: Math.abs(score1.factors.earlyAdoption - score2.factors.earlyAdoption),
    lifetimeValue: Math.abs(score1.factors.lifetimeValue - score2.factors.lifetimeValue),
    consistency: Math.abs(score1.factors.consistency - score2.factors.consistency),
  };

  const maxFactor = Object.entries(factorDifferences).reduce((max, [factor, diff]) =>
    diff > max.diff ? { factor, diff } : max
  , { factor: 'none', diff: 0 });

  const keyDifference = maxFactor.diff > 10
    ? `Key difference in ${maxFactor.factor} (${maxFactor.diff} points)`
    : 'Balanced across all factors';

  return {
    higherScoring,
    difference,
    keyDifference,
  };
}
