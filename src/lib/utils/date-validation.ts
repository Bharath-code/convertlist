/**
 * Date Validation Utilities
 */

/**
 * Safely convert a date string or Date object to a Date object
 * Returns null if the input is invalid
 */
export function safeDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  try {
    const parsed = new Date(date);
    // Check if the date is valid
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validate if a date string is a valid ISO date
 */
export function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString() === dateString;
  } catch {
    return false;
  }
}
