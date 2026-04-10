import { describe, it, expect } from 'vitest';
import { SCORING_CONSTANTS } from './scoring';

describe('SCORING_CONSTANTS', () => {
  it('should export all required constants', () => {
    expect(SCORING_CONSTANTS).toBeDefined();
    expect(SCORING_CONSTANTS).toHaveProperty('READINESS_HIGH');
    expect(SCORING_CONSTANTS).toHaveProperty('READINESS_MEDIUM');
    expect(SCORING_CONSTANTS).toHaveProperty('READINESS_LOW');
    expect(SCORING_CONSTANTS).toHaveProperty('LEAD_HOT');
    expect(SCORING_CONSTANTS).toHaveProperty('LEAD_WARM_HIGH');
    expect(SCORING_CONSTANTS).toHaveProperty('LEAD_WARM_LOW');
    expect(SCORING_CONSTANTS).toHaveProperty('LEAD_COLD');
    expect(SCORING_CONSTANTS).toHaveProperty('ADVOCATE_SUPER');
    expect(SCORING_CONSTANTS).toHaveProperty('ADVOCATE_STANDARD');
    expect(SCORING_CONSTANTS).toHaveProperty('ADVOCATE_POTENTIAL');
    expect(SCORING_CONSTANTS).toHaveProperty('CONFIDENCE_LEAD_THRESHOLD');
    expect(SCORING_CONSTANTS).toHaveProperty('CONFIDENCE_PRICING_THRESHOLD');
    expect(SCORING_CONSTANTS).toHaveProperty('CONFIDENCE_DISCOUNT_THRESHOLD');
    expect(SCORING_CONSTANTS).toHaveProperty('ENGAGEMENT_DEPTH_MAX');
    expect(SCORING_CONSTANTS).toHaveProperty('LEAD_COUNT_BONUS_THRESHOLD');
    expect(SCORING_CONSTANTS).toHaveProperty('DISCOUNT_HIGH');
    expect(SCORING_CONSTANTS).toHaveProperty('DISCOUNT_MEDIUM');
    expect(SCORING_CONSTANTS).toHaveProperty('DISCOUNT_LOW');
    expect(SCORING_CONSTANTS).toHaveProperty('VIRALITY_MULTIPLIER');
  });

  describe('Readiness score thresholds', () => {
    it('should have correct readiness thresholds in descending order', () => {
      expect(SCORING_CONSTANTS.READINESS_HIGH).toBe(80);
      expect(SCORING_CONSTANTS.READINESS_MEDIUM).toBe(60);
      expect(SCORING_CONSTANTS.READINESS_LOW).toBe(40);
      expect(SCORING_CONSTANTS.READINESS_HIGH).toBeGreaterThan(SCORING_CONSTANTS.READINESS_MEDIUM);
      expect(SCORING_CONSTANTS.READINESS_MEDIUM).toBeGreaterThan(SCORING_CONSTANTS.READINESS_LOW);
    });
  });

  describe('Lead score thresholds', () => {
    it('should have correct lead thresholds', () => {
      expect(SCORING_CONSTANTS.LEAD_HOT).toBe(70);
      expect(SCORING_CONSTANTS.LEAD_WARM_HIGH).toBe(70);
      expect(SCORING_CONSTANTS.LEAD_WARM_LOW).toBe(50);
      expect(SCORING_CONSTANTS.LEAD_COLD).toBe(50);
    });

    it('should have hot/warm thresholds above cold threshold', () => {
      expect(SCORING_CONSTANTS.LEAD_HOT).toBeGreaterThanOrEqual(SCORING_CONSTANTS.LEAD_COLD);
      expect(SCORING_CONSTANTS.LEAD_WARM_HIGH).toBeGreaterThanOrEqual(SCORING_CONSTANTS.LEAD_COLD);
    });
  });

  describe('Advocate potential thresholds', () => {
    it('should have advocate thresholds in 0-1 range', () => {
      expect(SCORING_CONSTANTS.ADVOCATE_SUPER).toBe(0.8);
      expect(SCORING_CONSTANTS.ADVOCATE_STANDARD).toBe(0.6);
      expect(SCORING_CONSTANTS.ADVOCATE_POTENTIAL).toBe(0.4);
    });

    it('should have thresholds in descending order', () => {
      expect(SCORING_CONSTANTS.ADVOCATE_SUPER).toBeGreaterThan(SCORING_CONSTANTS.ADVOCATE_STANDARD);
      expect(SCORING_CONSTANTS.ADVOCATE_STANDARD).toBeGreaterThan(SCORING_CONSTANTS.ADVOCATE_POTENTIAL);
    });

    it('should all be within valid 0-1 range', () => {
      expect(SCORING_CONSTANTS.ADVOCATE_SUPER).toBeLessThanOrEqual(1);
      expect(SCORING_CONSTANTS.ADVOCATE_SUPER).toBeGreaterThanOrEqual(0);
      expect(SCORING_CONSTANTS.ADVOCATE_STANDARD).toBeLessThanOrEqual(1);
      expect(SCORING_CONSTANTS.ADVOCATE_STANDARD).toBeGreaterThanOrEqual(0);
      expect(SCORING_CONSTANTS.ADVOCATE_POTENTIAL).toBeLessThanOrEqual(1);
      expect(SCORING_CONSTANTS.ADVOCATE_POTENTIAL).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Confidence calculation divisors', () => {
    it('should have correct confidence thresholds', () => {
      expect(SCORING_CONSTANTS.CONFIDENCE_LEAD_THRESHOLD).toBe(50);
      expect(SCORING_CONSTANTS.CONFIDENCE_PRICING_THRESHOLD).toBe(30);
      expect(SCORING_CONSTANTS.CONFIDENCE_DISCOUNT_THRESHOLD).toBe(30);
    });
  });

  describe('Engagement depth', () => {
    it('should have correct engagement depth max', () => {
      expect(SCORING_CONSTANTS.ENGAGEMENT_DEPTH_MAX).toBe(200);
    });
  });

  describe('Lead count bonus', () => {
    it('should have correct lead count bonus threshold', () => {
      expect(SCORING_CONSTANTS.LEAD_COUNT_BONUS_THRESHOLD).toBe(100);
    });
  });

  describe('Discount percentages', () => {
    it('should have correct discount percentages', () => {
      expect(SCORING_CONSTANTS.DISCOUNT_HIGH).toBe(30);
      expect(SCORING_CONSTANTS.DISCOUNT_MEDIUM).toBe(20);
      expect(SCORING_CONSTANTS.DISCOUNT_LOW).toBe(10);
    });

    it('should have discounts in descending order', () => {
      expect(SCORING_CONSTANTS.DISCOUNT_HIGH).toBeGreaterThan(SCORING_CONSTANTS.DISCOUNT_MEDIUM);
      expect(SCORING_CONSTANTS.DISCOUNT_MEDIUM).toBeGreaterThan(SCORING_CONSTANTS.DISCOUNT_LOW);
    });
  });

  describe('Virality multiplier', () => {
    it('should have correct virality multiplier', () => {
      expect(SCORING_CONSTANTS.VIRALITY_MULTIPLIER).toBe(100);
    });
  });

  describe('Object structure', () => {
    it('should be a const object', () => {
      // TypeScript const assertion provides type-level immutability
      // Runtime mutability is not enforced by const
      expect(typeof SCORING_CONSTANTS).toBe('object');
    });
  });
});
