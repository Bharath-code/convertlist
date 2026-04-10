/**
 * Scoring Constants
 * Centralized magic numbers for lead scoring and segmentation
 */

export const SCORING_CONSTANTS = {
  // Readiness score thresholds
  READINESS_HIGH: 80,
  READINESS_MEDIUM: 60,
  READINESS_LOW: 40,
  
  // Lead score thresholds
  LEAD_HOT: 70,
  LEAD_WARM_HIGH: 70,
  LEAD_WARM_LOW: 50,
  LEAD_COLD: 50,
  
  // Advocate potential thresholds (0-1 range)
  ADVOCATE_SUPER: 0.8,
  ADVOCATE_STANDARD: 0.6,
  ADVOCATE_POTENTIAL: 0.4,
  
  // Confidence calculation divisors
  CONFIDENCE_LEAD_THRESHOLD: 50,
  CONFIDENCE_PRICING_THRESHOLD: 30,
  CONFIDENCE_DISCOUNT_THRESHOLD: 30,
  
  // Engagement depth normalization
  ENGAGEMENT_DEPTH_MAX: 200,
  
  // Lead count bonus threshold
  LEAD_COUNT_BONUS_THRESHOLD: 100,
  
  // Discount percentages
  DISCOUNT_HIGH: 30,
  DISCOUNT_MEDIUM: 20,
  DISCOUNT_LOW: 10,
  
  // Virality score display multiplier
  VIRALITY_MULTIPLIER: 100,
} as const;
