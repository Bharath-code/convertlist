import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface AnalyticsMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageScore: number;
  funnelData: Array<{ label: string; count: number; color: string }>;
  cohortData: Array<{ period: string; total: number; retention: number[] }>;
  forecastData: Array<{ month: string; predicted: number; lower?: number; upper?: number }>;
  sourceData: Array<{ source: string; count: number; conversionRate: number }>;
}

export async function getAnalyticsMetrics(waitlistId?: string): Promise<AnalyticsMetrics> {
  const where = waitlistId ? { waitlistId } : {};

  // Basic counts
  const totalLeads = await db.lead.count({ where });
  const convertedLeads = await db.lead.count({
    where: { ...where, status: 'converted' },
  });

  // Average score
  const avgScoreResult = await db.lead.aggregate({
    where,
    _avg: { score: true },
  });
  const averageScore = avgScoreResult._avg.score || 0;

  // Funnel data (based on lead status)
  const statusCounts = await db.lead.groupBy({
    by: ['status'],
    where,
    _count: true,
  });

  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => {
    statusMap[s.status] = s._count;
  });

  const funnelData = [
    { label: 'New Leads', count: statusMap['new'] || 0, color: '#3b82f6' },
    { label: 'Contacted', count: statusMap['contacted'] || 0, color: '#8b5cf6' },
    { label: 'Engaged', count: statusMap['engaged'] || 0, color: '#f59e0b' },
    { label: 'Qualified', count: statusMap['qualified'] || 0, color: '#10b981' },
    { label: 'Converted', count: convertedLeads, color: '#059669' },
  ];

  // Cohort data (simplified - by signup month)
  const cohortData = await generateCohortData(where);

  // Forecast data (simple linear projection)
  const forecastData = generateForecastData(convertedLeads, totalLeads);

  // Source attribution
  const sourceCounts = await db.lead.groupBy({
    by: ['source'],
    where,
    _count: true,
  });

  const sourceData = await Promise.all(
    sourceCounts.map(async (s) => {
      const sourceConversions = await db.lead.count({
        where: { ...where, source: s.source || null, status: 'converted' },
      });
      return {
        source: s.source || 'Unknown',
        count: s._count,
        conversionRate: s._count > 0 ? (sourceConversions / s._count) * 100 : 0,
      };
    })
  );

  return {
    totalLeads,
    convertedLeads,
    conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
    averageScore,
    funnelData,
    cohortData,
    forecastData,
    sourceData,
  };
}

async function generateCohortData(where: any) {
  // Simplified cohort generation - in production, this would be more sophisticated
  const cohorts = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const periodLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    // Mock retention data - replace with actual calculation
    const baseRetention = Math.floor(Math.random() * 30) + 40;
    const retention = [
      100,
      Math.max(0, baseRetention - Math.floor(Math.random() * 20)),
      Math.max(0, baseRetention - Math.floor(Math.random() * 30)),
      Math.max(0, baseRetention - Math.floor(Math.random() * 40)),
      Math.max(0, baseRetention - Math.floor(Math.random() * 50)),
      Math.max(0, baseRetention - Math.floor(Math.random() * 60)),
    ];

    cohorts.push({
      period: periodLabel,
      total: Math.floor(Math.random() * 100) + 50, // Mock count
      retention,
    });
  }

  return cohorts;
}

function generateForecastData(currentConverted: number, totalLeads: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseValue = currentConverted > 0 ? currentConverted : totalLeads * 0.1;
  
  return months.map((month, i) => {
    const growth = 1 + (i * 0.15); // 15% monthly growth
    const predicted = baseValue * growth;
    const variance = predicted * 0.2; // 20% confidence interval
    
    return {
      month,
      predicted: Math.round(predicted),
      lower: Math.round(predicted - variance),
      upper: Math.round(predicted + variance),
    };
  });
}
