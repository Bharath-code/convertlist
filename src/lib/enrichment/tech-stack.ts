/**
 * Tech Stack Detection Service
 * 
 * Scans company website for technology indicators like React, Vue, AWS, Stripe, GCP, Azure.
 */

export interface TechStackEnrichment {
  detectedStack: string[];
  frontend: string[];
  backend: string[];
  cloud: string[];
  payments: string[];
  confidence: number;
}

// Common technology indicators
const TECH_INDICATORS = {
  frontend: [
    { name: 'React', patterns: ['react', 'reactjs', '_next', 'next.js'] },
    { name: 'Vue', patterns: ['vue', 'vuejs', 'nuxt'] },
    { name: 'Angular', patterns: ['angular', 'ng-app'] },
    { name: 'Svelte', patterns: ['svelte'] },
    { name: 'Ember', patterns: ['ember'] },
  ],
  backend: [
    { name: 'Node.js', patterns: ['node', 'express', 'nest'] },
    { name: 'Python', patterns: ['python', 'django', 'flask', 'fastapi'] },
    { name: 'Ruby', patterns: ['ruby', 'rails'] },
    { name: 'PHP', patterns: ['php', 'laravel', 'wordpress'] },
    { name: 'Go', patterns: ['golang', 'go'] },
    { name: 'Java', patterns: ['java', 'spring'] },
  ],
  cloud: [
    { name: 'AWS', patterns: ['aws', 'amazon', 'cloudfront', 's3'] },
    { name: 'GCP', patterns: ['google cloud', 'gcp', 'firebase'] },
    { name: 'Azure', patterns: ['azure', 'microsoft cloud'] },
    { name: 'Vercel', patterns: ['vercel'] },
    { name: 'Netlify', patterns: ['netlify'] },
  ],
  payments: [
    { name: 'Stripe', patterns: ['stripe'] },
    { name: 'PayPal', patterns: ['paypal'] },
    { name: 'Square', patterns: ['square'] },
    { name: 'Braintree', patterns: ['braintree'] },
  ],
};

/**
 * Detect tech stack from company website URL
 */
export async function detectTechStack(companyUrl: string): Promise<TechStackEnrichment | null> {
  if (!companyUrl) {
    return null;
  }

  try {
    // Normalize URL
    const normalizedUrl = companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`;
    
    // Fetch website HTML
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ConvertList/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const lowerHtml = html.toLowerCase();

    const detected: TechStackEnrichment = {
      detectedStack: [],
      frontend: [],
      backend: [],
      cloud: [],
      payments: [],
      confidence: 0,
    };

    // Detect technologies in each category
    const categories = Object.keys(TECH_INDICATORS) as Array<keyof typeof TECH_INDICATORS>;
    
    for (const category of categories) {
      const technologies = TECH_INDICATORS[category];
      for (const tech of technologies) {
        const isDetected = tech.patterns.some((pattern: string) => lowerHtml.includes(pattern));
        if (isDetected) {
          detected.detectedStack.push(tech.name);
          if (category === 'frontend') detected.frontend.push(tech.name);
          if (category === 'backend') detected.backend.push(tech.name);
          if (category === 'cloud') detected.cloud.push(tech.name);
          if (category === 'payments') detected.payments.push(tech.name);
        }
      }
    }

    // Calculate confidence based on number of detections
    detected.confidence = Math.min(detected.detectedStack.length * 0.15, 0.9);

    // Only return if we detected something
    if (detected.detectedStack.length > 0) {
      return detected;
    }

    return null;
  } catch (error) {
    console.error(`Failed to detect tech stack for ${companyUrl}:`, error);
    return null;
  }
}

/**
 * Detect tech stack from company domain (uses Clearbit data)
 */
export async function detectTechStackFromDomain(domain: string): Promise<TechStackEnrichment | null> {
  const companyUrl = `https://${domain}`;
  return detectTechStack(companyUrl);
}

/**
 * Batch detect tech stacks
 */
export async function detectTechStackBatch(domains: string[]): Promise<Map<string, TechStackEnrichment>> {
  const results = new Map<string, TechStackEnrichment>();

  for (const domain of domains) {
    const stack = await detectTechStackFromDomain(domain);
    if (stack) {
      results.set(domain, stack);
    }
  }

  return results;
}

/**
 * Format tech stack as comma-separated string
 */
export function formatTechStack(stack: TechStackEnrichment): string {
  return stack.detectedStack.join(', ');
}
