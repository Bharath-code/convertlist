/**
 * Launch Date Recommendation Service
 * 
 * Uses AI to recommend optimal launch dates based on engagement patterns and seasonality.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LaunchReadinessScore } from '../launch/readiness';

export interface LaunchDateRecommendation {
  recommendedDate: Date;
  confidence: number; // 0-100
  reasoning: string;
  alternativeDates: Array<{ date: Date; reason: string }>;
}

/**
 * Recommend optimal launch date using AI
 */
export async function recommendLaunchDate(
  readinessScore: LaunchReadinessScore,
  currentSeason: string,
  targetAudience: string
): Promise<LaunchDateRecommendation> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Recommend an optimal launch date based on the following information:

Context:
- Launch Readiness Score: ${readinessScore.score}/100 (${readinessScore.readiness})
- Current Season: ${currentSeason}
- Target Audience: ${targetAudience}
- Lead Count Factor: ${readinessScore.factors.leadCount.toFixed(0)}
- Engagement Rate: ${readinessScore.factors.engagementRate.toFixed(1)}%
- Quality Score: ${readinessScore.factors.qualityScore.toFixed(1)}%
- Conversion Potential: ${readinessScore.factors.conversionPotential.toFixed(1)}%

Recommend an optimal launch date (within the next 3 months) considering:
1. Seasonal patterns for ${targetAudience}
2. Current readiness level
3. Engagement momentum
4. Avoiding major holidays or events that might distract

Return in JSON format with this structure:
{
  "recommendedDate": "YYYY-MM-DD",
  "confidence": number (0-100),
  "reasoning": "string explaining why this date is optimal",
  "alternativeDates": [
    {"date": "YYYY-MM-DD", "reason": "why this is a good alternative"}
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recommendedDate: new Date(parsed.recommendedDate),
        confidence: parsed.confidence || 70,
        reasoning: parsed.reasoning || 'Based on engagement patterns',
        alternativeDates: (parsed.alternativeDates || []).map((d: any) => ({
          date: new Date(d.date),
          reason: d.reason,
        })),
      };
    }
  } catch (error) {
    console.error('Error recommending launch date:', error);
  }

  // Fallback to rule-based approach
  return ruleBasedLaunchDateRecommendation(readinessScore);
}

/**
 * Rule-based launch date recommendation (fallback)
 */
function ruleBasedLaunchDateRecommendation(
  readinessScore: LaunchReadinessScore
): LaunchDateRecommendation {
  const now = new Date();
  let recommendedDate = new Date(now);
  let confidence = 70;
  let reasoning = '';

  if (readinessScore.readiness === 'highly_ready') {
    // Launch within 2 weeks if highly ready
    recommendedDate.setDate(now.getDate() + 14);
    confidence = 85;
    reasoning = 'High readiness score suggests optimal timing for immediate launch';
  } else if (readinessScore.readiness === 'ready') {
    // Launch within 4 weeks if ready
    recommendedDate.setDate(now.getDate() + 28);
    confidence = 75;
    reasoning = 'Good readiness - gives time for final preparations';
  } else if (readinessScore.readiness === 'almost_ready') {
    // Launch within 8 weeks to improve readiness
    recommendedDate.setDate(now.getDate() + 56);
    confidence = 60;
    reasoning = 'Needs more time to improve readiness factors';
  } else {
    // Launch in 12 weeks to build waitlist
    recommendedDate.setDate(now.getDate() + 84);
    confidence = 50;
    reasoning = 'Not ready - extended timeline to build engagement';
  }

  // Avoid weekends
  while (recommendedDate.getDay() === 0 || recommendedDate.getDay() === 6) {
    recommendedDate.setDate(recommendedDate.getDate() + 1);
  }

  const alternativeDates = [
    {
      date: new Date(recommendedDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      reason: 'One week later as backup option',
    },
  ];

  // Only add earlier alternative if it's still in the future
  const earlierDate = new Date(recommendedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (earlierDate > now) {
    alternativeDates.push({
      date: earlierDate,
      reason: 'One week earlier if preparation completes early',
    });
  }

  return {
    recommendedDate,
    confidence,
    reasoning,
    alternativeDates,
  };
}
