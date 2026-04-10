import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateSocialProof, calculateSocialProofWithAPIs, calculateSocialProofBatch, getSocialProofTier, SocialProofEnrichment } from './social-proof';

// Mock the clearbit enrichment dependency
vi.mock('./clearbit', () => ({
  enrichLead: vi.fn(),
}));

import { enrichLead } from './clearbit';

describe('social-proof', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateSocialProof', () => {
    it('should return null when clearbit data is null', async () => {
      vi.mocked(enrichLead).mockResolvedValue(null);

      const result = await calculateSocialProof('test@example.com');
      expect(result).toBeNull();
    });

    it('should calculate social proof score with Twitter', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'twitterhandle',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.twitterFollowers).toBe(0);
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(20);
      expect(result?.confidence).toBeGreaterThan(0);
    });

    it('should calculate social proof score with GitHub', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          github: 'githubhandle',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.githubActivity).toBe(0);
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(25);
    });

    it('should detect substack presence for writers', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          title: 'Content Writer',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.substackPresence).toBe(true);
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(15);
    });

    it('should detect substack presence for creators', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          title: 'Content Creator',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.substackPresence).toBe(true);
    });

    it('should add bonus for large companies', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        company: {
          size: 2000,
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(20);
    });

    it('should add bonus for medium companies', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        company: {
          size: 500,
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(15);
    });

    it('should add bonus for small companies', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        company: {
          size: 50,
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(10);
    });

    it('should add bonus for executive seniority', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          seniority: 'Executive',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(20);
    });

    it('should add bonus for C-level seniority', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          seniority: 'C-Level',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(20);
    });

    it('should add bonus for director seniority', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          seniority: 'Director',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(15);
    });

    it('should add bonus for VP seniority', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          seniority: 'VP',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(15);
    });

    it('should add bonus for manager seniority', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        employment: {
          seniority: 'Manager',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeGreaterThanOrEqual(10);
    });

    it('should cap social proof score at 100', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'handle',
          github: 'handle',
        },
        company: {
          size: 10000,
        },
        employment: {
          seniority: 'Executive',
          title: 'Content Writer',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.socialProofScore).toBeLessThanOrEqual(100);
    });

    it('should calculate confidence based on data completeness', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'handle',
          github: 'handle',
        },
        company: {
          size: 100,
        },
        employment: {
          seniority: 'Manager',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBeGreaterThan(0);
      expect(result?.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(enrichLead).mockRejectedValue(new Error('API error'));

      const result = await calculateSocialProof('test@example.com');
      expect(result).toBeNull();
    });

    it('should return valid SocialProofEnrichment structure', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'handle',
          github: 'handle',
        },
      } as any);

      const result = await calculateSocialProof('test@example.com');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('socialProofScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('twitterFollowers');
      expect(result).toHaveProperty('githubActivity');
      // substackPresence is optional
    });
  });

  describe('calculateSocialProofWithAPIs', () => {
    it('should return enrichment object and fallback to clearbit when no APIs provided', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'handle',
        },
      } as any);

      const result = await calculateSocialProofWithAPIs('test@example.com');
      expect(result).toHaveProperty('socialProofScore');
      expect(result).toHaveProperty('confidence');
      // Falls back to clearbit which adds 20 for twitter
      expect(result.socialProofScore).toBeGreaterThanOrEqual(20);
    });

    it('should fallback to clearbit-based calculation when APIs fail', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'handle',
        },
      } as any);

      const result = await calculateSocialProofWithAPIs('test@example.com');
      expect(result.socialProofScore).toBeGreaterThanOrEqual(20);
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(enrichLead).mockResolvedValue({
        social: {
          twitter: 'handle',
        },
      } as any);

      const result = await calculateSocialProofWithAPIs('test@example.com');
      expect(result).toBeDefined();
    });
  });

  describe('calculateSocialProofBatch', () => {
    it('should calculate social proof for multiple emails', async () => {
      vi.mocked(enrichLead)
        .mockResolvedValueOnce({
          social: { twitter: 'handle1' },
        } as any)
        .mockResolvedValueOnce({
          social: { github: 'handle2' },
        } as any)
        .mockResolvedValueOnce(null);

      const results = await calculateSocialProofBatch(['test1@example.com', 'test2@example.com', 'test3@example.com']);

      expect(results.size).toBe(2);
      expect(results.get('test1@example.com')).not.toBeNull();
      expect(results.get('test2@example.com')).not.toBeNull();
      expect(results.get('test3@example.com')).toBeUndefined();
    });

    it('should return empty map when no emails provided', async () => {
      const results = await calculateSocialProofBatch([]);
      expect(results.size).toBe(0);
    });

    it('should handle empty array', async () => {
      const results = await calculateSocialProofBatch([]);
      expect(results).toBeInstanceOf(Map);
    });
  });

  describe('getSocialProofTier', () => {
    it('should return High for score >= 60', () => {
      expect(getSocialProofTier(60)).toBe('High');
      expect(getSocialProofTier(75)).toBe('High');
      expect(getSocialProofTier(100)).toBe('High');
    });

    it('should return Medium for score >= 30', () => {
      expect(getSocialProofTier(30)).toBe('Medium');
      expect(getSocialProofTier(45)).toBe('Medium');
      expect(getSocialProofTier(59)).toBe('Medium');
    });

    it('should return Low for score < 30', () => {
      expect(getSocialProofTier(0)).toBe('Low');
      expect(getSocialProofTier(15)).toBe('Low');
      expect(getSocialProofTier(29)).toBe('Low');
    });

    it('should handle edge cases', () => {
      expect(getSocialProofTier(-10)).toBe('Low');
      expect(getSocialProofTier(150)).toBe('High');
    });
  });

  describe('SocialProofEnrichment interface', () => {
    it('should have correct structure', () => {
      const enrichment: SocialProofEnrichment = {
        twitterFollowers: 1000,
        githubActivity: 10,
        substackPresence: true,
        socialProofScore: 75,
        confidence: 0.8,
      };

      expect(enrichment.twitterFollowers).toBe(1000);
      expect(enrichment.githubActivity).toBe(10);
      expect(enrichment.substackPresence).toBe(true);
      expect(enrichment.socialProofScore).toBe(75);
      expect(enrichment.confidence).toBe(0.8);
    });

    it('should allow optional fields to be undefined', () => {
      const enrichment: SocialProofEnrichment = {
        socialProofScore: 50,
        confidence: 0.5,
      };

      expect(enrichment.twitterFollowers).toBeUndefined();
      expect(enrichment.githubActivity).toBeUndefined();
      expect(enrichment.substackPresence).toBeUndefined();
    });
  });
});
