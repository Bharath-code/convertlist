/**
 * Switching Cost Calculator
 * 
 * Calculates how hard it would be for a lead to switch from a competitor.
 * Considers data migration, learning curve, integration dependencies, and pricing.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCompetitorById } from '../competitors/database';

export interface SwitchingCostFactors {
  dataMigration: 'low' | 'medium' | 'high';
  learningCurve: 'low' | 'medium' | 'high';
  integrationDependencies: 'low' | 'medium' | 'high';
  pricingDifference: 'low' | 'medium' | 'high';
  contractLockIn: 'low' | 'medium' | 'high';
}

export interface SwitchingCostAnalysis {
  overallCost: 'low' | 'medium' | 'high';
  score: number; // 0-100, where 100 is highest cost (hardest to switch)
  factors: SwitchingCostFactors;
  reasoning: string;
  recommendation: string;
  estimatedTimeToSwitch: string;
}

/**
 * Analyze switching cost for a specific lead and competitor
 */
export async function calculateSwitchingCost(
  competitorId: string,
  signupNote?: string,
  companySize?: string
): Promise<SwitchingCostAnalysis> {
  const competitor = getCompetitorById(competitorId);
  
  if (!competitor) {
    return {
      overallCost: 'medium',
      score: 50,
      factors: {
        dataMigration: 'medium',
        learningCurve: 'medium',
        integrationDependencies: 'medium',
        pricingDifference: 'medium',
        contractLockIn: 'medium',
      },
      reasoning: 'Unknown competitor - unable to assess switching cost.',
      recommendation: 'Research the competitor to better understand switching barriers.',
      estimatedTimeToSwitch: 'Unknown',
    };
  }

  // Use AI to analyze switching cost based on signup note and company context
  const aiAnalysis = await analyzeSwitchingCostWithAI(
    competitor,
    signupNote,
    companySize
  );

  return aiAnalysis;
}

/**
 * Use AI to analyze switching cost
 */
async function analyzeSwitchingCostWithAI(
  competitor: any,
  signupNote?: string,
  companySize?: string
): Promise<SwitchingCostAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze the switching cost for a user currently using ${competitor.name}.

Competitor Details:
- Name: ${competitor.name}
- Category: ${competitor.category}
- Features: ${competitor.features.join(', ')}
- Pricing: ${competitor.pricing}
- Tech Stack: ${competitor.techStack.join(', ')}

User Context:
- Signup Note: ${signupNote || 'Not provided'}
- Company Size: ${companySize || 'Not provided'}

Analyze these factors:
1. Data Migration: How hard would it be to migrate data from this competitor?
2. Learning Curve: How much learning is required to switch?
3. Integration Dependencies: How many integrations would need to be rebuilt?
4. Pricing Difference: Is our pricing significantly better or worse?
5. Contract Lock In: Are there likely contract commitments?

For each factor, return one of: low, medium, high

Then provide:
- Overall cost (low/medium/high)
- A score from 0-100 (100 = hardest to switch)
- Brief reasoning (1-2 sentences)
- A recommendation for how to approach this lead
- Estimated time to switch (e.g., "1-2 weeks", "1-2 months")

Return in JSON format with this structure:
{
  "dataMigration": "low|medium|high",
  "learningCurve": "low|medium|high",
  "integrationDependencies": "low|medium|high",
  "pricingDifference": "low|medium|high",
  "contractLockIn": "low|medium|high",
  "overallCost": "low|medium|high",
  "score": 0-100,
  "reasoning": "...",
  "recommendation": "...",
  "estimatedTimeToSwitch": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        overallCost: parsed.overallCost || 'medium',
        score: parsed.score || 50,
        factors: {
          dataMigration: parsed.dataMigration || 'medium',
          learningCurve: parsed.learningCurve || 'medium',
          integrationDependencies: parsed.integrationDependencies || 'medium',
          pricingDifference: parsed.pricingDifference || 'medium',
          contractLockIn: parsed.contractLockIn || 'medium',
        },
        reasoning: parsed.reasoning || 'Unable to generate detailed reasoning.',
        recommendation: parsed.recommendation || 'Proceed with standard outreach.',
        estimatedTimeToSwitch: parsed.estimatedTimeToSwitch || 'Unknown',
      };
    }
  } catch (error) {
    console.error('Error analyzing switching cost with AI:', error);
  }

  // Fallback to rule-based analysis
  return ruleBasedSwitchingCost(competitor, companySize);
}

/**
 * Rule-based switching cost analysis (fallback)
 */
function ruleBasedSwitchingCost(
  competitor: any,
  companySize?: string
): SwitchingCostAnalysis {
  let score = 50;
  const factors: SwitchingCostFactors = {
    dataMigration: 'medium',
    learningCurve: 'medium',
    integrationDependencies: 'medium',
    pricingDifference: 'medium',
    contractLockIn: 'medium',
  };

  // Adjust based on company size
  if (companySize?.toLowerCase().includes('enterprise') || 
      companySize?.toLowerCase().includes('large')) {
    factors.dataMigration = 'high';
    factors.integrationDependencies = 'high';
    factors.contractLockIn = 'high';
    score += 20;
  }

  // Adjust based on competitor category
  if (competitor.category === 'Email Marketing') {
    factors.dataMigration = 'low'; // Email lists are easy to migrate
    score -= 10;
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  const overallCost = score > 66 ? 'high' : score > 33 ? 'medium' : 'low';

  return {
    overallCost,
    score,
    factors,
    reasoning: `Based on competitor ${competitor.name} and company size ${companySize || 'unknown'}.`,
    recommendation: overallCost === 'high' 
      ? 'Focus on ROI and long-term benefits to justify switching cost.'
      : overallCost === 'medium'
      ? 'Highlight easy onboarding and migration support.'
      : 'Emphasize quick wins and immediate value.',
    estimatedTimeToSwitch: overallCost === 'high' 
      ? '2-3 months' 
      : overallCost === 'medium' 
      ? '1-2 months' 
      : '2-4 weeks',
  };
}

/**
 * Batch calculate switching costs for multiple leads
 */
export async function batchCalculateSwitchingCosts(
  leads: Array<{
    competitorId: string;
    signupNote?: string;
    companySize?: string;
  }>
): Promise<SwitchingCostAnalysis[]> {
  return Promise.all(
    leads.map(lead =>
      calculateSwitchingCost(lead.competitorId, lead.signupNote, lead.companySize)
    )
  );
}

/**
 * Get switching cost statistics
 */
export function getSwitchingCostStats(
  analyses: SwitchingCostAnalysis[]
): {
  lowCost: number;
  mediumCost: number;
  highCost: number;
  averageScore: number;
} {
  const lowCost = analyses.filter(a => a.overallCost === 'low').length;
  const mediumCost = analyses.filter(a => a.overallCost === 'medium').length;
  const highCost = analyses.filter(a => a.overallCost === 'high').length;
  
  const averageScore =
    analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

  return {
    lowCost,
    mediumCost,
    highCost,
    averageScore: Math.round(averageScore),
  };
}

/**
 * Determine if switching cost is acceptable for outreach
 */
export function isSwitchingCostAcceptable(
  analysis: SwitchingCostAnalysis,
  threshold: number = 60
): boolean {
  return analysis.score <= threshold;
}
