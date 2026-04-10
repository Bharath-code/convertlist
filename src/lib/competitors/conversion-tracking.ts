/**
 * Competitor Conversion Tracking
 * 
 * Tracks conversion rates by competitor to identify easiest wins.
 * Analyzes which competitors are easiest to convert from.
 */

import { db } from '@/lib/db';

export interface CompetitorConversionStats {
  competitorName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  avgTimeToConvert: number; // in days
  avgSwitchingCost: number;
  revenueImpact: number;
}

export interface CompetitorConversionInsights {
  stats: CompetitorConversionStats[];
  easiestToConvert: string;
  highestRevenueImpact: string;
  recommendations: string[];
}

/**
 * Track a lead conversion with competitor context
 */
export async function trackCompetitorConversion(
  leadId: string,
  competitorName: string,
  revenueAmount?: number
) {
  try {
    // This would typically be stored in a separate analytics table
    // For now, we'll log it and update lead status
    await db.lead.update({
      where: { id: leadId },
      data: {
        status: 'PAID',
      },
    });

    // In a production system, this would write to an analytics table
    console.log(`[Competitor Conversion] Lead ${leadId} converted from ${competitorName}`, {
      revenueAmount,
      timestamp: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to track competitor conversion:', error);
    return { success: false };
  }
}

/**
 * Calculate conversion stats by competitor from leads data
 */
export async function calculateCompetitorConversionStats(
  waitlistId: string
): Promise<CompetitorConversionInsights> {
  try {
    const leads = await db.lead.findMany({
      where: { waitlistId },
      select: {
        detectedCompetitors: true,
        status: true,
        importedAt: true,
        switchingCost: true,
      },
    });

    const competitorMap = new Map<string, {
      totalLeads: number;
      convertedLeads: number;
      timeToConvert: number[];
      switchingCosts: number[];
    }>();

    leads.forEach(lead => {
      if (!lead.detectedCompetitors) return;

      try {
        const competitors = JSON.parse(lead.detectedCompetitors);
        competitors.forEach((competitorName: string) => {
          if (!competitorMap.has(competitorName)) {
            competitorMap.set(competitorName, {
              totalLeads: 0,
              convertedLeads: 0,
              timeToConvert: [],
              switchingCosts: [],
            });
          }

          const stats = competitorMap.get(competitorName)!;
          stats.totalLeads++;

          if (lead.status === 'PAID') {
            stats.convertedLeads++;
            if (lead.importedAt) {
              const daysToConvert = Math.floor(
                (new Date().getTime() - new Date(lead.importedAt).getTime()) / (1000 * 60 * 60 * 24)
              );
              stats.timeToConvert.push(daysToConvert);
            }
          }

          if (lead.switchingCost) {
            try {
              const costData = JSON.parse(lead.switchingCost);
              if (costData.score) {
                stats.switchingCosts.push(costData.score);
              }
            } catch {
              // Ignore parsing errors
            }
          }
        });
      } catch {
        // Ignore JSON parsing errors
      }
    });

    const stats: CompetitorConversionStats[] = Array.from(competitorMap.entries()).map(
      ([competitorName, data]) => ({
        competitorName,
        totalLeads: data.totalLeads,
        convertedLeads: data.convertedLeads,
        conversionRate: data.totalLeads > 0 
          ? (data.convertedLeads / data.totalLeads) * 100 
          : 0,
        avgTimeToConvert: data.timeToConvert.length > 0
          ? data.timeToConvert.reduce((a, b) => a + b, 0) / data.timeToConvert.length
          : 0,
        avgSwitchingCost: data.switchingCosts.length > 0
          ? data.switchingCosts.reduce((a, b) => a + b, 0) / data.switchingCosts.length
          : 0,
        revenueImpact: data.convertedLeads * 100, // Placeholder revenue calculation
      })
    ).sort((a, b) => b.conversionRate - a.conversionRate);

    const easiestToConvert = stats.length > 0 ? stats[0].competitorName : 'N/A';
    const highestRevenueImpact = stats.length > 0 
      ? stats.reduce((max, s) => s.revenueImpact > max.revenueImpact ? s : max).competitorName 
      : 'N/A';

    const recommendations = generateConversionRecommendations(stats);

    return {
      stats,
      easiestToConvert,
      highestRevenueImpact,
      recommendations,
    };
  } catch (error) {
    console.error('Failed to calculate competitor conversion stats:', error);
    return {
      stats: [],
      easiestToConvert: 'N/A',
      highestRevenueImpact: 'N/A',
      recommendations: [],
    };
  }
}

/**
 * Generate recommendations based on conversion stats
 */
function generateConversionRecommendations(
  stats: CompetitorConversionStats[]
): string[] {
  const recommendations: string[] = [];

  if (stats.length === 0) {
    return ['No competitor conversion data available yet.'];
  }

  // Identify high-conversion competitors
  const highConversionCompetitors = stats.filter(s => s.conversionRate > 30);
  if (highConversionCompetitors.length > 0) {
    recommendations.push(
      `Focus outreach on leads from ${highConversionCompetitors.map(c => c.competitorName).join(', ')} - they convert at ${highConversionCompetitors[0].conversionRate.toFixed(1)}%`
    );
  }

  // Identify low-switching-cost competitors
  const lowCostCompetitors = stats.filter(s => s.avgSwitchingCost < 50);
  if (lowCostCompetitors.length > 0) {
    recommendations.push(
      `Prioritize ${lowCostCompetitors.map(c => c.competitorName).join(', ')} users - switching cost is low (${lowCostCompetitors[0].avgSwitchingCost.toFixed(0)}/100)`
    );
  }

  // Identify fast converters
  const fastConverters = stats.filter(s => s.avgTimeToConvert > 0 && s.avgTimeToConvert < 14);
  if (fastConverters.length > 0) {
    recommendations.push(
      `${fastConverters.map(c => c.competitorName).join(', ')} users convert quickly (avg ${fastConverters[0].avgTimeToConvert.toFixed(0)} days) - use urgency in outreach`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue tracking conversions to identify patterns.');
  }

  return recommendations;
}

/**
 * Get competitor conversion comparison table
 */
export function getCompetitorConversionTable(
  stats: CompetitorConversionStats[]
): string {
  if (stats.length === 0) return 'No conversion data available.';

  let table = '| Competitor | Leads | Converted | Rate | Avg Time to Convert | Avg Switching Cost |\n';
  table += '|------------|-------|-----------|------|---------------------|-------------------|\n';

  stats.forEach(stat => {
    table += `| ${stat.competitorName} | ${stat.totalLeads} | ${stat.convertedLeads} | ${stat.conversionRate.toFixed(1)}% | ${stat.avgTimeToConvert.toFixed(0)} days | ${stat.avgSwitchingCost.toFixed(0)}/100 |\n`;
  });

  return table;
}

/**
 * Identify easiest wins (high conversion, low switching cost)
 */
export function identifyEasiestWins(
  stats: CompetitorConversionStats[],
  threshold: { conversionRate: number; switchingCost: number } = {
    conversionRate: 20,
    switchingCost: 50,
  }
): CompetitorConversionStats[] {
  return stats.filter(
    stat => 
      stat.conversionRate >= threshold.conversionRate &&
      stat.avgSwitchingCost <= threshold.switchingCost
  );
}
