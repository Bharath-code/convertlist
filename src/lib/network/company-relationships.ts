/**
 * Company Relationship Detection Service
 * 
 * Detects if leads work at companies with partnerships, investments, or other relationships.
 * Analyzes company domains to identify potential business connections.
 */

export interface CompanyRelationship {
  type: 'partnership' | 'investment' | 'customer' | 'vendor' | 'subsidiary' | 'unknown';
  confidence: number;
  relatedCompany: string;
  description: string;
}

export interface CompanyRelationshipAnalysis {
  relationships: CompanyRelationship[];
  relationshipCount: number;
  strongestRelationship: CompanyRelationship | null;
  summary: string;
}

/**
 * Extract company domain from email
 */
export function extractCompanyDomain(email: string): string {
  const match = email.match(/@(.+)$/);
  if (!match) return '';
  
  const domain = match[1].toLowerCase();
  // Remove common email providers
  const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  if (commonProviders.includes(domain)) return '';
  
  return domain;
}

/**
 * Detect company relationships based on domain patterns
 */
export function detectCompanyRelationships(
  email: string,
  allEmails: string[]
): CompanyRelationshipAnalysis {
  const domain = extractCompanyDomain(email);
  
  if (!domain) {
    return {
      relationships: [],
      relationshipCount: 0,
      strongestRelationship: null,
      summary: 'No company domain detected (personal email)',
    };
  }

  const relationships: CompanyRelationship[] = [];
  const relatedDomains = new Set<string>();

  // Find emails from the same company
  const sameCompanyEmails = allEmails.filter(e => {
    const eDomain = extractCompanyDomain(e);
    return eDomain === domain && e !== email;
  });

  if (sameCompanyEmails.length > 0) {
    relationships.push({
      type: 'partnership',
      confidence: 95,
      relatedCompany: domain,
      description: `Same company as ${sameCompanyEmails.length} other lead(s)`,
    });
    relatedDomains.add(domain);
  }

  // Detect subsidiary relationships (subdomains)
  const baseDomain = domain.split('.').slice(-2).join('.');
  const subdomainEmails = allEmails.filter(e => {
    const eDomain = extractCompanyDomain(e);
    const eBase = eDomain.split('.').slice(-2).join('.');
    return eBase === baseDomain && eDomain !== domain && eDomain !== '';
  });

  if (subdomainEmails.length > 0) {
    subdomainEmails.forEach(e => {
      const eDomain = extractCompanyDomain(e);
      if (!relatedDomains.has(eDomain)) {
        relationships.push({
          type: 'subsidiary',
          confidence: 80,
          relatedCompany: eDomain,
          description: `Related company (same parent domain)`,
        });
        relatedDomains.add(eDomain);
      }
    });
  }

  // Detect potential vendor/customer relationships (common patterns)
  const vendorPatterns = ['vendor', 'supplier', 'provider', 'service'];
  const customerPatterns = ['client', 'customer', 'account'];

  if (vendorPatterns.some(pattern => domain.includes(pattern))) {
    relationships.push({
      type: 'vendor',
      confidence: 60,
      relatedCompany: domain,
      description: 'Potential vendor relationship based on domain name',
    });
  }

  if (customerPatterns.some(pattern => domain.includes(pattern))) {
    relationships.push({
      type: 'customer',
      confidence: 60,
      relatedCompany: domain,
      description: 'Potential customer relationship based on domain name',
    });
  }

  const relationshipCount = relationships.length;
  const strongestRelationship = relationships.length > 0
    ? relationships.reduce((max, r) => r.confidence > max.confidence ? r : max)
    : null;

  const summary = generateRelationshipSummary(relationships, sameCompanyEmails.length);

  return {
    relationships,
    relationshipCount,
    strongestRelationship,
    summary,
  };
}

/**
 * Generate a summary of company relationships
 */
function generateRelationshipSummary(
  relationships: CompanyRelationship[],
  sameCompanyCount: number
): string {
  if (relationships.length === 0) {
    return 'No company relationships detected';
  }

  const types = new Set(relationships.map(r => r.type));
  const typeList = Array.from(types).join(', ');

  if (sameCompanyCount > 0) {
    return `Connected to ${sameCompanyCount} other lead(s) from the same company. Also has ${typeList} relationships.`;
  }

  return `Has ${relationships.length} detected relationship(s): ${typeList}`;
}

/**
 * Batch analyze company relationships for multiple leads
 */
export function batchAnalyzeCompanyRelationships(
  emails: string[]
): Map<string, CompanyRelationshipAnalysis> {
  const results = new Map<string, CompanyRelationshipAnalysis>();

  emails.forEach(email => {
    const analysis = detectCompanyRelationships(email, emails);
    results.set(email, analysis);
  });

  return results;
}

/**
 * Find leads with company relationships to a specific company
 */
export function findLeadsWithCompanyRelationship(
  targetCompany: string,
  analyses: Map<string, CompanyRelationshipAnalysis>
): string[] {
  const leads: string[] = [];

  analyses.forEach((analysis, email) => {
    const hasRelationship = analysis.relationships.some(
      r => r.relatedCompany === targetCompany
    );
    if (hasRelationship) {
      leads.push(email);
    }
  });

  return leads;
}

/**
 * Get relationship strength score (0-100)
 */
export function getRelationshipStrengthScore(
  analysis: CompanyRelationshipAnalysis
): number {
  if (analysis.relationshipCount === 0) return 0;

  const confidenceSum = analysis.relationships.reduce(
    (sum, r) => sum + r.confidence,
    0
  );

  return Math.min(confidenceSum / analysis.relationshipCount, 100);
}

/**
 * Identify key connectors (leads with many relationships)
 */
export function identifyKeyConnectors(
  analyses: Map<string, CompanyRelationshipAnalysis>
): Array<{ email: string; score: number; relationshipCount: number }> {
  const connectors: Array<{ email: string; score: number; relationshipCount: number }> = [];

  analyses.forEach((analysis, email) => {
    const score = getRelationshipStrengthScore(analysis);
    if (score > 50) {
      connectors.push({
        email,
        score,
        relationshipCount: analysis.relationshipCount,
      });
    }
  });

  return connectors.sort((a, b) => b.score - a.score);
}
