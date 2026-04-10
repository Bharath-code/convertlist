/**
 * Engagement Heatmap Service
 * 
 * Creates engagement heatmaps showing when leads are most active.
 * Helps identify optimal times for outreach and launch.
 */

export interface EngagementDataPoint {
  date: Date;
  engagement: number;
  signups: number;
  conversions: number;
}

export interface EngagementHeatmap {
  data: EngagementDataPoint[];
  peakEngagementDay: string;
  peakEngagementHour: number;
  insights: string[];
}

/**
 * Generate engagement heatmap from lead data
 */
export function generateEngagementHeatmap(
  leads: Array<{ createdAt: Date | null; status: string }>
): EngagementHeatmap {
  const data: EngagementDataPoint[] = [];
  const dayEngagement = new Map<string, number>();
  const hourEngagement = new Map<number, number>();

  // Aggregate engagement by day and hour
  leads.forEach(lead => {
    if (!lead.createdAt) return;
    const date = new Date(lead.createdAt);
    const dayKey = date.toISOString().split('T')[0];
    const hour = date.getHours();

    dayEngagement.set(dayKey, (dayEngagement.get(dayKey) || 0) + 1);
    hourEngagement.set(hour, (hourEngagement.get(hour) || 0) + 1);
  });

  // Find peak engagement day and hour
  let peakDay = '';
  let peakDayCount = 0;
  dayEngagement.forEach((count, day) => {
    if (count > peakDayCount) {
      peakDayCount = count;
      peakDay = day;
    }
  });

  let peakHour = 0;
  let peakHourCount = 0;
  hourEngagement.forEach((count, hour) => {
    if (count > peakHourCount) {
      peakHourCount = count;
      peakHour = hour;
    }
  });

  // Generate insights
  const insights: string[] = [];
  if (peakDayCount > 0) {
    insights.push(`Peak engagement on ${peakDay} with ${peakDayCount} leads`);
  }
  if (peakHourCount > 0) {
    insights.push(`Peak engagement at ${peakHour}:00 with ${peakHourCount} leads`);
  }
  if (dayEngagement.size > 0) {
    const avgDailyEngagement = leads.length / dayEngagement.size;
    insights.push(`Average daily engagement: ${avgDailyEngagement.toFixed(1)} leads`);
  }

  return {
    data,
    peakEngagementDay: peakDay,
    peakEngagementHour: peakHour,
    insights,
  };
}

/**
 * Get engagement by day of week
 */
export function getEngagementByDayOfWeek(
  leads: Array<{ createdAt: Date | null }>
): Record<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', number> {
  const dayOfWeek: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts: Record<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  leads.forEach(lead => {
    if (!lead.createdAt) return;
    const day = dayOfWeek[new Date(lead.createdAt).getDay()];
    counts[day]++;
  });

  return counts;
}
