/**
 * Simple in-memory caching utility for expensive operations
 * 
 * For production, consider using Redis or a dedicated caching service.
 * This implementation uses an in-memory Map with TTL support.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start the cleanup interval for expired entries
 * Should be called once at application startup
 */
export function startCleanupInterval(): void {
  if (!cleanupInterval && typeof setInterval !== 'undefined') {
    cleanupInterval = setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
  }
}

/**
 * Stop the cleanup interval
 * Should be called on application shutdown
 */
export function stopCleanupInterval(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Get the current cleanup interval ID (for testing purposes)
 */
export function getCleanupInterval(): NodeJS.Timeout | null {
  return cleanupInterval;
}

/**
 * Get a value from cache
 * 
 * @param key - Cache key
 * @returns Cached value or null if not found or expired
 */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.value as T;
}

/**
 * Set a value in cache with TTL
 * 
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 */
export function setCache<T>(key: string, value: T, ttlSeconds: number = 300): void {
  const expiresAt = Date.now() + (ttlSeconds * 1000);
  cache.set(key, { value, expiresAt });
}

/**
 * Delete a value from cache
 * 
 * @param key - Cache key
 */
export function deleteCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clean up expired entries
 * Call this periodically (e.g., every 5 minutes)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
// Note: Call startCleanupInterval() at application startup instead of auto-starting
// to prevent multiple intervals in development hot-reload scenarios
if (typeof setInterval !== 'undefined' && !cleanupInterval) {
  startCleanupInterval();
}

/**
 * Cache decorator for async functions
 * Note: This is a placeholder for future implementation
 * 
 * @param keyPrefix - Prefix for cache keys
 * @param ttlSeconds - Time to live in seconds
 * @returns Decorated function with caching
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  keyPrefix: string,
  ttlSeconds: number = 300
): (fn: T) => T {
  // TODO: Implement proper decorator pattern
  return (fn: T) => fn;
}

/**
 * Get or set cache value
 * If key exists and is not expired, return cached value
 * Otherwise, compute value using the provided function and cache it
 * 
 * @param key - Cache key
 * @param fn - Function to compute value if not cached
 * @param ttlSeconds - Time to live in seconds
 * @returns Cached or computed value
 */
export async function getOrSetCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  const value = await fn();
  setCache(key, value, ttlSeconds);
  return value;
}

/**
 * Generate a cache key from parameters
 * 
 * @param prefix - Key prefix
 * @param params - Parameters to include in key
 * @returns Cache key
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

/**
 * Cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let active = 0;
  
  for (const entry of cache.values()) {
    if (now > entry.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    total: cache.size,
    active,
    expired,
  };
}
