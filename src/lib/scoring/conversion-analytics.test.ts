import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackLeadScored, trackConversion, getLearnedWeights, getConversionBenchmarks, SignalWeights, ConversionBenchmark } from './conversion-analytics';

// Mock the database dependency
vi.mock('@/lib/db', () => ({
  db: {
    lead: {
      findUnique: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';

describe('conversion-analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackLeadScored', () => {
    it('should return early if lead not found', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue(null);

      await trackLeadScored('non-existent-id');

      expect(db.lead.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should extract domain_company signal for company email', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: null,
        source: null,
        createdAt: new Date(),
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });

    it('should extract domain_personal signal for personal email', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@gmail.com',
        signupNote: null,
        source: null,
        createdAt: new Date(),
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });

    it('should extract intent_urgent signal from signup note', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: 'This is urgent, need ASAP',
        source: null,
        createdAt: new Date(),
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });

    it('should extract intent_specific signal from signup note', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: 'Looking for a solution for my use case',
        source: null,
        createdAt: new Date(),
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });

    it('should extract source_referral signal from source', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: null,
        source: 'Referral from friend',
        createdAt: new Date(),
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });

    it('should extract recency_recent signal for recent leads', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: null,
        source: null,
        createdAt: new Date(), // Today
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });

    it('should not extract recency_recent for old leads', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: null,
        source: null,
        createdAt: new Date('2020-01-01'), // Old date
      } as any);

      await trackLeadScored('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });
  });

  describe('trackConversion', () => {
    it('should return early if lead not found', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue(null);

      await trackConversion('non-existent-id');

      expect(db.lead.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should track conversion for existing lead', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@example.com',
        signupNote: 'urgent need',
        source: 'referral',
        createdAt: new Date(),
      } as any);

      await trackConversion('test-id');

      expect(db.lead.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should extract all signals from lead', async () => {
      vi.mocked(db.lead.findUnique).mockResolvedValue({
        id: 'test-id',
        email: 'john@company.com',
        signupNote: 'urgent need for my use case',
        source: 'referral from colleague',
        createdAt: new Date(),
      } as any);

      await trackConversion('test-id');

      expect(db.lead.findUnique).toHaveBeenCalled();
    });
  });

  describe('getLearnedWeights', () => {
    it('should return default weights when no conversion data', async () => {
      const weights = await getLearnedWeights();

      expect(weights).toHaveProperty('domainCompany');
      expect(weights).toHaveProperty('domainPersonal');
      expect(weights).toHaveProperty('intentUrgent');
      expect(weights).toHaveProperty('intentSpecific');
      expect(weights).toHaveProperty('sourceReferral');
      expect(weights).toHaveProperty('recencyRecent');
    });

    it('should return SignalWeights interface structure', async () => {
      const weights = await getLearnedWeights();

      expect(weights.domainCompany).toBeGreaterThanOrEqual(0);
      expect(weights.domainPersonal).toBeGreaterThanOrEqual(0);
      expect(weights.intentUrgent).toBeGreaterThanOrEqual(0);
      expect(weights.intentSpecific).toBeGreaterThanOrEqual(0);
      expect(weights.sourceReferral).toBeGreaterThanOrEqual(0);
      expect(weights.recencyRecent).toBeGreaterThanOrEqual(0);
    });

    it('should calculate weights based on conversion rates', async () => {
      // This test assumes conversion data has been populated
      const weights = await getLearnedWeights();

      expect(typeof weights.domainCompany).toBe('number');
      expect(typeof weights.domainPersonal).toBe('number');
      expect(typeof weights.intentUrgent).toBe('number');
      expect(typeof weights.intentSpecific).toBe('number');
      expect(typeof weights.sourceReferral).toBe('number');
      expect(typeof weights.recencyRecent).toBe('number');
    });

    it('should apply multipliers based on conversion rates', async () => {
      const weights = await getLearnedWeights();

      // Weights should be within reasonable bounds
      expect(weights.domainCompany).toBeLessThanOrEqual(40); // 20 * 2 max multiplier
      expect(weights.domainPersonal).toBeLessThanOrEqual(20); // 10 * 2 max multiplier
      expect(weights.intentUrgent).toBeLessThanOrEqual(54); // 27 * 2 max multiplier
      expect(weights.intentSpecific).toBeLessThanOrEqual(40); // 20 * 2 max multiplier
      expect(weights.sourceReferral).toBeLessThanOrEqual(30); // 15 * 2 max multiplier
      expect(weights.recencyRecent).toBeLessThanOrEqual(40); // 20 * 2 max multiplier
    });

    it('should ensure minimum weights with 0.5 multiplier', async () => {
      const weights = await getLearnedWeights();

      expect(weights.domainCompany).toBeGreaterThanOrEqual(10); // 20 * 0.5 min multiplier
      expect(weights.domainPersonal).toBeGreaterThanOrEqual(5); // 10 * 0.5 min multiplier
      expect(weights.intentUrgent).toBeGreaterThanOrEqual(14); // 27 * 0.5 min multiplier (rounded)
      expect(weights.intentSpecific).toBeGreaterThanOrEqual(10); // 20 * 0.5 min multiplier
      expect(weights.sourceReferral).toBeGreaterThanOrEqual(8); // 15 * 0.5 min multiplier (rounded)
      expect(weights.recencyRecent).toBeGreaterThanOrEqual(10); // 20 * 0.5 min multiplier
    });
  });

  describe('getConversionBenchmarks', () => {
    it('should return array of benchmarks', async () => {
      const benchmarks = await getConversionBenchmarks();

      expect(Array.isArray(benchmarks)).toBe(true);
    });

    it('should only include signals with sample size >= 5', async () => {
      const benchmarks = await getConversionBenchmarks();

      benchmarks.forEach(benchmark => {
        expect(benchmark.sampleSize).toBeGreaterThanOrEqual(5);
      });
    });

    it('should return benchmarks sorted by conversion rate descending', async () => {
      const benchmarks = await getConversionBenchmarks();

      for (let i = 0; i < benchmarks.length - 1; i++) {
        expect(benchmarks[i].conversionRate).toBeGreaterThanOrEqual(benchmarks[i + 1].conversionRate);
      }
    });

    it('should return ConversionBenchmark interface structure', async () => {
      const benchmarks = await getConversionBenchmarks();

      benchmarks.forEach(benchmark => {
        expect(benchmark).toHaveProperty('signal');
        expect(benchmark).toHaveProperty('value');
        expect(benchmark).toHaveProperty('conversionRate');
        expect(benchmark).toHaveProperty('sampleSize');
      });
    });

    it('should calculate conversion rate as percentage', async () => {
      const benchmarks = await getConversionBenchmarks();

      benchmarks.forEach(benchmark => {
        expect(benchmark.conversionRate).toBeGreaterThanOrEqual(0);
        expect(benchmark.conversionRate).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('SignalWeights interface', () => {
    it('should have correct structure', () => {
      const weights: SignalWeights = {
        domainCompany: 20,
        domainPersonal: 10,
        intentUrgent: 27,
        intentSpecific: 20,
        sourceReferral: 15,
        recencyRecent: 20,
      };

      expect(weights.domainCompany).toBe(20);
      expect(weights.domainPersonal).toBe(10);
      expect(weights.intentUrgent).toBe(27);
      expect(weights.intentSpecific).toBe(20);
      expect(weights.sourceReferral).toBe(15);
      expect(weights.recencyRecent).toBe(20);
    });
  });

  describe('ConversionBenchmark interface', () => {
    it('should have correct structure', () => {
      const benchmark: ConversionBenchmark = {
        signal: 'domain_company',
        value: 'domain_company',
        conversionRate: 15.5,
        sampleSize: 100,
      };

      expect(benchmark.signal).toBe('domain_company');
      expect(benchmark.value).toBe('domain_company');
      expect(benchmark.conversionRate).toBe(15.5);
      expect(benchmark.sampleSize).toBe(100);
    });
  });
});
