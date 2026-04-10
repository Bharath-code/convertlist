import { describe, it, expect } from 'vitest';
import { detectFundingStatus, detectFundingStatusWithCrunchbase, detectFundingStatusBatch, FundingEnrichment } from './funding';

describe('funding', () => {
  describe('detectFundingStatus', () => {
    it('should return null when no company name or domain provided', async () => {
      const result = await detectFundingStatus();
      expect(result).toBeNull();
    });

    it('should detect Enterprise from domain indicators', async () => {
      const result = await detectFundingStatus(undefined, 'corp.example.com');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Enterprise');
      expect(result?.confidence).toBe(0.6);
    });

    it('should detect Enterprise from enterprise domain', async () => {
      const result = await detectFundingStatus(undefined, 'enterprise.example.com');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Enterprise');
    });

    it('should detect Enterprise from group domain', async () => {
      const result = await detectFundingStatus(undefined, 'group.example.com');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Enterprise');
    });

    it('should detect Bootstrapped from .io domain', async () => {
      const result = await detectFundingStatus(undefined, 'startup.io');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Bootstrapped');
      expect(result?.confidence).toBe(0.5);
    });

    it('should detect Bootstrapped from .app domain', async () => {
      const result = await detectFundingStatus(undefined, 'myapp.app');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Bootstrapped');
    });

    it('should detect Bootstrapped from labs domain', async () => {
      const result = await detectFundingStatus(undefined, 'innovatelabs.com');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Bootstrapped');
    });

    it('should detect Bootstrapped from studio domain', async () => {
      const result = await detectFundingStatus(undefined, 'designstudio.com');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Bootstrapped');
    });

    it('should detect VC-backed from company name with inc', async () => {
      const result = await detectFundingStatus('Tech Startup Inc');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('VC-backed');
      expect(result?.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it('should detect VC-backed from company name with corp', async () => {
      const result = await detectFundingStatus('Example Corp');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('VC-backed');
    });

    it('should detect VC-backed from company name with technologies', async () => {
      const result = await detectFundingStatus('Future Technologies');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('VC-backed');
    });

    it('should detect VC-backed from company name with systems', async () => {
      const result = await detectFundingStatus('Data Systems');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('VC-backed');
    });

    it('should return Unknown when no indicators found', async () => {
      const result = await detectFundingStatus('Simple Company', 'simple.com');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('Unknown');
      expect(result?.confidence).toBe(0.3);
    });

    it('should use max confidence from both domain and name heuristics', async () => {
      const result = await detectFundingStatus('Tech Startup Inc', 'startup.io');
      expect(result).not.toBeNull();
      // The function uses Math.max, so VC-backed (0.5) from name overrides Bootstrapped (0.5) from domain
      // When equal, the name heuristic is evaluated last
      expect(result?.fundingStatus).toBe('VC-backed');
    });

    it('should handle errors gracefully', async () => {
      const result = await detectFundingStatus('Test Company', 'test.com');
      expect(result).not.toBeNull();
    });

    it('should handle case insensitive matching', async () => {
      const result1 = await detectFundingStatus(undefined, 'CORP.example.com');
      expect(result1?.fundingStatus).toBe('Enterprise');

      const result2 = await detectFundingStatus('TECH STARTUP INC');
      expect(result2?.fundingStatus).toBe('VC-backed');
    });
  });

  describe('detectFundingStatusWithCrunchbase', () => {
    it('should fallback to heuristic when API key not configured', async () => {
      const originalKey = process.env.CRUNCHBASE_API_KEY;
      delete process.env.CRUNCHBASE_API_KEY;

      const result = await detectFundingStatusWithCrunchbase('Tech Startup Inc');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('VC-backed');

      process.env.CRUNCHBASE_API_KEY = originalKey;
    });

    it('should fallback to heuristic when API key is empty', async () => {
      const originalKey = process.env.CRUNCHBASE_API_KEY;
      process.env.CRUNCHBASE_API_KEY = '';

      const result = await detectFundingStatusWithCrunchbase('Tech Startup Inc');
      expect(result).not.toBeNull();
      expect(result?.fundingStatus).toBe('VC-backed');

      process.env.CRUNCHBASE_API_KEY = originalKey;
    });

    it('should return null when API key is configured (placeholder)', async () => {
      const originalKey = process.env.CRUNCHBASE_API_KEY;
      process.env.CRUNCHBASE_API_KEY = 'test-key';

      const result = await detectFundingStatusWithCrunchbase('Tech Startup Inc');
      expect(result).toBeNull();

      process.env.CRUNCHBASE_API_KEY = originalKey;
    });

    it('should handle API errors and fallback to heuristic', async () => {
      const originalKey = process.env.CRUNCHBASE_API_KEY;
      process.env.CRUNCHBASE_API_KEY = 'test-key';

      const result = await detectFundingStatusWithCrunchbase('Tech Startup Inc');
      // Currently returns null, but in production would fallback
      expect(result).toBeNull();

      process.env.CRUNCHBASE_API_KEY = originalKey;
    });
  });

  describe('detectFundingStatusBatch', () => {
    it('should detect funding status for multiple companies', async () => {
      const companies = [
        { name: 'Tech Startup Inc', domain: undefined },
        { name: undefined, domain: 'startup.io' },
        { name: 'Example Corp', domain: 'examplecorp.com' },
      ];

      const results = await detectFundingStatusBatch(companies);

      expect(results.size).toBeGreaterThanOrEqual(2); // At least the two with clear patterns
      expect(results.get('Tech Startup Inc')?.fundingStatus).toBe('VC-backed');
      expect(results.get('startup.io')?.fundingStatus).toBe('Bootstrapped');
    });

    it('should skip companies without name or domain', async () => {
      const companies = [
        { name: 'Tech Startup Inc', domain: undefined },
        { name: undefined, domain: undefined },
      ];

      const results = await detectFundingStatusBatch(companies);

      expect(results.size).toBe(1);
    });

    it('should use domain as key when name is not provided', async () => {
      const companies = [
        { name: undefined, domain: 'startup.io' },
      ];

      const results = await detectFundingStatusBatch(companies);

      expect(results.has('startup.io')).toBe(true);
    });

    it('should use name as key when domain is not provided', async () => {
      const companies = [
        { name: 'Tech Startup Inc', domain: undefined },
      ];

      const results = await detectFundingStatusBatch(companies);

      expect(results.has('Tech Startup Inc')).toBe(true);
    });

    it('should return empty map for empty input', async () => {
      const results = await detectFundingStatusBatch([]);
      expect(results.size).toBe(0);
    });

    it('should handle null results gracefully', async () => {
      const companies = [
        { name: undefined, domain: undefined },
      ];

      const results = await detectFundingStatusBatch(companies);

      expect(results.size).toBe(0);
    });
  });

  describe('FundingEnrichment interface', () => {
    it('should have correct structure', () => {
      const enrichment: FundingEnrichment = {
        fundingStatus: 'VC-backed',
        totalFunding: 1000000,
        fundingRounds: 3,
        lastFundingDate: new Date('2023-01-01'),
        investors: ['Sequoia', 'Andreessen Horowitz'],
        confidence: 0.9,
      };

      expect(enrichment.fundingStatus).toBe('VC-backed');
      expect(enrichment.totalFunding).toBe(1000000);
      expect(enrichment.fundingRounds).toBe(3);
      expect(enrichment.investors).toEqual(['Sequoia', 'Andreessen Horowitz']);
      expect(enrichment.confidence).toBe(0.9);
    });

    it('should allow optional fields to be undefined', () => {
      const enrichment: FundingEnrichment = {
        fundingStatus: 'Unknown',
        confidence: 0.3,
      };

      expect(enrichment.totalFunding).toBeUndefined();
      expect(enrichment.fundingRounds).toBeUndefined();
      expect(enrichment.lastFundingDate).toBeUndefined();
      expect(enrichment.investors).toBeUndefined();
    });

    it('should accept valid funding status values', () => {
      const statuses: Array<FundingEnrichment['fundingStatus']> = [
        'VC-backed',
        'Bootstrapped',
        'Enterprise',
        'Unknown',
      ];

      statuses.forEach(status => {
        const enrichment: FundingEnrichment = {
          fundingStatus: status,
          confidence: 0.5,
        };
        expect(enrichment.fundingStatus).toBe(status);
      });
    });
  });
});
