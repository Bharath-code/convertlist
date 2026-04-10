/**
 * Network-Based Outreach Generation
 * 
 * Generates outreach templates leveraging network connections.
 * Uses AI to create personalized messaging based on network relationships.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CompanyRelationshipAnalysis } from '../network/company-relationships';
import type { CommunityOverlap } from '../network/community-overlap';
import type { InfluenceScore } from '../network/influence-score';

export interface NetworkOutreachTemplate {
  subject: string;
  body: string;
  connectionType: string;
  personalization: string;
  callToAction: string;
}

export interface NetworkOutreachRequest {
  leadName?: string;
  leadCompany?: string;
  signupNote?: string;
  companyRelationships: CompanyRelationshipAnalysis;
  communityOverlap: CommunityOverlap;
  influenceScore: InfluenceScore;
  productName: string;
  productBenefits: string[];
}

/**
 * Generate network-based outreach template
 */
export async function generateNetworkOutreach(
  request: NetworkOutreachRequest
): Promise<NetworkOutreachTemplate> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const connectionSummary = buildConnectionSummary(
    request.companyRelationships,
    request.communityOverlap,
    request.influenceScore
  );

  const prompt = `Generate a personalized cold email outreach leveraging network connections.

Context:
- Lead Name: ${request.leadName || 'Not provided'}
- Lead Company: ${request.leadCompany || 'Not provided'}
- Signup Note: ${request.signupNote || 'Not provided'}
- Our Product: ${request.productName}
- Our Benefits: ${request.productBenefits.join(', ')}

Network Connections:
${connectionSummary}

Generate an email that:
1. Mentions the network connection (same company, community, etc.)
2. Leverages the social proof from connections
3. Highlights how ${request.productName} helps people in their network
4. Has a clear, compelling call to action

Return in JSON format with this structure:
{
  "subject": "Email subject line",
  "body": "Full email body with personalization",
  "connectionType": "Type of connection (e.g., 'same company', 'community member', 'influencer')",
  "personalization": "How the network connection is mentioned",
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
        connectionType: parsed.connectionType || 'network',
        personalization: parsed.personalization || '',
        callToAction: parsed.callToAction || '',
      };
    }
  } catch (error) {
    console.error('Error generating network outreach:', error);
  }

  // Fallback to template-based approach
  return generateFallbackOutreach(request);
}

/**
 * Build connection summary for AI context
 */
function buildConnectionSummary(
  companyRelationships: CompanyRelationshipAnalysis,
  communityOverlap: CommunityOverlap,
  influenceScore: InfluenceScore
): string {
  const parts: string[] = [];

  if (companyRelationships.relationshipCount > 0) {
    parts.push(`Connected to ${companyRelationships.relationshipCount} other lead(s) through company relationships`);
    if (companyRelationships.strongestRelationship) {
      parts.push(`Strongest relationship: ${companyRelationships.strongestRelationship.description}`);
    }
  }

  if (communityOverlap.overlapCount > 0) {
    parts.push(`Member of ${communityOverlap.overlapCount} shared communities: ${communityOverlap.sharedCommunities.join(', ')}`);
  }

  if (influenceScore.score > 60) {
    parts.push(`High influence score (${influenceScore.score}): ${influenceScore.summary}`);
  }

  return parts.length > 0 ? parts.join('. ') : 'No significant network connections detected';
}

/**
 * Fallback template-based outreach generation
 */
function generateFallbackOutreach(
  request: NetworkOutreachRequest
): NetworkOutreachTemplate {
  const { leadName, productName, productBenefits } = request;
  const { companyRelationships, communityOverlap, influenceScore } = request;

  let connectionType = 'network';
  let personalization = '';
  
  if (companyRelationships.relationshipCount > 0) {
    connectionType = 'company connections';
    personalization = `I noticed you're connected to ${companyRelationships.relationshipCount} other people in our network who are also interested in ${productName}.`;
  } else if (communityOverlap.overlapCount > 0) {
    connectionType = 'community member';
    personalization = `I see you're part of ${communityOverlap.sharedCommunities.join(', ')}, where several members have found value in ${productName}.`;
  } else if (influenceScore.score > 60) {
    connectionType = 'influencer';
    personalization = `Given your strong network presence, I thought you might be interested in ${productName}.`;
  }

  const subject = connectionType === 'influencer'
    ? `${productName} for influential leaders like you`
    : `${productName} - recommended by your network`;

  const body = `Hi ${leadName || 'there'},

${personalization}

${productBenefits.slice(0, 3).map((benefit, i) => `${i + 1}. ${benefit}`).join('\n')}

Many people in your network have already found value in ${productName}. I'd love to show you how it could work for you too.

Best`;

  return {
    subject,
    body,
    connectionType,
    personalization,
    callToAction: "Would you be open to a quick chat?",
  };
}

/**
 * Generate outreach for multiple leads with network context
 */
export async function generateBatchNetworkOutreach(
  requests: NetworkOutreachRequest[]
): Promise<NetworkOutreachTemplate[]> {
  return Promise.all(
    requests.map(request => generateNetworkOutreach(request))
  );
}

/**
 * Get warm intro suggestion
 */
export function getWarmIntroSuggestion(
  request: NetworkOutreachRequest
): { suggestedLead: string | null; reason: string } {
  const { companyRelationships, communityOverlap, influenceScore } = request;

  // If they're connected to someone with high influence
  if (influenceScore.score > 70) {
    return {
      suggestedLead: request.leadName || 'this lead',
      reason: 'High influence score - they could introduce you to others in their network',
    };
  }

  // If they share communities with others
  if (communityOverlap.overlapCount > 0 && communityOverlap.strongestCommunity) {
    return {
      suggestedLead: request.leadName || 'this lead',
      reason: `Shared community (${communityOverlap.strongestCommunity.name}) - good for warm intros to other members`,
    };
  }

  // If they have company relationships
  if (companyRelationships.relationshipCount > 0) {
    return {
      suggestedLead: request.leadName || 'this lead',
      reason: `Connected to ${companyRelationships.relationshipCount} others through company relationships`,
    };
  }

  return {
    suggestedLead: null,
    reason: 'No strong network connections for warm intro',
  };
}
