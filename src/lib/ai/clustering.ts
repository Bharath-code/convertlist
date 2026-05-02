/**
 * AI Clustering Service
 * 
 * Uses Gemini to analyze signup notes and company data, assigning leads to
 * use case clusters (e.g., "E-commerce", "B2B SaaS", "Agency")
 */

import { z } from "zod";
import { generateStructuredOutput } from "./client";

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

  const clusterSchema = z.object({
    useCaseCluster: z.string(),
    confidence: z.number().min(0).max(1),
  });

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

  const result = await generateStructuredOutput(prompt, clusterSchema);
  
  if (result && COMMON_CLUSTERS.includes(result.useCaseCluster)) {
    return result;
  }

  // Fallback: simple heuristic
  return fallbackCluster(company, signupNote);
}

