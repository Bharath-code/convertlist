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

    const prompt = `You are a lead segmentation expert. Analyze this lead and assign them to ONE of these use case clusters:

${COMMON_CLUSTERS.join(", ")}

Lead data:
- Email: ${email}
- Name: ${name || "N/A"}
- Company: ${company || "N/A"}
- Signup note: ${signupNote || "N/A"}

Rules:
- Choose the cluster that BEST matches their use case
- If unsure, choose "Other"
- Return ONLY JSON: {"useCaseCluster": "...", "confidence": 0.0-1.0}
- Confidence should be higher when the match is clear`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      
      // Validate the cluster is in our list
      if (COMMON_CLUSTERS.includes(parsed.useCaseCluster)) {
        return {
          useCaseCluster: parsed.useCaseCluster,
          confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        };
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
