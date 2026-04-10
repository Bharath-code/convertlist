/**
 * Competitor-Specific Outreach Generation
 * 
 * Generates outreach templates addressing why to switch from specific competitors.
 * Uses AI to create personalized messaging based on competitor analysis.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCompetitorById } from '../competitors/database';
import type { SwitchingCostAnalysis } from './switching-cost';

export interface CompetitorOutreachTemplate {
  subject: string;
  body: string;
  competitorName: string;
  switchingDifficulty: 'easy' | 'medium' | 'hard';
  keyDifferentiators: string[];
  callToAction: string;
}

export interface CompetitorOutreachRequest {
  competitorId: string;
  leadName?: string;
  leadCompany?: string;
  signupNote?: string;
  switchingCostAnalysis?: SwitchingCostAnalysis;
  productName: string;
  productBenefits: string[];
}

/**
 * Generate competitor-specific outreach template
 */
export async function generateCompetitorOutreach(
  request: CompetitorOutreachRequest
): Promise<CompetitorOutreachTemplate> {
  const competitor = getCompetitorById(request.competitorId);
  
  if (!competitor) {
    throw new Error(`Competitor ${request.competitorId} not found`);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const switchingDifficulty = request.switchingCostAnalysis
    ? request.switchingCostAnalysis.overallCost === 'low'
      ? 'easy'
      : request.switchingCostAnalysis.overallCost === 'medium'
      ? 'medium'
      : 'hard'
    : 'medium';

  const prompt = `Generate a personalized cold email outreach for someone currently using ${competitor.name}.

Context:
- Lead Name: ${request.leadName || 'Not provided'}
- Lead Company: ${request.leadCompany || 'Not provided'}
- Signup Note: ${request.signupNote || 'Not provided'}
- Competitor: ${competitor.name}
- Competitor Category: ${competitor.category}
- Competitor Features: ${competitor.features.join(', ')}
- Competitor Pricing: ${competitor.pricing}
- Our Product: ${request.productName}
- Our Benefits: ${request.productBenefits.join(', ')}
- Switching Difficulty: ${switchingDifficulty}

Generate an email that:
1. Acknowledges they're using ${competitor.name}
2. Highlights why ${request.productName} is better
3. Addresses potential switching concerns based on difficulty
4. Includes specific differentiators
5. Has a clear, compelling call to action

Return in JSON format with this structure:
{
  "subject": "Email subject line",
  "body": "Full email body with personalization",
  "competitorName": "${competitor.name}",
  "switchingDifficulty": "easy|medium|hard",
  "keyDifferentiators": ["differentiator1", "differentiator2", "differentiator3"],
  "callToAction": "Specific CTA text"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subject: parsed.subject || '',
        body: parsed.body || '',
        competitorName: parsed.competitorName || competitor.name,
        switchingDifficulty: parsed.switchingDifficulty || switchingDifficulty,
        keyDifferentiators: parsed.keyDifferentiators || [],
        callToAction: parsed.callToAction || '',
      };
    }
  } catch (error) {
    console.error('Error generating competitor outreach:', error);
  }

  // Fallback to template-based approach
  return generateFallbackOutreach(request, competitor, switchingDifficulty);
}

/**
 * Fallback template-based outreach generation
 */
function generateFallbackOutreach(
  request: CompetitorOutreachRequest,
  competitor: any,
  switchingDifficulty: 'easy' | 'medium' | 'hard'
): CompetitorOutreachTemplate {
  const { leadName, productName, productBenefits } = request;

  const subject = switchingDifficulty === 'easy'
    ? `Quick switch from ${competitor.name} to ${productName}`
    : switchingDifficulty === 'medium'
    ? `Why teams are switching from ${competitor.name} to ${productName}`
    : `Making the switch from ${competitor.name} worth it`;

  const switchingMessage = switchingDifficulty === 'easy'
    ? "The transition is simple and can be done in under an hour."
    : switchingDifficulty === 'medium'
    ? "We'll help you migrate your data and get set up smoothly."
    : "While the transition takes some effort, the long-term benefits make it worthwhile.";

  const body = `Hi ${leadName || 'there'},

I noticed you're currently using ${competitor.name}. I wanted to reach out because many teams are making the switch to ${productName}.

${productBenefits.slice(0, 3).map((benefit, i) => `${i + 1}. ${benefit}`).join('\n')}

${switchingMessage}

Would you be open to a quick chat about how ${productName} could work for you?

Best`;

  return {
    subject,
    body,
    competitorName: competitor.name,
    switchingDifficulty,
    keyDifferentiators: productBenefits.slice(0, 3),
    callToAction: "Would you be open to a quick chat?",
  };
}

/**
 * Generate outreach for multiple competitors
 */
export async function generateBatchCompetitorOutreach(
  requests: CompetitorOutreachRequest[]
): Promise<CompetitorOutreachTemplate[]> {
  return Promise.all(
    requests.map(request => generateCompetitorOutreach(request))
  );
}

/**
 * Get switching difficulty message
 */
export function getSwitchingDifficultyMessage(
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  switch (difficulty) {
    case 'easy':
      return 'The transition is simple and can be done quickly.';
    case 'medium':
      return 'We provide migration support to make the switch smooth.';
    case 'hard':
      return 'While the transition requires effort, the long-term ROI makes it worthwhile.';
  }
}

/**
 * Generate competitor comparison table
 */
export function generateCompetitorComparison(
  competitorId: string,
  ourProduct: string,
  ourBenefits: string[]
): string {
  const competitor = getCompetitorById(competitorId);
  if (!competitor) return '';

  let comparison = `| Feature | ${competitor.name} | ${ourProduct} |\n`;
  comparison += '|---------|---------------|-----------|\n';

  competitor.features.forEach((feature, index) => {
    const ourBenefit = ourBenefits[index] || '✓';
    comparison += `| ${feature} | ✓ | ${ourBenefit} |\n`;
  });

  // Add unique benefits
  ourBenefits.slice(competitor.features.length).forEach(benefit => {
    comparison += `| ${benefit} | ✗ | ✓ |\n`;
  });

  return comparison;
}
