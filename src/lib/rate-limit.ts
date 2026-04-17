/**
 * Rate limiting utility for API endpoints
 * 
 * Uses in-memory storage for simplicity. For production, consider using Redis or a dedicated rate-limiting service.
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier for the requestor (IP address, userId, etc.)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute default
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    store.delete(identifier);
  }

  const current = store.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  if (now >= current.resetTime) {
    // Window has expired, reset
    current.count = 0;
    current.resetTime = now + windowMs;
  }

  if (current.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: current.resetTime,
    };
  }

  current.count++;
  store.set(identifier, current);

  return {
    success: true,
    limit,
    remaining: limit - current.count,
    reset: current.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to a generic identifier
  return 'anonymous';
}

/**
 * Clean up expired entries periodically
 * Call this on a timer (e.g., every 5 minutes)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
