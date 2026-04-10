import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichLinkedIn, enrichLinkedInBatch, LinkedInEnrichment } from './linkedin';

// Mock the clearbit enrichment dependency
vi.mock('./clearbit', () => ({
  enrichLead: vi.fn(),
}));

import { enrichLead } from './clearbit';

describe('linkedin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enrichLinkedIn', () => {
    it('should return null when clearbit data is null', async () => {
      vi.mocked(enrichLead).mockResolvedValue(null);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).toBeNull();
    });

    it('should extract LinkedIn URL from clearbit data', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.linkedinUrl).toBe('https://linkedin.com/in/johndoe');
    });

    it('should extract real name from clearbit data', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        name: {
          fullName: 'John Doe',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.realName).toBe('John Doe');
    });

    it('should extract current role from clearbit data', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          title: 'Software Engineer',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.currentRole).toBe('Software Engineer');
    });

    it('should extract company from clearbit data', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          name: 'Example Corp',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.company).toBe('Example Corp');
    });

    it('should map company size 1-10 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 5,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('1-10');
    });

    it('should map company size 11-50 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 25,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('11-50');
    });

    it('should map company size 51-200 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 100,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('51-200');
    });

    it('should map company size 201-500 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 300,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('201-500');
    });

    it('should map company size 501-1000 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 750,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('501-1000');
    });

    it('should map company size 1001-5000 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 2500,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('1001-5000');
    });

    it('should map company size 5001-10000 correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 7500,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('5001-10000');
    });

    it('should map company size 10000+ correctly', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          size: 15000,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBe('10000+');
    });

    it('should return undefined company size when not provided', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        company: {
          name: 'Example Corp',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.companySize).toBeUndefined();
    });

    it('should set base confidence to 0.7', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(0.7);
    });

    it('should return null when no useful data is available', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        company: {
          name: 'Example Corp',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).toBeNull();
    });

    it('should return enrichment when at least linkedin URL is available', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.linkedinUrl).toBeDefined();
    });

    it('should return enrichment when at least real name is available', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        name: {
          fullName: 'John Doe',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.realName).toBeDefined();
    });

    it('should return enrichment when at least current role is available', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          title: 'Software Engineer',
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.currentRole).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(enrichLead).mockRejectedValue(new Error('API error'));

      const result = await enrichLinkedIn('test@example.com');
      expect(result).toBeNull();
    });

    it('should extract all available fields from clearbit data', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        name: {
          fullName: 'John Doe',
        },
        employment: {
          title: 'Software Engineer',
        },
        company: {
          name: 'Example Corp',
          size: 100,
        },
      } as any);

      const result = await enrichLinkedIn('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.linkedinUrl).toBe('https://linkedin.com/in/johndoe');
      expect(result?.realName).toBe('John Doe');
      expect(result?.currentRole).toBe('Software Engineer');
      expect(result?.company).toBe('Example Corp');
      expect(result?.companySize).toBe('51-200');
      expect(result?.confidence).toBe(0.7);
    });
  });

  describe('enrichLinkedInBatch', () => {
    it('should enrich multiple emails', async () => {
      vi.mocked(enrichLead)
        .mockResolvedValueOnce({
          social: { linkedin: 'https://linkedin.com/in/user1' },
        } as any)
        .mockResolvedValueOnce({
          name: { fullName: 'User Two' },
        } as any)
        .mockResolvedValueOnce(null);

      const results = await enrichLinkedInBatch(['test1@example.com', 'test2@example.com', 'test3@example.com']);

      expect(results.size).toBe(2);
      expect(results.get('test1@example.com')).not.toBeNull();
      expect(results.get('test2@example.com')).not.toBeNull();
      expect(results.get('test3@example.com')).toBeUndefined();
    });

    it('should return empty map for empty email list', async () => {
      const results = await enrichLinkedInBatch([]);
      expect(results.size).toBe(0);
    });

    it('should handle empty array', async () => {
      const results = await enrichLinkedInBatch([]);
      expect(results).toBeInstanceOf(Map);
    });

    it('should not include null results in map', async () => {
      vi.mocked(enrichLead)
        .mockResolvedValueOnce({
          social: { linkedin: 'https://linkedin.com/in/user1' },
        } as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          name: { fullName: 'User Three' },
        } as any);

      const results = await enrichLinkedInBatch(['test1@example.com', 'test2@example.com', 'test3@example.com']);

      expect(results.size).toBe(2);
      expect(results.has('test2@example.com')).toBe(false);
    });
  });

  describe('LinkedInEnrichment interface', () => {
    it('should have correct structure', () => {
      const enrichment: LinkedInEnrichment = {
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        realName: 'John Doe',
        currentRole: 'Software Engineer',
        company: 'Example Corp',
        companySize: '51-200',
        confidence: 0.8,
      };

      expect(enrichment.linkedinUrl).toBe('https://linkedin.com/in/johndoe');
      expect(enrichment.realName).toBe('John Doe');
      expect(enrichment.currentRole).toBe('Software Engineer');
      expect(enrichment.company).toBe('Example Corp');
      expect(enrichment.companySize).toBe('51-200');
      expect(enrichment.confidence).toBe(0.8);
    });

    it('should allow optional fields to be undefined', () => {
      const enrichment: LinkedInEnrichment = {
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        confidence: 0.7,
      };

      expect(enrichment.realName).toBeUndefined();
      expect(enrichment.currentRole).toBeUndefined();
      expect(enrichment.company).toBeUndefined();
      expect(enrichment.companySize).toBeUndefined();
    });
  });
});
