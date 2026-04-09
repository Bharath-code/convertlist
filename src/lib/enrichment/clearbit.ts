/**
 * Clearbit Integration for Lead Enrichment
 * 
 * Enriches lead data with company information, social profiles, and more.
 * This helps founders prioritize who to contact first.
 */

const CLEARBIT_API_BASE = "https://person.clearbit.com/v2";

export interface ClearbitEnrichment {
  name?: {
    fullName: string;
    givenName: string;
    familyName: string;
  };
  email?: string;
  company?: {
    name: string;
    domain: string;
    location?: string;
    industry?: string;
    size?: number;
    foundedYear?: number;
    tags?: string[];
  };
  employment?: {
    title: string;
    role: string;
    seniority: string;
    department: string;
  };
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

/**
 * Enrich a lead's email address using Clearbit
 */
export async function enrichLead(email: string): Promise<ClearbitEnrichment | null> {
  const apiKey = process.env.CLEARBIT_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${CLEARBIT_API_BASE}/combined/find?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Lead not found in Clearbit
        return null;
      }
      throw new Error(`Clearbit API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to enrich ${email}:`, error);
    return null;
  }
}

/**
 * Batch enrich multiple leads
 */
export async function enrichLeads(emails: string[]): Promise<Map<string, ClearbitEnrichment>> {
  const results = new Map<string, ClearbitEnrichment>();

  // Clearbit has rate limits, so we'll process in batches
  const batchSize = 10;
  const delayMs = 1000; // 1 second between batches

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const enrichments = await Promise.all(
      batch.map(async (email) => {
        const enrichment = await enrichLead(email);
        return { email, enrichment };
      })
    );

    enrichments.forEach(({ email, enrichment }) => {
      if (enrichment) {
        results.set(email, enrichment);
      }
    });

    // Rate limiting delay
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Check if Clearbit is configured
 */
export function isClearbitConfigured(): boolean {
  return !!process.env.CLEARBIT_API_KEY;
}
