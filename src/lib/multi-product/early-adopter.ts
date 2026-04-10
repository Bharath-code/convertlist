/**
 * Early Adopter Detection Service
 * 
 * Identifies users who consistently sign up early for new products.
 * Analyzes signup timing patterns to predict future early adoption.
 */

export interface EarlyAdopterProfile {
  userId: string;
  earlyAdopterScore: number; // 0-100
  avgSignupDelay: number; // in hours after product launch
  productSignups: number;
  pattern: 'conservative' | 'balanced' | 'aggressive' | 'pioneer';
  prediction: string;
}

/**
 * Calculate early adopter score based on signup timing
 */
export function calculateEarlyAdopterScore(
  signupDelays: number[], // hours after product launch
  totalSignups: number
): EarlyAdopterProfile {
  if (signupDelays.length === 0) {
    return {
      userId: '',
      earlyAdopterScore: 50,
      avgSignupDelay: 0,
      productSignups: totalSignups,
      pattern: 'balanced',
      prediction: 'Insufficient data to predict',
    };
  }

  const avgDelay = signupDelays.reduce((a, b) => a + b, 0) / signupDelays.length;
  
  // Score calculation: lower delay = higher score
  // 0-24 hours = 100 points
  // 24-48 hours = 80 points
  // 48-168 hours (1 week) = 60 points
  // 168-720 hours (1 month) = 40 points
  // >720 hours = 20 points
  let baseScore = 20;
  if (avgDelay < 24) baseScore = 100;
  else if (avgDelay < 48) baseScore = 80;
  else if (avgDelay < 168) baseScore = 60;
  else if (avgDelay < 720) baseScore = 40;

  // Bonus for multiple product signups
  const signupBonus = Math.min(totalSignups * 5, 25);
  const earlyAdopterScore = Math.min(baseScore + signupBonus, 100);

  const pattern = determinePattern(avgDelay, totalSignups);
  const prediction = generatePrediction(pattern, earlyAdopterScore);

  return {
    userId: '',
    earlyAdopterScore,
    avgSignupDelay: avgDelay,
    productSignups: totalSignups,
    pattern,
    prediction,
  };
}

/**
 * Determine early adopter pattern
 */
function determinePattern(avgDelay: number, totalSignups: number): 'conservative' | 'balanced' | 'aggressive' | 'pioneer' {
  if (avgDelay < 24 && totalSignups >= 2) return 'pioneer';
  if (avgDelay < 48) return 'aggressive';
  if (avgDelay < 168) return 'balanced';
  return 'conservative';
}

/**
 * Generate prediction for future behavior
 */
function generatePrediction(pattern: string, score: number): string {
  if (score >= 80) {
    return `Highly likely to sign up early for new products. ${pattern} early adopter with strong engagement pattern.`;
  } else if (score >= 60) {
    return `Likely to sign up early for new products. ${pattern} approach to new features.`;
  } else if (score >= 40) {
    return `May sign up early depending on product relevance. ${pattern} adoption pattern.`;
  }
  return `Unlikely to sign up early. Conservative adoption pattern.`;
}

/**
 * Batch analyze early adopter profiles
 */
export function batchAnalyzeEarlyAdopters(
  userData: Array<{
    userId: string;
    signupDelays: number[];
    totalSignups: number;
  }>
): EarlyAdopterProfile[] {
  return userData.map(data => ({
    ...calculateEarlyAdopterScore(data.signupDelays, data.totalSignups),
    userId: data.userId,
  }));
}

/**
 * Identify top early adopters
 */
export function identifyTopEarlyAdopters(
  profiles: EarlyAdopterProfile[],
  threshold: number = 70
): EarlyAdopterProfile[] {
  return profiles
    .filter(p => p.earlyAdopterScore >= threshold)
    .sort((a, b) => b.earlyAdopterScore - a.earlyAdopterScore);
}

/**
 * Get early adopter distribution
 */
export function getEarlyAdopterDistribution(
  profiles: EarlyAdopterProfile[]
): Record<string, number> {
  const distribution = {
    pioneer: 0,
    aggressive: 0,
    balanced: 0,
    conservative: 0,
  };

  profiles.forEach(profile => {
    distribution[profile.pattern]++;
  });

  return distribution;
}

/**
 * Predict signup timing for new product launch
 */
export function predictSignupTiming(
  profile: EarlyAdopterProfile
): {
  expectedSignupWindow: string;
  confidence: number;
  recommendation: string;
} {
  let expectedSignupWindow = '';
  let confidence = 0;
  let recommendation = '';

  switch (profile.pattern) {
    case 'pioneer':
      expectedSignupWindow = 'Within 24 hours of launch';
      confidence = 90;
      recommendation = 'Send launch announcement immediately at launch';
      break;
    case 'aggressive':
      expectedSignupWindow = 'Within 48 hours of launch';
      confidence = 80;
      recommendation = 'Send launch announcement at launch, follow up after 24 hours';
      break;
    case 'balanced':
      expectedSignupWindow = 'Within 1 week of launch';
      confidence = 70;
      recommendation = 'Send launch announcement, follow up after 3 days';
      break;
    case 'conservative':
      expectedSignupWindow = 'After 1 week of launch';
      confidence = 60;
      recommendation = 'Wait for social proof, then send targeted announcement';
      break;
  }

  return {
    expectedSignupWindow,
    confidence,
    recommendation,
  };
}
