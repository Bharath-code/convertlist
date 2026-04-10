/**
 * Multi-Product Conversion Tracking
 * 
 * Tracks conversion rates across multiple products.
 * Analyzes how multi-product engagement affects overall conversion.
 */

import { db } from '@/lib/db';

export interface MultiProductConversionMetrics {
  totalUsers: number;
  singleProductUsers: number;
  multiProductUsers: number;
  multiProductConversionRate: number;
  singleProductConversionRate: number;
  lift: number; // % improvement from multi-product
}

export interface MultiProductConversionInsights {
  metrics: MultiProductConversionMetrics;
  summary: string;
  recommendations: string[];
}

/**
 * Track multi-product conversion
 */
export async function trackMultiProductConversion(
  userId: string,
  productId: string,
  converted: boolean
) {
  try {
    console.log(`[Multi-Product Conversion] User ${userId} on product ${productId} converted: ${converted}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to track multi-product conversion:', error);
    return { success: false };
  }
}

/**
 * Calculate multi-product conversion metrics
 */
export async function calculateMultiProductConversionMetrics(): Promise<MultiProductConversionInsights> {
  try {
    const users = await db.user.findMany({
      include: {
        waitlists: {
          include: {
            leads: {
              select: { status: true },
            },
          },
        },
      },
    });

    const totalUsers = users.length;
    const multiProductUsers = users.filter(u => u.waitlists.length >= 2).length;
    const singleProductUsers = users.filter(u => u.waitlists.length === 1).length;

    // Calculate conversion rates
    const multiProductConverted = users.filter(u => {
      if (u.waitlists.length < 2) return false;
      return u.waitlists.some(w => w.leads.some(l => l.status === 'PAID'));
    }).length;

    const singleProductConverted = users.filter(u => {
      if (u.waitlists.length !== 1) return false;
      return u.waitlists.some(w => w.leads.some(l => l.status === 'PAID'));
    }).length;

    const multiProductConversionRate = multiProductUsers > 0
      ? (multiProductConverted / multiProductUsers) * 100
      : 0;

    const singleProductConversionRate = singleProductUsers > 0
      ? (singleProductConverted / singleProductUsers) * 100
      : 0;

    const lift = singleProductConversionRate > 0
      ? ((multiProductConversionRate - singleProductConversionRate) / singleProductConversionRate) * 100
      : 0;

    const metrics: MultiProductConversionMetrics = {
      totalUsers,
      singleProductUsers,
      multiProductUsers,
      multiProductConversionRate,
      singleProductConversionRate,
      lift,
    };

    const summary = generateMultiProductSummary(metrics);
    const recommendations = generateMultiProductRecommendations(metrics);

    return {
      metrics,
      summary,
      recommendations,
    };
  } catch (error) {
    console.error('Failed to calculate multi-product conversion metrics:', error);
    return {
      metrics: {
        totalUsers: 0,
        singleProductUsers: 0,
        multiProductUsers: 0,
        multiProductConversionRate: 0,
        singleProductConversionRate: 0,
        lift: 0,
      },
      summary: 'No conversion data available',
      recommendations: [],
    };
  }
}

/**
 * Generate multi-product conversion summary
 */
function generateMultiProductSummary(metrics: MultiProductConversionMetrics): string {
  if (metrics.totalUsers === 0) {
    return 'No conversion data available';
  }

  const liftStr = metrics.lift > 0 ? `+${metrics.lift.toFixed(1)}% lift` : `${metrics.lift.toFixed(1)}% lift`;
  return `Multi-product users convert at ${metrics.multiProductConversionRate.toFixed(1)}% vs ${metrics.singleProductConversionRate.toFixed(1)}% for single-product users (${liftStr})`;
}

/**
 * Generate multi-product recommendations
 */
function generateMultiProductRecommendations(metrics: MultiProductConversionMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.totalUsers === 0) {
    return ['Track conversions to identify multi-product patterns'];
  }

  if (metrics.lift > 20) {
    recommendations.push('Multi-product engagement significantly improves conversion - encourage cross-product adoption');
  } else if (metrics.lift > 0) {
    recommendations.push('Multi-product engagement improves conversion - continue promoting cross-product value');
  } else {
    recommendations.push('Multi-product engagement does not currently improve conversion - investigate product fit');
  }

  if (metrics.multiProductUsers / metrics.totalUsers < 0.2) {
    recommendations.push('Low multi-product adoption - consider bundling or cross-promotion strategies');
  }

  return recommendations;
}

/**
 * Compare multi-product vs single-product conversion
 */
export function compareConversionByProductCount(
  metrics: MultiProductConversionMetrics
): {
  winner: string;
  difference: number;
  significant: boolean;
} {
  const difference = metrics.multiProductConversionRate - metrics.singleProductConversionRate;
  const winner = difference > 0 ? 'multi-product' : 'single-product';
  const significant = Math.abs(difference) > 10;

  return {
    winner,
    difference: Math.abs(difference),
    significant,
  };
}
