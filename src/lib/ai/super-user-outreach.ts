/**
 * Super-User Outreach Generation
 * 
 * Generates personalized outreach for super-users based on their tier and behavior.
 * Uses AI to create VIP treatment messaging.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SuperUserScore } from '../multi-product/super-user';
import type { LifetimeValuePrediction } from './lifetime-value';

export interface SuperUserOutreachTemplate {
  subject: string;
  body: string;
  tier: string;
  perks: string[];
  callToAction: string;
}

export interface SuperUserOutreachRequest {
  userName?: string;
  userEmail?: string;
  superUserScore: SuperUserScore;
  lifetimeValuePrediction: LifetimeValuePrediction;
  productName: string;
  availablePerks?: string[];
}

/**
 * Generate super-user outreach template
 */
export async function generateSuperUserOutreach(
  request: SuperUserOutreachRequest
): Promise<SuperUserOutreachTemplate> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const tierPerks = getTierPerks(request.superUserScore.tier, request.availablePerks);

  const prompt = `Generate a VIP outreach email for a super-user.

Context:
- User Name: ${request.userName || 'Not provided'}
- User Email: ${request.userEmail || 'Not provided'}
- Super-User Tier: ${request.superUserScore.tier}
- Super-User Score: ${request.superUserScore.superUserScore}
- Predicted LTV: $${request.lifetimeValuePrediction.predictedLTV}
- Our Product: ${request.productName}
- Available Perks: ${tierPerks.join(', ')}

Generate an email that:
1. Acknowledges their super-user status
2. Highlights exclusive perks for their tier
3. Emphasizes how much we value their engagement
4. Has a clear, compelling call to action

Return in JSON format with this structure:
{
  "subject": "Email subject line",
  "body": "Full email body with personalization",
  "tier": "${request.superUserScore.tier}",
  "perks": ["perk1", "perk2", "perk3"],
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
        tier: parsed.tier || request.superUserScore.tier,
        perks: parsed.perks || tierPerks,
        callToAction: parsed.callToAction || '',
      };
    }
  } catch (error) {
    console.error('Error generating super-user outreach:', error);
  }

  // Fallback to template-based approach
  return generateFallbackSuperUserOutreach(request, tierPerks);
}

/**
 * Get tier-specific perks
 */
function getTierPerks(tier: string, customPerks?: string[]): string[] {
  if (customPerks && customPerks.length > 0) return customPerks;

  const tierPerks: Record<string, string[]> = {
    diamond: [
      'Lifetime access to all features',
      'Priority support 24/7',
      'Exclusive beta access',
      'Dedicated account manager',
      'Custom integrations',
    ],
    platinum: [
      'Priority support',
      'Early access to new features',
      'Exclusive webinars',
      'Custom reports',
    ],
    gold: [
      'Priority support',
      'Early access to new features',
      'Exclusive content',
    ],
    silver: [
      'Early access to new features',
      'Community recognition',
    ],
    bronze: [
      'Community access',
      'Product updates',
    ],
  };

  return tierPerks[tier] || tierPerks.bronze;
}

/**
 * Fallback template-based super-user outreach
 */
function generateFallbackSuperUserOutreach(
  request: SuperUserOutreachRequest,
  perks: string[]
): SuperUserOutreachTemplate {
  const { userName, productName, superUserScore, lifetimeValuePrediction } = request;

  const tierSubjectPrefix = {
    diamond: '🔷 Diamond VIP Access',
    platinum: '💎 Platinum VIP Access',
    gold: '🥇 Gold VIP Access',
    silver: '🥈 Silver VIP Access',
    bronze: '🥉 Bronze VIP Access',
  };

  const subject = `${tierSubjectPrefix[superUserScore.tier as keyof typeof tierSubjectPrefix]} - Exclusive ${productName} Perks`;

  const body = `Hi ${userName || 'there'},

Congratulations! You've achieved ${superUserScore.tier} super-user status with ${productName}.

Your super-user score: ${superUserScore.superUserScore}/100

As a ${superUserScore.tier} member, you now have access to these exclusive perks:
${perks.map((perk, i) => `${i + 1}. ${perk}`).join('\n')}

We truly value your engagement and loyalty. Your predicted lifetime value of $${lifetimeValuePrediction.predictedLTV} shows just how important you are to us.

We'd love to hear your feedback and ensure you're getting the most out of ${productName}.

Best`;

  return {
    subject,
    body,
    tier: superUserScore.tier,
    perks,
    callToAction: "Let's schedule a call to discuss your VIP benefits",
  };
}

/**
 * Batch generate super-user outreach
 */
export async function batchGenerateSuperUserOutreach(
  requests: SuperUserOutreachRequest[]
): Promise<SuperUserOutreachTemplate[]> {
  return Promise.all(
    requests.map(request => generateSuperUserOutreach(request))
  );
}
