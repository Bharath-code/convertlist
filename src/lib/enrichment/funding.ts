/**
 * Funding Status Detection Service
 * 
 * Checks Crunchbase/API for funding status and categorizes companies as:
 * VC-backed, Bootstrapped, Enterprise, or Unknown
 */

export interface FundingEnrichment {
  fundingStatus: 'VC-backed' | 'Bootstrapped' | 'Enterprise' | 'Unknown';
  totalFunding?: number;
  fundingRounds?: number;
  lastFundingDate?: Date;
  investors?: string[];
  confidence: number;
}

/**
 * Detect funding status from company information
 * This is a simplified implementation that uses heuristics
 * In production, integrate with Crunchbase API or similar
 */
export async function detectFundingStatus(
  companyName?: string,
  companyDomain?: string
): Promise<FundingEnrichment | null> {
  if (!companyName && !companyDomain) {
    return null;
  }

  try {
    // In a production environment, this would call Crunchbase API
    // For now, we'll use heuristics based on company characteristics
    
    const enrichment: FundingEnrichment = {
      fundingStatus: 'Unknown',
      confidence: 0.3,
    };

    // Heuristic: Check if company domain suggests enterprise
    if (companyDomain) {
      const domain = companyDomain.toLowerCase();
      
      // Enterprise indicators
      if (
        domain.includes('.com') && 
        (domain.includes('corp') || domain.includes('enterprise') || domain.includes('group'))
      ) {
        enrichment.fundingStatus = 'Enterprise';
        enrichment.confidence = 0.6;
      }
      
      // Bootstrapped indicators (common for indie founders)
      if (
        domain.includes('.io') || 
        domain.includes('.app') ||
        domain.includes('labs') ||
        domain.includes('studio')
      ) {
        enrichment.fundingStatus = 'Bootstrapped';
        enrichment.confidence = 0.5;
      }
    }

    // Heuristic: Company name analysis
    if (companyName) {
      const name = companyName.toLowerCase();
      
      // VC-backed indicators
      if (
        name.includes('inc') || 
        name.includes('corp') || 
        name.includes('technologies') ||
        name.includes('systems')
      ) {
        enrichment.fundingStatus = 'VC-backed';
        enrichment.confidence = Math.max(enrichment.confidence, 0.5);
      }
    }

    return enrichment;
  } catch (error) {
    console.error(`Failed to detect funding status for ${companyName}:`, error);
    return null;
  }
}

/**
 * Detect funding status with Crunchbase API (placeholder for production)
 */
export async function detectFundingStatusWithCrunchbase(
  companyName: string
): Promise<FundingEnrichment | null> {
  const apiKey = process.env.CRUNCHBASE_API_KEY;
  
  if (!apiKey) {
    // Fallback to heuristic detection
    return detectFundingStatus(companyName);
  }

  try {
    // In production, implement actual Crunchbase API call
    // const response = await fetch(`https://api.crunchbase.com/v4/organizations?name=${encodeURIComponent(companyName)}`, {
    //   headers: {
    //     'X-cb-user-key': apiKey,
    //   },
    // });
    // const data = await response.json();
    
    // For now, return null to trigger fallback
    return null;
  } catch (error) {
    console.error(`Crunchbase API error for ${companyName}:`, error);
    return detectFundingStatus(companyName);
  }
}

/**
 * Batch detect funding status
 */
export async function detectFundingStatusBatch(
  companies: Array<{ name?: string; domain?: string }>
): Promise<Map<string, FundingEnrichment>> {
  const results = new Map<string, FundingEnrichment>();

  for (const company of companies) {
    const key = company.name || company.domain;
    if (!key) continue;
    const funding = await detectFundingStatus(
      company.name || undefined,
      company.domain || undefined
    );
    if (funding) {
      results.set(key, funding);
    }
  }

  return results;
}
