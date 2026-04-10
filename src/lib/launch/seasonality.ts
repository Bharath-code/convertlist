/**
 * Seasonality Analysis Service
 * 
 * Analyzes seasonal patterns in lead engagement and conversion.
 * Helps identify optimal launch timing based on seasonality.
 */

export interface SeasonalityData {
  season: string;
  engagementRate: number;
  conversionRate: number;
  recommendation: string;
}

/**
 * Analyze seasonality for a waitlist
 */
export function analyzeSeasonality(
  leads: Array<{ createdAt: Date | null; status: string }>
): SeasonalityData {
  if (leads.length === 0) {
    return {
      season: 'unknown',
      engagementRate: 0,
      conversionRate: 0,
      recommendation: 'Insufficient data for seasonality analysis',
    };
  }

  const now = new Date();
  const currentSeason = getSeason(now);
  
  // Calculate conversion rate
  const convertedLeads = leads.filter(l => l.status === 'PAID').length;
  const conversionRate = (convertedLeads / leads.length) * 100;

  // Engagement rate (leads with meaningful data)
  const engagedLeads = leads.filter(l => l.createdAt !== null).length;
  const engagementRate = (engagedLeads / leads.length) * 100;

  const recommendation = generateSeasonalityRecommendation(
    currentSeason,
    engagementRate,
    conversionRate
  );

  return {
    season: currentSeason,
    engagementRate,
    conversionRate,
    recommendation,
  };
}

/**
 * Get current season
 */
function getSeason(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

/**
 * Generate seasonality recommendation
 */
function generateSeasonalityRecommendation(
  season: string,
  engagementRate: number,
  conversionRate: number
): string {
  const seasonRecommendations: Record<string, string> = {
    spring: 'Spring is a great time for launches - people are planning ahead for the year',
    summer: 'Summer can be challenging with vacations - consider a late summer launch',
    fall: 'Fall is optimal for B2B launches - back-to-work season with high engagement',
    winter: 'Winter holidays can be distracting - aim for early January after holiday period',
  };

  let recommendation = seasonRecommendations[season] || 'Standard timing';

  if (engagementRate > 70) {
    recommendation += '. High engagement suggests good timing';
  } else if (engagementRate < 40) {
    recommendation += '. Consider building more engagement before launch';
  }

  if (conversionRate > 30) {
    recommendation += '. Strong conversion potential';
  }

  return recommendation;
}
