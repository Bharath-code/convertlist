/**
 * Lookalike Audience Detection Service
 * 
 * Compares new leads against converted paying customers to find similar patterns
 * and assign lookalike groups. Requires historical conversion data.
 */

import { db } from "@/lib/db";

export interface LookalikeResult {
  lookalikeGroupId: string | null;
  confidence: number;
}

/**
 * Find lookalike group for a lead based on similarity to converted customers
 */
export async function findLookalikeGroup(
  leadId: string,
  email: string,
  company: string | null,
  signupNote: string | null
): Promise<LookalikeResult> {
  try {
    // Get converted customers (leads with status PAID)
    const convertedCustomers = await db.lead.findMany({
      where: {
        status: "PAID",
        score: { not: null },
      },
      select: {
        id: true,
        email: true,
        company: true,
        signupNote: true,
        score: true,
      },
      take: 100,
    });

    if (convertedCustomers.length === 0) {
      return { lookalikeGroupId: null, confidence: 0 };
    }

    // Calculate similarity scores
    const similarities = convertedCustomers.map(customer => {
      let score = 0;

      // Company similarity
      if (company && customer.company) {
        const companySimilarity = calculateStringSimilarity(company, customer.company);
        score += companySimilarity * 0.4;
      }

      // Signup note similarity
      if (signupNote && customer.signupNote) {
        const noteSimilarity = calculateStringSimilarity(signupNote, customer.signupNote);
        score += noteSimilarity * 0.4;
      }

      // Score proximity (similar lead quality)
      if (leadId !== customer.id) {
        // This would be the lead's score, but we don't have it yet
        // In production, you'd pass the lead's score
      }

      return { customerId: customer.id, similarity: score };
    });

    // Find the most similar customer
    const mostSimilar = similarities.reduce((best, current) => 
      current.similarity > best.similarity ? current : best
    );

    // If similarity is high enough, assign to same lookalike group
    if (mostSimilar.similarity > 0.5) {
      return {
        lookalikeGroupId: mostSimilar.customerId,
        confidence: mostSimilar.similarity,
      };
    }

    return { lookalikeGroupId: null, confidence: 0 };
  } catch (error) {
    console.error(`Failed to find lookalike group for ${leadId}:`, error);
    return { lookalikeGroupId: null, confidence: 0 };
  }
}

/**
 * Find lookalike groups in batch
 */
export async function findLookalikeGroupsBatch(
  leads: Array<{ id: string; email: string; company: string | null; signupNote: string | null }>
): Promise<Map<string, LookalikeResult>> {
  const results = new Map<string, LookalikeResult>();

  for (const lead of leads) {
    const lookalike = await findLookalikeGroup(lead.id, lead.email, lead.company, lead.signupNote);
    results.set(lead.id, lookalike);
  }

  return results;
}

/**
 * Calculate string similarity using simple Jaccard-like approach
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * Group leads by lookalike groups
 */
export function groupByLookalike(
  lookalikes: Map<string, LookalikeResult>
): Record<string, string[]> {
  const groups: Record<string, string[]> = { "no_match": [] };

  lookalikes.forEach((result, leadId) => {
    const groupId = result.lookalikeGroupId || "no_match";
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(leadId);
  });

  return groups;
}
