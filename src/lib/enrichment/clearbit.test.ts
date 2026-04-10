import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichLead, enrichLeads, isClearbitConfigured, ClearbitEnrichment } from './clearbit';

// Mock global fetch
global.fetch = vi.fn();

describe('clearbit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enrichLead', () => {
    it('should return null when API key is not configured', async () => {
      const originalKey = process.env.CLEARBIT_API_KEY;
      delete process.env.CLEARBIT_API_KEY;

      const result = await enrichLead('test@example.com');
      expect(result).toBeNull();

      process.env.CLEARBIT_API_KEY = originalKey;
    });

    it('should return null when API key is empty string', async () => {
      const originalKey = process.env.CLEARBIT_API_KEY;
      process.env.CLEARBIT_API_KEY = '';

      const result = await enrichLead('test@example.com');
      expect(result).toBeNull();

      process.env.CLEARBIT_API_KEY = originalKey;
    });

    it('should return null when API returns 404', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await enrichLead('test@example.com');
      expect(result).toBeNull();
    });

    it('should return null when API returns error', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await enrichLead('test@example.com');
      expect(result).toBeNull();
    });

    it('should return enrichment data on successful API call', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      const mockData: ClearbitEnrichment = {
        name: {
          fullName: 'John Doe',
          givenName: 'John',
          familyName: 'Doe',
        },
        email: 'john@example.com',
        company: {
          name: 'Example Corp',
          domain: 'example.com',
          location: 'San Francisco',
          industry: 'Technology',
          size: 100,
          foundedYear: 2010,
          tags: ['SaaS', 'B2B'],
        },
        employment: {
          title: 'CEO',
          role: 'Executive',
          seniority: 'Executive',
          department: 'Management',
        },
        social: {
          github: 'johndoe',
          linkedin: 'john-doe',
          twitter: 'johndoe',
        },
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await enrichLead('john@example.com');
      expect(result).toEqual(mockData);
    });

    it('should call API with correct endpoint and authorization header', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await enrichLead('test@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://person.clearbit.com/v2/combined/find?email=test%40example.com',
        {
          headers: {
            Authorization: 'Bearer test-key',
          },
        }
      );
    });

    it('should handle network errors gracefully', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await enrichLead('test@example.com');
      expect(result).toBeNull();
    });

    it('should encode email properly in URL', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await enrichLead('test+tag@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test%2Btag%40example.com'),
        expect.any(Object)
      );
    });
  });

  describe('enrichLeads', () => {
    it('should enrich multiple emails in batches', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ email: 'test1@example.com' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ email: 'test2@example.com' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as Response);

      const results = await enrichLeads(['test1@example.com', 'test2@example.com', 'test3@example.com']);

      expect(results.size).toBe(2);
      expect(results.get('test1@example.com')).toBeDefined();
      expect(results.get('test2@example.com')).toBeDefined();
      expect(results.get('test3@example.com')).toBeUndefined();
    });

    it('should process in batches of 10', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      const emails = Array.from({ length: 25 }, (_, i) => `test${i}@example.com`);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ email: 'test@example.com' }),
      } as Response);

      await enrichLeads(emails);

      expect(global.fetch).toHaveBeenCalledTimes(25);
    });

    it('should return empty map for empty email list', async () => {
      const results = await enrichLeads([]);
      expect(results.size).toBe(0);
    });

    it('should not include null results in map', async () => {
      process.env.CLEARBIT_API_KEY = 'test-key';

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ email: 'test1@example.com' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ email: 'test3@example.com' }),
        } as Response);

      const results = await enrichLeads(['test1@example.com', 'test2@example.com', 'test3@example.com']);

      expect(results.size).toBe(2);
      expect(results.has('test2@example.com')).toBe(false);
    });
  });

  describe('isClearbitConfigured', () => {
    it('should return true when API key is set', () => {
      const originalKey = process.env.CLEARBIT_API_KEY;
      process.env.CLEARBIT_API_KEY = 'test-key';

      const result = isClearbitConfigured();
      expect(result).toBe(true);

      process.env.CLEARBIT_API_KEY = originalKey;
    });

    it('should return false when API key is not set', () => {
      const originalKey = process.env.CLEARBIT_API_KEY;
      delete process.env.CLEARBIT_API_KEY;

      const result = isClearbitConfigured();
      expect(result).toBe(false);

      process.env.CLEARBIT_API_KEY = originalKey;
    });

    it('should return false when API key is empty string', () => {
      const originalKey = process.env.CLEARBIT_API_KEY;
      process.env.CLEARBIT_API_KEY = '';

      const result = isClearbitConfigured();
      expect(result).toBe(false);

      process.env.CLEARBIT_API_KEY = originalKey;
    });
  });

  describe('ClearbitEnrichment interface', () => {
    it('should have correct structure', () => {
      const enrichment: ClearbitEnrichment = {
        name: {
          fullName: 'John Doe',
          givenName: 'John',
          familyName: 'Doe',
        },
        email: 'john@example.com',
        company: {
          name: 'Example Corp',
          domain: 'example.com',
          location: 'San Francisco',
          industry: 'Technology',
          size: 100,
          foundedYear: 2010,
          tags: ['SaaS', 'B2B'],
        },
        employment: {
          title: 'CEO',
          role: 'Executive',
          seniority: 'Executive',
          department: 'Management',
        },
        social: {
          github: 'johndoe',
          linkedin: 'john-doe',
          twitter: 'johndoe',
        },
      };

      expect(enrichment.name?.fullName).toBe('John Doe');
      expect(enrichment.email).toBe('john@example.com');
      expect(enrichment.company?.name).toBe('Example Corp');
      expect(enrichment.employment?.title).toBe('CEO');
      expect(enrichment.social?.github).toBe('johndoe');
    });

    it('should allow optional fields to be undefined', () => {
      const enrichment: ClearbitEnrichment = {
        company: {
          name: 'Example Corp',
          domain: 'example.com',
        },
      };

      expect(enrichment.name).toBeUndefined();
      expect(enrichment.email).toBeUndefined();
      expect(enrichment.employment).toBeUndefined();
      expect(enrichment.social).toBeUndefined();
    });
  });
});
