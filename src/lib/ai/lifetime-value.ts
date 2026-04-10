/**
 * Lifetime Value Prediction Service
 * 
 * Predicts lifetime value (LTV) based on multi-product behavior and engagement.
 * Uses AI to estimate long-term revenue potential.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CrossProductBehavior } from '../multi-product/behavior';
import type { EarlyAdopterProfile } from '../multi-product/early-adopter';

export interface LifetimeValuePrediction {
  predictedLTV: number; // in dollars
  confidence: number; // 0-100
  timeframe: string; // e.g., "12 months"
  factors: {
    productCount: number;
    conversionRate: number;
    earlyAdopterScore: number;
    engagementScore: number;
  };
  tier: 'low' | 'medium' | 'high' | 'whale';
  recommendation: string;
}

/**
 * Predict lifetime value using AI
 */
export async function predictLifetimeValue(
  crossProductBehavior: CrossProductBehavior,
  earlyAdopterProfile: EarlyAdopterProfile,
  averageRevenuePerProduct: number = 100
): Promise<LifetimeValuePrediction> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Predict the lifetime value (LTV) for a customer based on their behavior.

Context:
- Total Products: ${crossProductBehavior.totalProducts}
- Conversion Rate: ${crossProductBehavior.conversionRate.toFixed(1)}%
- Average Time to Convert: ${crossProductBehavior.avgTimeToConvert.toFixed(0)} hours
- Early Adopter Score: ${earlyAdopterProfile.earlyAdopterScore}
- Pattern: ${earlyAdopterProfile.pattern}
- Average Revenue Per Product: $${averageRevenuePerProduct}

Analyze this customer's behavior and predict their lifetime value over 12 months. Consider:
1. Multi-product engagement (more products = higher LTV)
2. Early adoption (early adopters tend to stay longer)
3. Conversion speed (faster conversion = higher engagement)
4. Pattern consistency

Return in JSON format with this structure:
{
  "predictedLTV": number (total revenue in dollars),
  "confidence": number (0-100),
  "timeframe": string (e.g., "12 months"),
  "factors": {
    "productCount": number (0-100 score),
    "conversionRate": number (0-100 score),
    "earlyAdopterScore": number (0-100 score),
    "engagementScore": number (0-100 score)
  },
  "recommendation": string (strategic recommendation)
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const tier = determineLTVTier(parsed.predictedLTV);
      
      return {
        predictedLTV: parsed.predictedLTV,
        confidence: parsed.confidence || 70,
        timeframe: parsed.timeframe || '12 months',
        factors: parsed.factors || {
          productCount: 0,
          conversionRate: 0,
          earlyAdopterScore: 0,
          engagementScore: 0,
        },
        tier,
        recommendation: parsed.recommendation || 'Standard engagement strategy',
      };
    }
  } catch (error) {
    console.error('Error predicting lifetime value:', error);
  }

  // Fallback to rule-based prediction
  return ruleBasedLifetimeValue(
    crossProductBehavior,
    earlyAdopterProfile,
    averageRevenuePerProduct
  );
}

/**
 * Rule-based lifetime value prediction (fallback)
 */
function ruleBasedLifetimeValue(
  crossProductBehavior: CrossProductBehavior,
  earlyAdopterProfile: EarlyAdopterProfile,
  averageRevenuePerProduct: number
): LifetimeValuePrediction {
  // Base LTV calculation
  let predictedLTV = crossProductBehavior.totalProducts * averageRevenuePerProduct * 2; // 2x multiplier for multi-product
  
  // Early adopter bonus
  if (earlyAdopterProfile.earlyAdopterScore > 80) {
    predictedLTV *= 1.5;
  } else if (earlyAdopterProfile.earlyAdopterScore > 60) {
    predictedLTV *= 1.2;
  }
  
  // Conversion rate bonus
  if (crossProductBehavior.conversionRate > 80) {
    predictedLTV *= 1.3;
  } else if (crossProductBehavior.conversionRate > 50) {
    predictedLTV *= 1.1;
  }

  const factors = {
    productCount: Math.min(crossProductBehavior.totalProducts * 20, 100),
    conversionRate: crossProductBehavior.conversionRate,
    earlyAdopterScore: earlyAdopterProfile.earlyAdopterScore,
    engagementScore: Math.round((crossProductBehavior.conversionRate + earlyAdopterProfile.earlyAdopterScore) / 2),
  };

  const tier = determineLTVTier(predictedLTV);
  const recommendation = generateLTVRecommendation(tier, factors);

  return {
    predictedLTV: Math.round(predictedLTV),
    confidence: 70,
    timeframe: '12 months',
    factors,
    tier,
    recommendation,
  };
}

/**
 * Determine LTV tier
 */
function determineLTVTier(ltv: number): 'low' | 'medium' | 'high' | 'whale' {
  if (ltv >= 1000) return 'whale';
  if (ltv >= 500) return 'high';
  if (ltv >= 200) return 'medium';
  return 'low';
}

/**
 * Generate LTV recommendation
 */
function generateLTVRecommendation(
  tier: string,
  factors: { productCount: number; conversionRate: number; earlyAdopterScore: number; engagementScore: number }
): string {
  const tierRecommendations = {
    whale: 'High-value customer - prioritize with dedicated account management and exclusive access',
    high: 'Valuable customer - provide premium support and early access to new features',
    medium: 'Standard value - focus on retention and upsell opportunities',
    low: 'Lower value - optimize for efficiency and automated engagement',
  };

  let recommendation = tierRecommendations[tier as keyof typeof tierRecommendations];

  const strongFactors: string[] = [];
  if (factors.productCount > 70) strongFactors.push('high multi-product engagement');
  if (factors.earlyAdopterScore > 70) strongFactors.push('strong early adopter behavior');
  if (factors.engagementScore > 70) strongFactors.push('high engagement score');

  if (strongFactors.length > 0) {
    recommendation += `. Notable for: ${strongFactors.join(', ')}.`;
  }

  return recommendation;
}

/**
 * Batch predict lifetime values for multiple users
 */
export async function batchPredictLifetimeValues(
  userData: Array<{
    crossProductBehavior: CrossProductBehavior;
    earlyAdopterProfile: EarlyAdopterProfile;
  }>,
  averageRevenuePerProduct: number = 100
): Promise<LifetimeValuePrediction[]> {
  return Promise.all(
    userData.map(data =>
      predictLifetimeValue(
        data.crossProductBehavior,
        data.earlyAdopterProfile,
        averageRevenuePerProduct
      )
    )
  );
}

/**
 * Get LTV tier distribution
 */
export function getLTVDistribution(
  predictions: LifetimeValuePrediction[]
): Record<string, number> {
  const distribution = {
    whale: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  predictions.forEach(prediction => {
    distribution[prediction.tier]++;
  });

  return distribution;
}

/**
 * Identify high-LTV users
 */
export function identifyHighLTVUsers(
  predictions: LifetimeValuePrediction[],
  threshold: number = 500
): LifetimeValuePrediction[] {
  return predictions
    .filter(p => p.predictedLTV >= threshold)
    .sort((a, b) => b.predictedLTV - a.predictedLTV);
}
