import { describe, it, expect } from 'vitest';
import { safeDate, isValidISODate } from './date-validation';

describe('date-validation', () => {
  describe('safeDate', () => {
    it('should return null for null input', () => {
      const result = safeDate(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = safeDate(undefined);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = safeDate('');
      expect(result).toBeNull();
    });

    it('should parse valid date string', () => {
      const result = safeDate('2024-01-01');
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should parse ISO date string', () => {
      const result = safeDate('2024-01-01T00:00:00.000Z');
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return Date object when given Date object', () => {
      const inputDate = new Date('2024-01-01');
      const result = safeDate(inputDate);
      expect(result).not.toBeNull();
      expect(result?.getTime()).toBe(inputDate.getTime());
    });

    it('should return null for invalid date string', () => {
      const result = safeDate('invalid-date');
      expect(result).toBeNull();
    });

    it('should return null for date string that results in NaN', () => {
      const result = safeDate('not a date');
      expect(result).toBeNull();
    });

    it('should handle date with time', () => {
      const result = safeDate('2024-01-01T12:30:00');
      expect(result).not.toBeNull();
      expect(result?.getHours()).toBe(12);
      expect(result?.getMinutes()).toBe(30);
    });

    it('should handle various date formats', () => {
      const result1 = safeDate('January 1, 2024');
      expect(result1).not.toBeNull();

      const result2 = safeDate('01/01/2024');
      expect(result2).not.toBeNull();

      const result3 = safeDate('2024-01-01');
      expect(result3).not.toBeNull();
    });

    it('should handle edge case dates', () => {
      const result1 = safeDate('1970-01-01');
      expect(result1).not.toBeNull();

      const result2 = safeDate('2099-12-31');
      expect(result2).not.toBeNull();
    });
  });

  describe('isValidISODate', () => {
    it('should return true for valid ISO date string', () => {
      const result = isValidISODate('2024-01-01T00:00:00.000Z');
      expect(result).toBe(true);
    });

    it('should return false for invalid date string', () => {
      const result = isValidISODate('invalid-date');
      expect(result).toBe(false);
    });

    it('should return false for non-ISO format', () => {
      const result = isValidISODate('2024-01-01');
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = isValidISODate('');
      expect(result).toBe(false);
    });

    it('should return true for ISO date with timezone', () => {
      const result = isValidISODate('2024-01-01T00:00:00.000Z');
      expect(result).toBe(true);
    });

    it('should return false for date string that is not exact ISO match', () => {
      const result = isValidISODate('2024-01-01T00:00:00Z'); // Missing milliseconds
      expect(result).toBe(false);
    });

    it('should handle ISO date with offset', () => {
      const result = isValidISODate('2024-01-01T00:00:00.000+00:00');
      expect(result).toBe(false); // This doesn't match the exact format
    });

    it('should return false for malformed ISO date', () => {
      const result = isValidISODate('2024-13-01T00:00:00.000Z'); // Invalid month
      expect(result).toBe(false);
    });

    it('should return false for date with extra characters', () => {
      const result = isValidISODate('2024-01-01T00:00:00.000Z extra');
      expect(result).toBe(false);
    });
  });
});
