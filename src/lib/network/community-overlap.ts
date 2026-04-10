/**
 * Community Overlap Detection Service
 * 
 * Detects if leads are in same communities (Indie Hackers cohorts, Slack groups, etc.).
 * Analyzes signup notes and company data to identify community connections.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Community {
  name: string;
  type: 'cohort' | 'slack' | 'discord' | 'forum' | 'event' | 'other';
  memberCount: number;
  confidence: number;
}

export interface CommunityOverlap {
  communities: Community[];
  overlapCount: number;
  strongestCommunity: Community | null;
  sharedCommunities: string[];
  summary: string;
}

/**
 * Detect community mentions from signup notes using AI
 */
export async function detectCommunitiesFromNotes(
  signupNotes: string[]
): Promise<Map<string, Community[]>> {
  if (!signupNotes || signupNotes.length === 0) {
    return new Map();
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const communityMap = new Map<string, Community[]>();

  for (const note of signupNotes) {
    if (!note) continue;

    const prompt = `Analyze this signup note and extract any community mentions. Look for:
- Indie Hackers cohorts
- Slack/Discord communities
- Online forums
- Events or meetups
- Startup programs (YC, etc.)

Signup Note: "${note}"

Return ONLY a JSON array of communities with this structure:
[
  {
    "name": "Community Name",
    "type": "cohort|slack|discord|forum|event|other",
    "confidence": 0-100
  }
]

If no communities are mentioned, return an empty array: []`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const communities: Community[] = JSON.parse(jsonMatch[0]);
        communityMap.set(note, communities);
      }
    } catch (error) {
      console.error('Error detecting communities from note:', error);
      communityMap.set(note, []);
    }
  }

  return communityMap;
}

/**
 * Analyze community overlap between leads
 */
export async function analyzeCommunityOverlap(
  signupNotes: string[]
): Promise<CommunityOverlap> {
  const communityMap = await detectCommunitiesFromNotes(signupNotes);

  const allCommunities = new Map<string, Community>();

  // Collect all communities and count members
  communityMap.forEach((communities) => {
    communities.forEach(community => {
      const key = `${community.name}-${community.type}`;
      if (allCommunities.has(key)) {
        const existing = allCommunities.get(key)!;
        existing.memberCount++;
        existing.confidence = Math.max(existing.confidence, community.confidence);
      } else {
        allCommunities.set(key, {
          ...community,
          memberCount: 1,
        });
      }
    });
  });

  const communitiesArray = Array.from(allCommunities.values());
  const overlapCount = communitiesArray.filter(c => c.memberCount > 1).length;

  const strongestCommunity = communitiesArray.length > 0
    ? communitiesArray.reduce((max, c) => 
        c.memberCount * c.confidence > max.memberCount * max.confidence ? c : max
      )
    : null;

  const sharedCommunities = communitiesArray
    .filter(c => c.memberCount > 1)
    .map(c => c.name);

  const summary = generateCommunityOverlapSummary(
    overlapCount,
    strongestCommunity,
    sharedCommunities
  );

  return {
    communities: communitiesArray,
    overlapCount,
    strongestCommunity,
    sharedCommunities,
    summary,
  };
}

/**
 * Generate summary of community overlap
 */
function generateCommunityOverlapSummary(
  overlapCount: number,
  strongestCommunity: Community | null,
  sharedCommunities: string[]
): string {
  if (overlapCount === 0) {
    return 'No significant community overlap detected';
  }

  if (strongestCommunity) {
    return `Found ${overlapCount} shared communities. Strongest overlap: ${strongestCommunity.name} (${strongestCommunity.memberCount} members). Shared: ${sharedCommunities.join(', ')}`;
  }

  return `Found ${overlapCount} shared communities: ${sharedCommunities.join(', ')}`;
}

/**
 * Find leads in the same community
 */
export function findLeadsInSameCommunity(
  targetCommunity: string,
  communityMap: Map<string, Community[]>
): string[] {
  const leads: string[] = [];

  communityMap.forEach((communities, note) => {
    const inCommunity = communities.some(c => 
      c.name.toLowerCase() === targetCommunity.toLowerCase()
    );
    if (inCommunity) {
      leads.push(note);
    }
  });

  return leads;
}

/**
 * Get community strength score (0-100)
 */
export function getCommunityStrengthScore(
  community: Community
): number {
  // Score based on member count and confidence
  return Math.min(community.memberCount * 10 + community.confidence, 100);
}

/**
 * Identify community hubs (leads in multiple communities)
 */
export function identifyCommunityHubs(
  communityMap: Map<string, Community[]>
): Array<{ note: string; communityCount: number; communities: string[] }> {
  const hubs: Array<{ note: string; communityCount: number; communities: string[] }> = [];

  communityMap.forEach((communities, note) => {
    if (communities.length >= 2) {
      hubs.push({
        note,
        communityCount: communities.length,
        communities: communities.map(c => c.name),
      });
    }
  });

  return hubs.sort((a, b) => b.communityCount - a.communityCount);
}

/**
 * Detect community patterns from company domains
 */
export function detectCommunityPatternsFromDomains(
  emails: string[]
): Community[] {
  const communities: Community[] = [];
  const domainCounts = new Map<string, number>();

  emails.forEach(email => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && !domain.includes('gmail') && !domain.includes('yahoo')) {
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
  });

  // Group domains that might indicate communities
  domainCounts.forEach((count, domain) => {
    if (count >= 3) {
      communities.push({
        name: `${domain} network`,
        type: 'other',
        memberCount: count,
        confidence: 70,
      });
    }
  });

  return communities;
}
