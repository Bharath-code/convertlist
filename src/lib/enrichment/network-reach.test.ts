import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateNetworkReach, getNetworkReachDescription, NetworkReachResult } from './network-reach';

// Mock the calculateSocialProof dependency
vi.mock('./social-proof', () => ({
  calculateSocialProof: vi.fn(),
}));

import { calculateSocialProof } from './social-proof';

describe('network-reach', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateNetworkReach', () => {
    it('should calculate network reach with twitter followers', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 10000,
        githubActivity: 5,
        socialProofScore: 50,
        confidence: 0.7,
      });

      const result = await calculateNetworkReach('test@example.com', 10000, 5);

      expect(result).toBeDefined();
      expect(result.networkReach).toBeGreaterThan(0);
      expect(result.reachScore).toBeGreaterThan(0);
      expect(result.influenceLevel).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should calculate network reach with only twitter followers', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 5000,
        githubActivity: 0,
        socialProofScore: 40,
        confidence: 0.6,
      });

      const result = await calculateNetworkReach('test@example.com', 5000, null);

      expect(result.networkReach).toBe(500); // 5000 * 0.1
      expect(result.reachScore).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.7);
    });

    it('should calculate network reach with only github activity', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 0,
        githubActivity: 10,
        socialProofScore: 30,
        confidence: 0.5,
      });

      const result = await calculateNetworkReach('test@example.com', null, 10);

      expect(result.networkReach).toBe(500); // 10 * 50
      expect(result.reachScore).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.7);
    });

    it('should use social proof data when not provided', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 1000,
        githubActivity: 3,
        socialProofScore: 25,
        confidence: 0.5,
      });

      const result = await calculateNetworkReach('test@example.com', null, null);

      expect(result.networkReach).toBe(250); // (1000 * 0.1) + (3 * 50)
      expect(result.reachScore).toBeGreaterThan(0);
    });

    it('should return zero reach when no data available', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 0,
        githubActivity: 0,
        socialProofScore: 0,
        confidence: 0.3,
      });

      const result = await calculateNetworkReach('test@example.com', null, null);

      expect(result.networkReach).toBe(0);
      expect(result.reachScore).toBe(0);
      expect(result.influenceLevel).toBe('micro');
      expect(result.confidence).toBe(0.3);
    });

    it('should determine mega influence level for high reach score', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 1000000,
        githubActivity: 100,
        socialProofScore: 90,
        confidence: 0.9,
      });

      const result = await calculateNetworkReach('test@example.com', 1000000, 100);

      expect(result.influenceLevel).toBe('mega');
      expect(result.reachScore).toBeGreaterThanOrEqual(70);
    });

    it('should determine macro influence level for medium-high reach score', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 50000,
        githubActivity: 20,
        socialProofScore: 70,
        confidence: 0.8,
      });

      const result = await calculateNetworkReach('test@example.com', 50000, 20);

      expect(result.influenceLevel).toBe('macro');
      expect(result.reachScore).toBeGreaterThanOrEqual(50);
      expect(result.reachScore).toBeLessThan(70);
    });

    it('should determine mid influence level for medium reach score', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 5000,
        githubActivity: 5,
        socialProofScore: 40,
        confidence: 0.6,
      });

      const result = await calculateNetworkReach('test@example.com', 5000, 5);

      expect(result.influenceLevel).toBe('mid');
      expect(result.reachScore).toBeGreaterThanOrEqual(25);
      expect(result.reachScore).toBeLessThan(50);
    });

    it('should determine micro influence level for low reach score', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 100,
        githubActivity: 1,
        socialProofScore: 15,
        confidence: 0.4,
      });

      const result = await calculateNetworkReach('test@example.com', 100, 1);

      expect(result.influenceLevel).toBe('micro');
      expect(result.reachScore).toBeLessThan(25);
    });

    it('should cap reach score at 100', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 10000000,
        githubActivity: 1000,
        socialProofScore: 95,
        confidence: 0.95,
      });

      const result = await calculateNetworkReach('test@example.com', 10000000, 1000);

      expect(result.reachScore).toBeLessThanOrEqual(100);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(calculateSocialProof).mockRejectedValue(new Error('API error'));

      const result = await calculateNetworkReach('test@example.com', 1000, 5);

      expect(result.networkReach).toBe(0);
      expect(result.reachScore).toBe(0);
      expect(result.influenceLevel).toBe('micro');
      expect(result.confidence).toBe(0);
    });

    it('should prioritize provided values over social proof', async () => {
      vi.mocked(calculateSocialProof).mockResolvedValue({
        twitterFollowers: 100,
        githubActivity: 1,
        socialProofScore: 10,
        confidence: 0.3,
      });

      const result = await calculateNetworkReach('test@example.com', 5000, 10);

      expect(result.networkReach).toBe(1000); // (5000 * 0.1) + (10 * 50), not using social proof values
    });
  });

  describe('getNetworkReachDescription', () => {
    it('should return correct description for mega influence', () => {
      const description = getNetworkReachDescription('mega');
      expect(description).toBe('Massive reach - can influence thousands');
    });

    it('should return correct description for macro influence', () => {
      const description = getNetworkReachDescription('macro');
      expect(description).toBe('Strong reach - can influence hundreds');
    });

    it('should return correct description for mid influence', () => {
      const description = getNetworkReachDescription('mid');
      expect(description).toBe('Moderate reach - can influence dozens');
    });

    it('should return correct description for micro influence', () => {
      const description = getNetworkReachDescription('micro');
      expect(description).toBe('Limited reach - niche influence');
    });

    it('should return unknown description for invalid influence level', () => {
      const description = getNetworkReachDescription('invalid');
      expect(description).toBe('Unknown reach');
    });

    it('should return unknown description for empty string', () => {
      const description = getNetworkReachDescription('');
      expect(description).toBe('Unknown reach');
    });
  });

  describe('NetworkReachResult interface', () => {
    it('should have correct structure', () => {
      const result: NetworkReachResult = {
        networkReach: 1000,
        reachScore: 50,
        influenceLevel: 'macro',
        confidence: 0.7,
      };

      expect(result.networkReach).toBe(1000);
      expect(result.reachScore).toBe(50);
      expect(result.influenceLevel).toBe('macro');
      expect(result.confidence).toBe(0.7);
    });
  });
});
