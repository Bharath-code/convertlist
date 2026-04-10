/**
 * Competitor Database
 * 
 * Maintains a list of competitors with their tech stacks, features, and pricing.
 * This is used for domain fingerprinting and competitor analysis.
 */

export interface Competitor {
  id: string;
  name: string;
  website: string;
  category: string;
  techStack: string[];
  features: string[];
  pricing: string;
  targetAudience: string;
  knownDomains: string[];
}

/**
 * Common competitors in the waitlist/conversion space
 * This can be expanded based on user needs
 */
export const COMPETITOR_DATABASE: Competitor[] = [
  {
    id: 'waitlist-api',
    name: 'Waitlist API',
    website: 'waitlistapi.com',
    category: 'Waitlist Management',
    techStack: ['Next.js', 'Stripe', 'Vercel', 'Supabase'],
    features: ['Waitlist capture', 'Email verification', 'Basic analytics'],
    pricing: '$29/month',
    targetAudience: 'Indie developers',
    knownDomains: ['waitlistapi.com'],
  },
  {
    id: 'launchaco',
    name: 'Launchaco',
    website: 'launchaco.com',
    category: 'Launch Platform',
    techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
    features: ['Landing pages', 'Waitlist', 'Email marketing'],
    pricing: '$49/month',
    targetAudience: 'Startups',
    knownDomains: ['launchaco.com'],
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    website: 'convertkit.com',
    category: 'Email Marketing',
    techStack: ['Ruby on Rails', 'PostgreSQL', 'Redis'],
    features: ['Email sequences', 'Landing pages', 'Subscriber management'],
    pricing: '$29/month',
    targetAudience: 'Creators',
    knownDomains: ['convertkit.com'],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    website: 'mailchimp.com',
    category: 'Email Marketing',
    techStack: ['Python', 'Django', 'PostgreSQL'],
    features: ['Email campaigns', 'Automation', 'Audience segmentation'],
    pricing: 'Free tier available',
    targetAudience: 'Small businesses',
    knownDomains: ['mailchimp.com'],
  },
  {
    id: 'substack',
    name: 'Substack',
    website: 'substack.com',
    category: 'Newsletter Platform',
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    features: ['Newsletter writing', 'Paid subscriptions', 'Community'],
    pricing: 'Free, 10% of paid subscriptions',
    targetAudience: 'Writers',
    knownDomains: ['substack.com'],
  },
];

/**
 * Get competitor by ID
 */
export function getCompetitorById(id: string): Competitor | undefined {
  return COMPETITOR_DATABASE.find(c => c.id === id);
}

/**
 * Get all competitors in a category
 */
export function getCompetitorsByCategory(category: string): Competitor[] {
  return COMPETITOR_DATABASE.filter(c => c.category === category);
}

/**
 * Find competitors by tech stack
 * Returns competitors that use at least one of the specified technologies
 */
export function findCompetitorsByTechStack(techStack: string[]): Competitor[] {
  return COMPETITOR_DATABASE.filter(competitor =>
    competitor.techStack.some(tech => techStack.includes(tech))
  );
}

/**
 * Search competitors by name
 */
export function searchCompetitors(query: string): Competitor[] {
  const lowerQuery = query.toLowerCase();
  return COMPETITOR_DATABASE.filter(
    c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.website.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all competitor IDs
 */
export function getAllCompetitorIds(): string[] {
  return COMPETITOR_DATABASE.map(c => c.id);
}

/**
 * Get competitor features as a comma-separated string
 */
export function getCompetitorFeatures(competitorId: string): string {
  const competitor = getCompetitorById(competitorId);
  return competitor ? competitor.features.join(', ') : '';
}
