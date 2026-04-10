/**
 * Domain Fingerprinting Service
 * 
 * Detects if a lead's company uses competitor tools via tech stack detection.
 * Analyzes company websites to identify competitor usage.
 */

import {
  findCompetitorsByTechStack,
  type Competitor,
} from './database';

export interface FingerprintResult {
  detectedCompetitors: string[];
  competitorIds: string[];
  confidence: number;
  matchedTech: string[];
}

/**
 * Normalize domain for comparison
 */
function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

/**
 * Extract domain from email
 */
export function extractDomainFromEmail(email: string): string {
  const match = email.match(/@(.+)$/);
  return match ? match[1] : '';
}

/**
 * Check if domain matches known competitor domains
 */
export function checkKnownCompetitorDomain(domain: string): string | null {
  const normalized = normalizeDomain(domain);
  
  // Import and check against known domains
  const { COMPETITOR_DATABASE } = require('./database');
  
  for (const competitor of COMPETITOR_DATABASE) {
    for (const knownDomain of competitor.knownDomains) {
      if (normalized === knownDomain || normalized.endsWith(`.${knownDomain}`)) {
        return competitor.id;
      }
    }
  }
  
  return null;
}

/**
 * Analyze tech stack to detect competitor usage
 * This uses the existing tech stack detection from enrichment
 */
export function analyzeTechStackForCompetitors(
  techStack: string[]
): FingerprintResult {
  if (!techStack || techStack.length === 0) {
    return {
      detectedCompetitors: [],
      competitorIds: [],
      confidence: 0,
      matchedTech: [],
    };
  }

  const competitors = findCompetitorsByTechStack(techStack);
  
  if (competitors.length === 0) {
    return {
      detectedCompetitors: [],
      competitorIds: [],
      confidence: 0,
      matchedTech: [],
    };
  }

  // Calculate confidence based on number of matching technologies
  const matchedTech = new Set<string>();
  competitors.forEach(competitor => {
    competitor.techStack.forEach(tech => {
      if (techStack.includes(tech)) {
        matchedTech.add(tech);
      }
    });
  });

  const confidence = Math.min(
    (matchedTech.size / techStack.length) * 100,
    100
  );

  return {
    detectedCompetitors: competitors.map(c => c.name),
    competitorIds: competitors.map(c => c.id),
    confidence,
    matchedTech: Array.from(matchedTech),
  };
}

/**
 * Full domain fingerprinting analysis
 * Combines known domain check with tech stack analysis
 */
export async function fingerprintDomain(
  email: string,
  techStack?: string[]
): Promise<FingerprintResult> {
  const domain = extractDomainFromEmail(email);
  
  // Check known competitor domains first
  const knownCompetitorId = checkKnownCompetitorDomain(domain);
  
  if (knownCompetitorId) {
    const { getCompetitorById } = require('./database');
    const competitor = getCompetitorById(knownCompetitorId);
    
    return {
      detectedCompetitors: [competitor?.name || 'Unknown'],
      competitorIds: [knownCompetitorId],
      confidence: 95, // High confidence for known domains
      matchedTech: competitor?.techStack || [],
    };
  }

  // Fall back to tech stack analysis
  if (techStack && techStack.length > 0) {
    return analyzeTechStackForCompetitors(techStack);
  }

  return {
    detectedCompetitors: [],
    competitorIds: [],
    confidence: 0,
    matchedTech: [],
  };
}

/**
 * Batch fingerprint multiple leads
 */
export async function batchFingerprintLeads(
  leads: Array<{ email: string; techStack?: string[] }>
): Promise<FingerprintResult[]> {
  return Promise.all(
    leads.map(lead => fingerprintDomain(lead.email, lead.techStack))
  );
}

/**
 * Get competitor penetration statistics
 */
export function getCompetitorPenetration(
  results: FingerprintResult[]
): Record<string, { count: number; percentage: number }> {
  const stats: Record<string, { count: number; percentage: number }> = {};
  const total = results.length;

  results.forEach(result => {
    result.detectedCompetitors.forEach(competitorName => {
      if (!stats[competitorName]) {
        stats[competitorName] = { count: 0, percentage: 0 };
      }
      stats[competitorName].count++;
    });
  });

  // Calculate percentages
  Object.keys(stats).forEach(key => {
    stats[key].percentage = (stats[key].count / total) * 100;
  });

  return stats;
}
