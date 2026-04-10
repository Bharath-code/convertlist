/**
 * AI Clustering Service
 * 
 * Uses Gemini to analyze signup notes and company data, assigning leads to
 * use case clusters (e.g., "E-commerce", "B2B SaaS", "Agency")
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ClusterResult {
  useCaseCluster: string;
  confidence: number;
}

const COMMON_CLUSTERS = [
  "E-commerce",
  "B2B SaaS",
  "Agency",
  "Freelancer",
  "Enterprise",
  "Startup",
  "Content Creator",
  "Developer",
  "Marketing",
  "Consulting",
  "Education",
  "Healthcare",
  "Finance",
  "Other",
];

/**
 * Cluster a single lead based on their signup note and company data
 */
export async function clusterLead(
  email: string,
  name: string | null,
  company: string | null,
  signupNote: string | null
): Promise<ClusterResult | null> {
  if (!signupNote && !company) {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a lead segmentation expert. Classify leads into use case clusters.

Available clusters: ${COMMON_CLUSTERS.join(", ")}

EXAMPLES:
Input: "I need to manage my online store orders"
Output: {"useCaseCluster": "E-commerce", "confidence": 0.9}

Input: "Looking for CRM for my agency clients"
Output: {"useCaseCluster": "Agency", "confidence": 0.85}

Input: "I'm a freelance designer"
Output: {"useCaseCluster": "Freelancer", "confidence": 0.9}

Input: "Building a SaaS platform for startups"
Output: {"useCaseCluster": "B2B SaaS", "confidence": 0.85}

Input: "Just exploring options"
Output: {"useCaseCluster": "Other", "confidence": 0.3}

CONFIDENCE CRITERIA:
- 0.9-1.0: Clear, specific keywords match (e.g., "online store", "agency", "freelance", "SaaS")
- 0.7-0.8: Strong contextual clues but not explicit
- 0.5-0.6: Some indication but could be multiple clusters
- 0.3-0.4: Vague or no clear indicators
- 0.0-0.2: Insufficient information

Current lead:
- Email: ${email}
- Name: ${name || "N/A"}
- Company: ${company || "N/A"}
- Signup note: ${signupNote || "N/A"}

Return ONLY valid JSON matching this schema:
{"useCaseCluster": string, "confidence": number}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        
        // Validate the cluster is in our list
        if (COMMON_CLUSTERS.includes(parsed.useCaseCluster)) {
          // Validate confidence is a number
          const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
          return {
            useCaseCluster: parsed.useCaseCluster,
            confidence: Math.min(Math.max(confidence, 0), 1),
          };
        }
      } catch (e) {
        // JSON parse error, fall back to heuristic
        console.error('Failed to parse JSON:', e);
      }
    }

    // Fallback: simple heuristic
    return fallbackCluster(company, signupNote);
  } catch (error) {
    console.error(`Failed to cluster lead ${email}:`, error);
    return fallbackCluster(company, signupNote);
  }
}

/**
 * Cluster multiple leads in batch
 */
export async function clusterLeadsBatch(
  leads: Array<{ id: string; email: string; name: string | null; company: string | null; signupNote: string | null }>
): Promise<Map<string, ClusterResult>> {
  const results = new Map<string, ClusterResult>();

  for (const lead of leads) {
    const cluster = await clusterLead(lead.email, lead.name, lead.company, lead.signupNote);
    if (cluster) {
      results.set(lead.id, cluster);
    }
  }

  return results;
}

/**
 * Fallback clustering using simple heuristics
 */
function fallbackCluster(company: string | null, signupNote: string | null): ClusterResult {
  const text = `${company || ""} ${signupNote || ""}`.toLowerCase();
  
  const clusterMap: Record<string, string> = {
    "shop": "E-commerce",
    "store": "E-commerce",
    "ecommerce": "E-commerce",
    "e-commerce": "E-commerce",
    "saas": "B2B SaaS",
    "software": "B2B SaaS",
    "platform": "B2B SaaS",
    "api": "B2B SaaS",
    "agency": "Agency",
    "marketing": "Agency",
    "creative": "Agency",
    "design": "Agency",
    "freelance": "Freelancer",
    "consultant": "Consulting",
    "consulting": "Consulting",
    "startup": "Startup",
    "enterprise": "Enterprise",
    "corp": "Enterprise",
    "content": "Content Creator",
    "blog": "Content Creator",
    "youtube": "Content Creator",
    "developer": "Developer",
    "dev": "Developer",
    "engineering": "Developer",
    "education": "Education",
    "teaching": "Education",
    "school": "Education",
    "finance": "Finance",
    "fintech": "Finance",
    "bank": "Finance",
    "health": "Healthcare",
    "medical": "Healthcare",
  };

  for (const [keyword, cluster] of Object.entries(clusterMap)) {
    if (text.includes(keyword)) {
      return { useCaseCluster: cluster, confidence: 0.6 };
    }
  }

  return { useCaseCluster: "Other", confidence: 0.3 };
}

/**
 * Get cluster distribution
 */
export function getClusterDistribution(clusters: ClusterResult[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  COMMON_CLUSTERS.forEach(cluster => {
    distribution[cluster] = 0;
  });

  clusters.forEach(c => {
    distribution[c.useCaseCluster] = (distribution[c.useCaseCluster] || 0) + 1;
  });

  return distribution;
}
