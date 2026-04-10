/**
 * Network-Driven Conversion Tracking
 * 
 * Tracks how many conversions came from network-based outreach.
 * Analyzes the impact of network connections on conversion rates.
 */

import { db } from '@/lib/db';

export interface NetworkConversionMetrics {
  totalConversions: number;
  networkDrivenConversions: number;
  networkConversionRate: number;
  avgInfluenceScoreOfConversions: number;
  topConnectionTypes: Array<{ type: string; count: number }>;
}

export interface NetworkConversionInsights {
  metrics: NetworkConversionMetrics;
  summary: string;
  recommendations: string[];
}

/**
 * Track a network-driven conversion
 */
export async function trackNetworkConversion(
  leadId: string,
  connectionType: 'company' | 'community' | 'influencer' | 'other',
  outreachMethod: 'warm_intro' | 'network_outreach' | 'standard'
) {
  try {
    // Update lead status
    await db.lead.update({
      where: { id: leadId },
      data: { status: 'PAID' },
    });

    // Log network conversion for analytics
    console.log(`[Network Conversion] Lead ${leadId} converted via ${connectionType} using ${outreachMethod}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to track network conversion:', error);
    return { success: false };
  }
}

/**
 * Calculate network conversion metrics for a waitlist
 */
export async function calculateNetworkConversionMetrics(
  waitlistId: string
): Promise<NetworkConversionInsights> {
  try {
    const leads = await db.lead.findMany({
      where: { waitlistId },
      select: {
        status: true,
        influenceScore: true,
        companyRelationships: true,
        communityOverlap: true,
      },
    });

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.status === 'PAID');
    const totalConversions = convertedLeads.length;

    // Count network-driven conversions (leads with influence score or connections)
    const networkDrivenConversions = convertedLeads.filter(l => {
      const hasInfluence = (l.influenceScore || 0) > 50;
      const hasConnections = l.companyRelationships || l.communityOverlap;
      return hasInfluence || hasConnections;
    }).length;

    const networkConversionRate = totalConversions > 0
      ? (networkDrivenConversions / totalConversions) * 100
      : 0;

    // Calculate average influence score of conversions
    const influenceScores = convertedLeads
      .map(l => l.influenceScore || 0)
      .filter(s => s > 0);
    const avgInfluenceScore = influenceScores.length > 0
      ? influenceScores.reduce((a, b) => a + b, 0) / influenceScores.length
      : 0;

    // Analyze top connection types
    const connectionTypes: Record<string, number> = {
      company: 0,
      community: 0,
      influencer: 0,
      other: 0,
    };

    convertedLeads.forEach(lead => {
      if (lead.companyRelationships) connectionTypes.company++;
      if (lead.communityOverlap) connectionTypes.community++;
      if ((lead.influenceScore || 0) > 70) connectionTypes.influencer++;
    });

    const topConnectionTypes = Object.entries(connectionTypes)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const metrics: NetworkConversionMetrics = {
      totalConversions,
      networkDrivenConversions,
      networkConversionRate,
      avgInfluenceScoreOfConversions: avgInfluenceScore,
      topConnectionTypes,
    };

    const summary = generateNetworkConversionSummary(metrics);
    const recommendations = generateNetworkConversionRecommendations(metrics);

    return {
      metrics,
      summary,
      recommendations,
    };
  } catch (error) {
    console.error('Failed to calculate network conversion metrics:', error);
    return {
      metrics: {
        totalConversions: 0,
        networkDrivenConversions: 0,
        networkConversionRate: 0,
        avgInfluenceScoreOfConversions: 0,
        topConnectionTypes: [],
      },
      summary: 'No conversion data available',
      recommendations: [],
    };
  }
}

/**
 * Generate summary of network conversions
 */
function generateNetworkConversionSummary(
  metrics: NetworkConversionMetrics
): string {
  if (metrics.totalConversions === 0) {
    return 'No conversions recorded yet';
  }

  const percentage = metrics.networkConversionRate.toFixed(1);
  return `${metrics.networkDrivenConversions} out of ${metrics.totalConversions} conversions (${percentage}%) were network-driven. Average influence score: ${metrics.avgInfluenceScoreOfConversions.toFixed(0)}`;
}

/**
 * Generate recommendations based on network conversion data
 */
function generateNetworkConversionRecommendations(
  metrics: NetworkConversionMetrics
): string[] {
  const recommendations: string[] = [];

  if (metrics.totalConversions === 0) {
    return ['Track conversions to identify network-driven patterns'];
  }

  if (metrics.networkConversionRate > 50) {
    recommendations.push('Network connections are driving most conversions - prioritize network-based outreach');
  } else if (metrics.networkConversionRate > 30) {
    recommendations.push('Network connections are contributing significantly - continue leveraging them');
  } else {
    recommendations.push('Network-driven conversions are low - focus more on building and using network connections');
  }

  if (metrics.avgInfluenceScoreOfConversions > 70) {
    recommendations.push('High-influence leads are converting well - prioritize them in outreach');
  }

  if (metrics.topConnectionTypes.length > 0) {
    const topType = metrics.topConnectionTypes[0];
    recommendations.push(`${topType.type} connections are most effective - focus on these`);
  }

  return recommendations;
}

/**
 * Compare network vs non-network conversion rates
 */
export function compareNetworkVsStandardConversions(
  metrics: NetworkConversionMetrics
): {
  networkRate: number;
  standardRate: number;
  lift: number;
  significant: boolean;
} {
  const networkRate = metrics.networkConversionRate;
  const standardRate = 100 - networkRate;
  const lift = networkRate > standardRate
    ? ((networkRate - standardRate) / standardRate) * 100
    : -((standardRate - networkRate) / networkRate) * 100;

  return {
    networkRate,
    standardRate,
    lift: Math.abs(lift),
    significant: Math.abs(lift) > 20,
  };
}
