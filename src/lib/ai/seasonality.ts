/**
 * Seasonality Detection Service
 * 
 * Detects patterns in signup timing, recommends optimal launch days/times.
 */

export interface SeasonalityResult {
  bestDayOfWeek: string;
  bestHour: number;
  worstDayOfWeek: string;
  worstHour: number;
  patterns: {
    day: string;
    hour: number;
    signupCount: number;
    averageScore: number;
  }[];
  recommendedLaunchWindows: Array<{
    day: string;
    hour: number;
    confidence: number;
  }>;
  confidence: number;
}

/**
 * Detect seasonality patterns from lead data
 */
export async function detectSeasonality(
  leads: Array<{
    createdAt: Date | null;
    score: number | null;
  }>
): Promise<SeasonalityResult | null> {
  if (leads.length < 10) {
    return null;
  }

  try {
    const dayOfWeekCounts = new Map<string, number>();
    const dayOfWeekScores = new Map<string, number[]>();
    const hourCounts = new Map<number, number>();
    const hourScores = new Map<number, number[]>();
    const patterns: SeasonalityResult['patterns'] = [];

    leads.forEach(lead => {
      if (lead.createdAt) {
        const date = new Date(lead.createdAt);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const hour = date.getHours();

        dayOfWeekCounts.set(day, (dayOfWeekCounts.get(day) || 0) + 1);
        dayOfWeekScores.set(day, [...(dayOfWeekScores.get(day) || []), lead.score || 0]);
        
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        hourScores.set(hour, [...(hourScores.get(hour) || []), lead.score || 0]);
      }
    });

    // Generate patterns
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        const count = leads.filter(l => {
          if (!l.createdAt) return false;
          const date = new Date(l.createdAt);
          return date.toLocaleDateString('en-US', { weekday: 'long' }) === day && date.getHours() === hour;
        }).length;

        const scores = leads.filter(l => {
          if (!l.createdAt) return false;
          const date = new Date(l.createdAt);
          return date.toLocaleDateString('en-US', { weekday: 'long' }) === day && date.getHours() === hour;
        }).map(l => l.score || 0);

        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        patterns.push({ day, hour, signupCount: count, averageScore: avgScore });
      }
    });

    // Find best and worst times
    const sortedByCount = [...patterns].sort((a, b) => b.signupCount - a.signupCount);
    const bestDayOfWeek = sortedByCount[0]?.day || "Tuesday";
    const bestHour = sortedByCount[0]?.hour || 10;

    const worstDayOfWeek = sortedByCount[sortedByCount.length - 1]?.day || "Saturday";
    const worstHour = sortedByCount[sortedByCount.length - 1]?.hour || 2;

    // Generate recommended launch windows
    const recommendedLaunchWindows = sortedByCount
      .filter(p => p.signupCount > 0)
      .slice(0, 5)
      .map(p => ({
        day: p.day,
        hour: p.hour,
        confidence: Math.min(p.signupCount / leads.length * 10, 1),
      }));

    const confidence = Math.min(leads.length / 100, 1);

    return {
      bestDayOfWeek,
      bestHour,
      worstDayOfWeek,
      worstHour,
      patterns,
      recommendedLaunchWindows,
      confidence,
    };
  } catch (error) {
    console.error("Failed to detect seasonality:", error);
    return null;
  }
}

/**
 * Get launch timing recommendation based on seasonality
 */
export function getSeasonalityRecommendation(seasonality: SeasonalityResult): {
  recommendedDay: string;
  recommendedHour: number;
  reasoning: string;
  alternativeDays: string[];
} {
  const recommendedDay = seasonality.bestDayOfWeek;
  const recommendedHour = seasonality.bestHour;

  const reasoning = `Based on ${seasonality.confidence.toFixed(0)}% confidence from signup patterns, ${recommendedDay} at ${recommendedHour}:00 has the highest engagement. Avoid ${seasonality.worstDayOfWeek} at ${seasonality.worstHour}:00.`;

  const alternativeDays = seasonality.recommendedLaunchWindows
    .slice(1, 4)
    .map(w => w.day);

  return {
    recommendedDay,
    recommendedHour,
    reasoning,
    alternativeDays,
  };
}
