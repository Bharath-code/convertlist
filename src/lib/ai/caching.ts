/**
 * AI Response Caching Utility
 * 
 * Caches expensive AI operations to reduce API costs and improve response times.
 * Uses the existing cache module with AI-specific helpers.
 */

import { getOrSetCache, generateCacheKey } from '../cache';

export interface AICacheOptions<T> {
  ttl?: number; // Time to live in seconds (default: 1 hour)
  fallback?: T | null;
}

/**
 * Cache AI structured output results
 */
export async function cacheAIOutput<T>(
  operation: string,
  inputs: Record<string, unknown>,
  generator: () => Promise<T | null>,
  options?: AICacheOptions<T>
): Promise<T | null> {
  const ttl = options?.ttl ?? 3600; // Default 1 hour
  const cacheKey = generateCacheKey(`ai:${operation}`, inputs);
  
  try {
    return await getOrSetCache(cacheKey, generator, ttl);
  } catch (error) {
    console.error(`AI cache error for ${operation}:`, error);
    return options?.fallback ?? null;
  }
}

/**
 * Generate cache key for AI operations
 */
export function generateAICacheKey(
  operation: string,
  params: Record<string, unknown>
): string {
  return generateCacheKey(`ai:${operation}`, params);
}

/**
 * Invalidate AI cache for specific operation
 */
export async function invalidateAICache(
  operation: string,
  inputs?: Record<string, unknown>
): Promise<void> {
  if (inputs) {
    const cacheKey = generateAICacheKey(operation, inputs);
    await import('../cache').then(({ deleteCache }) => deleteCache(cacheKey));
  } else {
    // Clear all AI cache for this operation
    console.warn(`Bulk invalidation not implemented for ai:${operation}`);
  }
}
