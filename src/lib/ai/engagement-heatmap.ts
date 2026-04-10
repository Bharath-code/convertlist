/**
 * Engagement Heatmap Service
 * 
 * Analyzes signup timestamps, note lengths, source patterns to generate engagement heatmap.
 */

export interface EngagementHeatmapResult {
  heatmapData: {
    hour: number;
    day: string;
    engagementLevel: number;
  }[];
  peakTimes: {
    hour: number;
    day: string;
    score: number;
  }[];
  confidence: number;
}

/**
 * Generate engagement heatmap from lead data
 */
export async function generateEngagementHeatmap(
  leads: Array<{
    createdAt: Date | null;
    signupNote: string | null;
    source: string | null;
    score: number | null;
  }>
): Promise<EngagementHeatmapResult | null> {
  if (leads.length === 0) {
    return null;
  }

  try {
    // Analyze temporal patterns
    const hourlyEngagement = new Map<number, number>();
    const dailyEngagement = new Map<string, number>();

    leads.forEach(lead => {
      if (lead.createdAt) {
        const date = new Date(lead.createdAt);
        const hour = date.getHours();
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Weight by note length and score (scientifically normalized)
        const noteWeight = lead.signupNote ? Math.min(lead.signupNote.length / 200, 1) : 0; // Normalized 0-1
        const scoreWeight = lead.score ? lead.score / 100 : 0; // Normalized 0-1
        const engagementWeight = 1 + noteWeight + scoreWeight;

        hourlyEngagement.set(hour, (hourlyEngagement.get(hour) || 0) + engagementWeight);
        dailyEngagement.set(day, (dailyEngagement.get(day) || 0) + engagementWeight);
      }
    });

    // Generate heatmap data
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const heatmapData: EngagementHeatmapResult['heatmapData'] = [];

    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        const hourScore = hourlyEngagement.get(hour) || 0;
        const dayScore = dailyEngagement.get(day) || 0;
        // Normalize by total engagement to get relative score (0-10 scale)
        const totalHourlyEngagement = Array.from(hourlyEngagement.values()).reduce((a, b) => a + b, 0);
        const totalDailyEngagement = Array.from(dailyEngagement.values()).reduce((a, b) => a + b, 0);
        const normalizedScore = totalHourlyEngagement > 0 && totalDailyEngagement > 0 
          ? ((hourScore / totalHourlyEngagement) * (dayScore / totalDailyEngagement)) * 100
          : 0;
        
        heatmapData.push({
          hour,
          day,
          engagementLevel: Math.min(normalizedScore, 10),
        });
      }
    });

    // Find peak times
    const sortedByEngagement = [...heatmapData].sort((a, b) => b.engagementLevel - a.engagementLevel);
    const peakTimes = sortedByEngagement.slice(0, 5).map(item => ({
      hour: item.hour,
      day: item.day,
      score: item.engagementLevel,
    }));

    const confidence = Math.min(leads.length / 50, 1);

    return {
      heatmapData,
      peakTimes,
      confidence,
    };
  } catch (error) {
    console.error("Failed to generate engagement heatmap:", error);
    return null;
  }
}

/**
 * Get summary of engagement patterns
 */
export function getEngagementSummary(heatmap: EngagementHeatmapResult): {
  bestDay: string;
  bestHour: number;
  recommendation: string;
} {
  if (!heatmap.peakTimes || heatmap.peakTimes.length === 0) {
    return {
      bestDay: "Tuesday",
      bestHour: 10,
      recommendation: "Insufficient data - gather more leads",
    };
  }

  const bestTime = heatmap.peakTimes[0];
  return {
    bestDay: bestTime.day,
    bestHour: bestTime.hour,
    recommendation: `Launch on ${bestTime.day} around ${bestTime.hour}:00 for maximum engagement`,
  };
}
