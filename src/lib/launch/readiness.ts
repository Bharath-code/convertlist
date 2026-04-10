/**
 * Launch Readiness Scoring Service
 * 
 * Calculates a launch readiness score based on waitlist engagement and lead quality.
 * Helps determine if a waitlist is ready for launch.
 */

export interface LaunchReadinessScore {
  score: number; // 0-100
  readiness: 'not_ready' | 'almost_ready' | 'ready' | 'highly_ready';
  factors: {
    leadCount: number;
    engagementRate: number;
    qualityScore: number;
    conversionPotential: number;
  };
  recommendations: string[];
}

/**
 * Calculate launch readiness score
 */
export function calculateLaunchReadiness(
  totalLeads: number,
  engagedLeads: number, // leads with score or engagement
  hotLeads: number, // high-quality leads
  warmLeads: number,
  coldLeads: number
): LaunchReadinessScore {
  // Factor 1: Lead count (0-100)
  const leadCountScore = Math.min((totalLeads / 100) * 100, 100);
  
  // Factor 2: Engagement rate (0-100)
  const engagementRate = totalLeads > 0 ? (engagedLeads / totalLeads) * 100 : 0;
  const engagementScore = engagementRate;
  
  // Factor 3: Quality score (0-100)
  const totalQualityLeads = hotLeads + warmLeads;
  const qualityScore = totalLeads > 0 ? (totalQualityLeads / totalLeads) * 100 : 0;
  
  // Factor 4: Conversion potential (0-100)
  const conversionPotential = totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0;

  // Calculate overall score (weighted average)
  const score = Math.round(
    (leadCountScore * 0.25) +
    (engagementScore * 0.25) +
    (qualityScore * 0.30) +
    (conversionPotential * 0.20)
  );

  const readiness = determineReadiness(score);
  const factors = {
    leadCount: leadCountScore,
    engagementRate: engagementScore,
    qualityScore,
    conversionPotential,
  };

  const recommendations = generateReadinessRecommendations(readiness, factors);

  return {
    score,
    readiness,
    factors,
    recommendations,
  };
}

/**
 * Determine readiness level
 */
function determineReadiness(score: number): 'not_ready' | 'almost_ready' | 'ready' | 'highly_ready' {
  if (score >= 80) return 'highly_ready';
  if (score >= 60) return 'ready';
  if (score >= 40) return 'almost_ready';
  return 'not_ready';
}

/**
 * Generate readiness recommendations
 */
function generateReadinessRecommendations(
  readiness: string,
  factors: { leadCount: number; engagementRate: number; qualityScore: number; conversionPotential: number }
): string[] {
  const recommendations: string[] = [];

  if (factors.leadCount < 50) {
    recommendations.push('Build waitlist to at least 100 leads before launch');
  }

  if (factors.engagementRate < 50) {
    recommendations.push('Increase engagement through targeted outreach and content');
  }

  if (factors.qualityScore < 50) {
    recommendations.push('Improve lead quality through better targeting and enrichment');
  }

  if (factors.conversionPotential < 30) {
    recommendations.push('Focus on identifying and nurturing hot leads');
  }

  switch (readiness) {
    case 'highly_ready':
      recommendations.push('Excellent readiness - proceed with launch planning');
      recommendations.push('Consider launching soon while momentum is high');
      break;
    case 'ready':
      recommendations.push('Good readiness - prepare launch materials and timeline');
      recommendations.push('Focus on final engagement push before launch');
      break;
    case 'almost_ready':
      recommendations.push('Almost ready - focus on improving weak factors');
      recommendations.push('Consider a soft launch to test conversion');
      break;
    case 'not_ready':
      recommendations.push('Not ready for launch - focus on building waitlist and engagement');
      recommendations.push('Delay launch until readiness improves');
      break;
  }

  return recommendations;
}

/**
 * Batch calculate readiness scores for multiple waitlists
 */
export function batchCalculateReadiness(
  waitlistData: Array<{
    totalLeads: number;
    engagedLeads: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
  }>
): LaunchReadinessScore[] {
  return waitlistData.map(data =>
    calculateLaunchReadiness(
      data.totalLeads,
      data.engagedLeads,
      data.hotLeads,
      data.warmLeads,
      data.coldLeads
    )
  );
}

/**
 * Get readiness distribution
 */
export function getReadinessDistribution(scores: LaunchReadinessScore[]): Record<string, number> {
  const distribution = {
    highly_ready: 0,
    ready: 0,
    almost_ready: 0,
    not_ready: 0,
  };

  scores.forEach(score => {
    distribution[score.readiness]++;
  });

  return distribution;
}
