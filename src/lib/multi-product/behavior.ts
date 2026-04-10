/**
 * Cross-Product Behavior Tracking
 * 
 * Tracks which users sign up for multiple products and their patterns.
 * Analyzes behavior across multiple products to identify super-users.
 */

export interface ProductSignup {
  productId: string;
  productName: string;
  signupDate: Date;
  timeToConvert?: number; // in hours
  converted: boolean;
}

export interface CrossProductBehavior {
  userId: string;
  productHistory: ProductSignup[];
  totalProducts: number;
  conversionRate: number;
  avgTimeToConvert: number;
  pattern: 'early_adopter' | 'regular' | 'late_adopter' | 'power_user';
}

/**
 * Track a product signup for a user
 */
export function trackProductSignup(
  userId: string,
  productId: string,
  productName: string
): ProductSignup {
  return {
    productId,
    productName,
    signupDate: new Date(),
    converted: false,
  };
}

/**
 * Analyze cross-product behavior for a user
 */
export function analyzeCrossProductBehavior(
  productHistory: ProductSignup[]
): CrossProductBehavior {
  const totalProducts = productHistory.length;
  const convertedProducts = productHistory.filter(p => p.converted).length;
  const conversionRate = totalProducts > 0 ? (convertedProducts / totalProducts) * 100 : 0;

  const timeToConverts = productHistory
    .filter(p => p.timeToConvert !== undefined)
    .map(p => p.timeToConvert!);
  const avgTimeToConvert = timeToConverts.length > 0
    ? timeToConverts.reduce((a, b) => a + b, 0) / timeToConverts.length
    : 0;

  const pattern = determineBehaviorPattern(productHistory, avgTimeToConvert);

  return {
    userId: '', // Will be set by caller
    productHistory,
    totalProducts,
    conversionRate,
    avgTimeToConvert,
    pattern,
  };
}

/**
 * Determine behavior pattern based on product history
 */
function determineBehaviorPattern(
  productHistory: ProductSignup[],
  avgTimeToConvert: number
): 'early_adopter' | 'regular' | 'late_adopter' | 'power_user' {
  if (productHistory.length >= 3) {
    return 'power_user';
  }

  if (avgTimeToConvert < 24) {
    return 'early_adopter';
  }

  if (avgTimeToConvert > 168) { // 1 week
    return 'late_adopter';
  }

  return 'regular';
}

/**
 * Find users with similar product patterns
 */
export function findUsersWithSimilarPatterns(
  userBehavior: CrossProductBehavior,
  allBehaviors: CrossProductBehavior[]
): CrossProductBehavior[] {
  return allBehaviors.filter(
    b => b.pattern === userBehavior.pattern && b.userId !== userBehavior.userId
  );
}

/**
 * Get product overlap statistics
 */
export function getProductOverlapStats(
  allBehaviors: CrossProductBehavior[]
): Record<string, { userCount: number; conversionRate: number }> {
  const productStats = new Map<string, { userCount: number; conversionRate: number }>();

  allBehaviors.forEach(behavior => {
    behavior.productHistory.forEach(product => {
      if (!productStats.has(product.productId)) {
        productStats.set(product.productId, { userCount: 0, conversionRate: 0 });
      }
      const stats = productStats.get(product.productId)!;
      stats.userCount++;
    });
  });

  // Calculate conversion rates
  allBehaviors.forEach(behavior => {
    behavior.productHistory.forEach(product => {
      if (product.converted) {
        const stats = productStats.get(product.productId);
        if (stats) {
          stats.conversionRate = (stats.conversionRate * (stats.userCount - 1) + 100) / stats.userCount;
        }
      }
    });
  });

  return Object.fromEntries(productStats);
}

/**
 * Identify power users (users with 3+ products)
 */
export function identifyPowerUsers(
  allBehaviors: CrossProductBehavior[]
): CrossProductBehavior[] {
  return allBehaviors.filter(b => b.totalProducts >= 3)
    .sort((a, b) => b.totalProducts - a.totalProducts);
}

/**
 * Calculate cross-product retention rate
 */
export function calculateCrossProductRetention(
  allBehaviors: CrossProductBehavior[]
): {
  multiProductUsers: number;
  retainedAfterSecond: number;
  retentionRate: number;
} {
  const multiProductUsers = allBehaviors.filter(b => b.totalProducts >= 2).length;
  const retainedAfterSecond = allBehaviors.filter(b => b.totalProducts >= 2 && b.conversionRate > 50).length;
  
  const retentionRate = multiProductUsers > 0
    ? (retainedAfterSecond / multiProductUsers) * 100
    : 0;

  return {
    multiProductUsers,
    retainedAfterSecond,
    retentionRate,
  };
}
