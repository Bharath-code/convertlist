/**
 * Feature Gap Analysis Service
 * 
 * Analyzes signup notes for features mentioned that competitors don't have.
 * Identifies unique value propositions and differentiation opportunities.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCompetitorById, getAllCompetitorIds } from '../competitors/database';

export interface FeatureGap {
  feature: string;
  mentionedBy: number; // Number of leads mentioning this feature
  competitorHasIt: Record<string, boolean>; // Which competitors have this feature
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface FeatureGapAnalysis {
  gaps: FeatureGap[];
  summary: string;
  topGaps: FeatureGap[];
  recommendations: string[];
}

/**
 * Extract features mentioned in signup notes
 */
export async function extractFeaturesFromNotes(
  signupNotes: string[]
): Promise<string[]> {
  if (!signupNotes || signupNotes.length === 0) {
    return [];
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze these signup notes and extract specific features or capabilities that users are looking for. Return only a comma-separated list of unique features.

Signup Notes:
${signupNotes.join('\n')}

Return format: feature1, feature2, feature3`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);
  } catch (error) {
    console.error('Error extracting features from notes:', error);
    return [];
  }
}

/**
 * Check if a competitor has a specific feature
 */
export function checkCompetitorHasFeature(
  competitorId: string,
  feature: string
): boolean {
  const competitor = getCompetitorById(competitorId);
  if (!competitor) {
    return false;
  }

  const featureLower = feature.toLowerCase();
  return competitor.features.some(
    f => f.toLowerCase().includes(featureLower) || featureLower.includes(f.toLowerCase())
  );
}

/**
 * Analyze feature gaps across all competitors
 */
export async function analyzeFeatureGaps(
  signupNotes: string[]
): Promise<FeatureGapAnalysis> {
  const features = await extractFeaturesFromNotes(signupNotes);
  const competitorIds = getAllCompetitorIds();

  const gaps: FeatureGap[] = [];

  for (const feature of features) {
    const competitorHasIt: Record<string, boolean> = {};
    let competitorsWithoutFeature = 0;

    for (const competitorId of competitorIds) {
      const hasIt = checkCompetitorHasFeature(competitorId, feature);
      competitorHasIt[competitorId] = hasIt;
      if (!hasIt) {
        competitorsWithoutFeature++;
      }
    }

    // Count how many leads mentioned this feature
    const mentionedBy = signupNotes.filter(note =>
      note.toLowerCase().includes(feature.toLowerCase())
    ).length;

    // Calculate priority based on mention frequency and competitor gap
    const priority =
      mentionedBy > 3 && competitorsWithoutFeature > competitorIds.length / 2
        ? 'high'
        : mentionedBy > 1 && competitorsWithoutFeature > 0
        ? 'medium'
        : 'low';

    gaps.push({
      feature,
      mentionedBy,
      competitorHasIt,
      priority,
      description: `${mentionedBy} leads mentioned this feature. ${competitorsWithoutFeature} out of ${competitorIds.length} competitors don't have it.`,
    });
  }

  // Sort by priority and mention count
  gaps.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.mentionedBy - a.mentionedBy;
  });

  const topGaps = gaps.filter(g => g.priority === 'high').slice(0, 5);

  // Generate summary and recommendations
  const summary = generateGapSummary(gaps);
  const recommendations = generateRecommendations(topGaps);

  return {
    gaps,
    summary,
    topGaps,
    recommendations,
  };
}

/**
 * Generate a summary of feature gaps
 */
function generateGapSummary(gaps: FeatureGap[]): string {
  const highPriorityGaps = gaps.filter(g => g.priority === 'high').length;
  const totalGaps = gaps.length;

  if (totalGaps === 0) {
    return 'No significant feature gaps detected in the signup notes.';
  }

  return `Found ${totalGaps} potential feature gaps, with ${highPriorityGaps} high-priority opportunities. These represent features that leads are requesting but competitors don't offer.`;
}

/**
 * Generate actionable recommendations based on feature gaps
 */
function generateRecommendations(gaps: FeatureGap[]): string[] {
  const recommendations: string[] = [];

  gaps.forEach(gap => {
    if (gap.priority === 'high') {
      recommendations.push(
        `Prioritize building "${gap.feature}" - ${gap.mentionedBy} leads mentioned it and competitors don't offer it.`
      );
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('Focus on the unique features that differentiate your product from competitors.');
  }

  return recommendations;
}

/**
 * Get feature gaps for a specific competitor
 */
export function getGapsForCompetitor(
  competitorId: string,
  gaps: FeatureGap[]
): FeatureGap[] {
  return gaps.filter(gap => !gap.competitorHasIt[competitorId]);
}

/**
 * Calculate competitive advantage score based on feature gaps
 */
export function calculateCompetitiveAdvantageScore(
  gaps: FeatureGap[]
): number {
  if (gaps.length === 0) {
    return 0;
  }

  const highPriorityCount = gaps.filter(g => g.priority === 'high').length;
  const mediumPriorityCount = gaps.filter(g => g.priority === 'medium').length;

  // Score out of 100
  const score = Math.min(
    (highPriorityCount * 20) + (mediumPriorityCount * 10),
    100
  );

  return score;
}
