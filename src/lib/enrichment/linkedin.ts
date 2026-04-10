/**
 * LinkedIn Enrichment Service
 * 
 * Extracts LinkedIn profile information to find real names, current roles, and company size.
 * Uses Clearbit's social data which includes LinkedIn URLs when available.
 */

import { enrichLead } from './clearbit';

export interface LinkedInEnrichment {
  linkedinUrl?: string;
  realName?: string;
  currentRole?: string;
  company?: string;
  companySize?: string;
  confidence?: number;
}

/**
 * Extract LinkedIn information from Clearbit enrichment data
 */
export async function enrichLinkedIn(email: string): Promise<LinkedInEnrichment | null> {
  try {
    const clearbitData = await enrichLead(email);
    
    if (!clearbitData) {
      return null;
    }

    const enrichment: LinkedInEnrichment = {
      linkedinUrl: clearbitData.social?.linkedin || undefined,
      realName: clearbitData.name?.fullName || undefined,
      currentRole: clearbitData.employment?.title || undefined,
      company: clearbitData.company?.name || undefined,
      companySize: mapCompanySize(clearbitData.company?.size),
      confidence: 0.7, // Base confidence from Clearbit data
    };

    // Only return if we have at least some useful data
    if (enrichment.linkedinUrl || enrichment.realName || enrichment.currentRole) {
      return enrichment;
    }

    return null;
  } catch (error) {
    console.error(`Failed to enrich LinkedIn for ${email}:`, error);
    return null;
  }
}

/**
 * Map company size from Clearbit to readable format
 */
function mapCompanySize(size?: number): string | undefined {
  if (!size) return undefined;
  
  if (size < 10) return '1-10';
  if (size < 50) return '11-50';
  if (size < 200) return '51-200';
  if (size < 500) return '201-500';
  if (size < 1000) return '501-1000';
  if (size < 5000) return '1001-5000';
  if (size < 10000) return '5001-10000';
  return '10000+';
}

/**
 * Batch enrich multiple leads
 */
export async function enrichLinkedInBatch(emails: string[]): Promise<Map<string, LinkedInEnrichment>> {
  const results = new Map<string, LinkedInEnrichment>();

  for (const email of emails) {
    const enrichment = await enrichLinkedIn(email);
    if (enrichment) {
      results.set(email, enrichment);
    }
  }

  return results;
}
